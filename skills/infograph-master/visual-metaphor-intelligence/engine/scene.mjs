import {compileDynamicBindings,evaluateBindings} from "./dynamic-binding.mjs";
import {compareConcepts} from "./creative.mjs";
import {validateSurfaceScene,surfaceGradient} from "./surface-rendering.mjs";
import {compilePhysicalGeometry} from "./physical-geometry.mjs";
import {compilePhysicalTopology} from "./physical-topology.mjs";
import {applySceneComposition} from "./scene-composition.mjs";

import {styleIssues,sceneDimensions,validSceneBox} from './scene-contract.mjs';

export function adaptDesignDNA(style,concept){
 const issues=styleIssues(style,concept);
 if(issues.length)throw Error(issues[0].message);
 return {...style,contrastScope:"declared solid tokens only; actual composited render requires inspection"};
}

export function compileScene({target,concept,review,objects,ontology,style,scene}){
 const validation=compareConcepts(target,[concept],objects,ontology,[review]);
 if(!validation.results[0].eligible)throw Error("P3 concept review blocked");
 const design=adaptDesignDNA(style,concept),txt=x=>typeof x==="string"&&x.trim().length>0;
 if(!scene||scene.conceptId!==concept.id||scene.revision!==concept.revision||!txt(scene.title)||!txt(scene.subtitle)||!txt(scene.staticSummary))throw Error("scene provenance");
 if(concept.panels.length!==1||!["direct","transform","substitute","combine"].includes(concept.operation))throw Error("unsupported scene scope: route to reference reconstruction or specialist");
 scene=compilePhysicalGeometry(scene,concept,objects);
 const mappings=concept.bindings.map(b=>({id:b.targetEdge,from:b.fromObject,to:b.toObject,relation:target.edges.find(e=>e.id===b.targetEdge).predicate,meaning:b.interpretation,sourceId:b.sourceId,sourceEdge:b.sourceEdge}));
 const nodeLabels=new Map(target.nodes.map(n=>[n.id,n.label]));
 const composition=applySceneComposition(scene,mappings,Object.fromEntries(concept.sceneObjects.map(o=>[o.id,nodeLabels.get(o.targetNode)])));
 scene=composition.scene;
 if(!Array.isArray(scene.layers)||!scene.layers.length||new Set(scene.layers.map(l=>l.id)).size!==scene.layers.length)throw Error("scene layers required");
 const supported=scene.layers.every(l=>l.renderer==="svg"&&l.essential===true);
 if(!supported)throw Error("unsupported renderer or optional degradation: route to reference reconstruction; no silent fallback");
 const layerIds=new Set(scene.layers.map(l=>l.id)),shapeRoles=new Set(["surface","metal","accent","warning","line","highlight","none"]);
 const byId=new Map(concept.sceneObjects.map(x=>[x.id,x])),tn=new Map(target.nodes.map(x=>[x.id,x])),seen=new Set();
 if(!Array.isArray(scene.objects)||scene.objects.length!==byId.size)throw Error("scene object coverage");
 const checkNum=(v,min,max)=>typeof v==="number"&&Number.isFinite(v)&&v>=min&&v<=max;
 const dims=sceneDimensions;
 for(const o of scene.objects){
  if(!byId.has(o.id)||seen.has(o.id)||!layerIds.has(o.layer)||!txt(o.caption)||!txt(o.detail)||!Array.isArray(o.shapes)||!o.shapes.length||o.shapes.length>80)throw Error("invalid scene object");
  seen.add(o.id);
  for(const k of Object.keys(dims))if(!validSceneBox(o[k],dims[k])){const [W,H]=dims[k];throw Error(`invalid ${k} box: scene.objects[${scene.objects.indexOf(o)}].${k} (id=${o.id}); received ${JSON.stringify(o[k])??"missing"}; expected [x,y,w,h], x/y>=0, w/h>=36, x+w<=${W}, y+h<=${H-28} (28px label reserve). For 2–6 objects with no authored waypoints, consider scene.composition={version:1,mode:"auto",focalObject,ref,intent} and remove both tiers of authored coordinates from every object.`)}
  for(const s of o.shapes){
   if(!shapeRoles.has(s.fill)||!shapeRoles.has(s.stroke)||!checkNum(s.sw,0,8))throw Error("invalid primitive style");
   if(s.type==="circle"){if(![s.cx,s.cy].every(v=>checkNum(v,0,100))||!checkNum(s.r,1,50))throw Error("invalid circle")}
   else if(s.type==="rect"){if(![s.x,s.y,s.w,s.h].every(v=>checkNum(v,0,100))||s.x+s.w>100||s.y+s.h>100||!checkNum(s.rx,0,20))throw Error("invalid rectangle")}
   else if(s.type==="path"){if(typeof s.d!=="string"||s.d.length>2000||!/^[MLCQZHVmlcqzhv0-9.,\s-]+$/.test(s.d))throw Error("invalid path")}
   else throw Error("unsupported primitive");
  }
 }
 const states=concept.operation==="transform"?concept.states:[{id:"base",label:"概念示意",evidenceKind:concept.evidenceKind,evidenceRef:concept.evidenceRef}];
 if(!Array.isArray(scene.states)||scene.states.length!==states.length||new Set(scene.states.map(x=>x.id)).size!==states.length)throw Error("state coverage");
 const stateMap=new Map(states.map(x=>[x.id,x]));
 for(const s of scene.states){if(!stateMap.has(s.id)||!txt(s.label)||!txt(s.explanation)||!Array.isArray(s.highlight)||new Set(s.highlight).size!==s.highlight.length||s.highlight.some(id=>!byId.has(id)))throw Error("invalid state");const transition=concept.transitions?.find(t=>t.to===s.id);if(transition&&s.highlight.some(id=>!transition.changedObjects.includes(id)))throw Error("state highlights violate transition contract")}
 if(!stateMap.has(scene.initialState))throw Error("invalid initial state");
 const edgeIds=new Set(concept.bindings.map(b=>b.targetEdge));
 for(const [k,rs] of Object.entries(scene.waypoints??{})){if(!Object.hasOwn(dims,k)||!rs||typeof rs!=="object")throw Error("invalid routing layout");for(const [id,pts] of Object.entries(rs)){if(!edgeIds.has(id)||!Array.isArray(pts)||pts.length>8||pts.some(q=>!Array.isArray(q)||q.length!==2||!q.every((v,i)=>checkNum(v,0,dims[k][i]))))throw Error("invalid routing waypoint")}}

 const semantic={conceptId:concept.id,revision:concept.revision,targetId:target.id,evidenceKind:concept.evidenceKind,evidenceRef:concept.evidenceRef,boundary:concept.boundary,objects:concept.sceneObjects.map(o=>({id:o.id,targetNode:o.targetNode,anchors:o.anchors,label:tn.get(o.targetNode).label})),mappings,states:states.map(s=>({id:s.id,evidenceKind:s.evidenceKind,evidenceRef:s.evidenceRef})),transitions:concept.transitions??[]};
 const topology=compilePhysicalTopology(scene,mappings);
 const surfaceRendering=validateSurfaceScene(scene,concept);
 const dynamic=compileDynamicBindings(scene.dynamicBindings,{...scene,surfaceRendering});
 return {design,scene,semantic,surfaceRendering,dynamic,geometryManifest:scene.geometryManifest??[],compositionManifest:composition.manifest,topology,plainAlternative:concept.plainAlternative,reviewRef:review.ref,capabilities:{svg:"implemented",html:"implemented",raster:"route-existing-reference-renderer",webgl:"route-existing-reference-webgl",canvas:"specialist-not-implemented"},releaseAuthorized:false,scope:"one-panel authored SVG primitives with optional vector materials and qualitative part poses; no physical simulation or independent visual approval"};
}

export function renderSceneHTML(plans){
 if(!Array.isArray(plans)||plans.length<1||plans.length>4)throw Error("one to four compiled variants required");
 const first=plans[0],same=x=>JSON.stringify(x.semantic)===JSON.stringify(first.semantic);
 if(!plans.every(same)||new Set(plans.map(p=>p.design.id)).size!==plans.length)throw Error("variant semantic drift");
 const e=x=>String(x).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
 const c=first.scene,sem=first.semantic;
 if(!plans.every(p=>JSON.stringify(p.scene)===JSON.stringify(c)))throw Error("this controlled renderer requires identical scene geometry");
 const colors=first.design.colors;
 const fontMap={sans:'system-ui, sans-serif',serif:'Georgia, "Noto Serif CJK SC", serif',mono:'ui-monospace, monospace'};
 const themes=plans.map(p=>{const d=p.design;return `body[data-style="${e(d.id)}"]{${Object.entries(d.colors).map(([k,v])=>`--${k}:${v}`).join(";")};--font:${fontMap[d.font]};--radius:${d.radius}px;--duration:${d.motionMs}ms;--shadow:${d.depth==="soft"?"0 12px 30px #0003":"none"}}`}).join("\n");
 const role=x=>x==="none"?"none":`var(--${x})`;
 function shape(s,fill=role(s.fill)){const a=`fill="${fill}" stroke="${role(s.stroke)}" stroke-width="${s.sw}" stroke-linejoin="round" stroke-linecap="round"`;return s.type==="circle"?`<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" ${a}/>`:s.type==="rect"?`<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx}" ${a}/>`:`<path d="${e(s.d)}" ${a}/>`}
 function graph(k,W,H){
  const loc=new Map(c.objects.map(o=>[o.id,o[k]]));
  const connections=sem.mappings.map(m=>{
   const pipe=first.topology?.find(t=>t.edgeId===m.id);
   if(pipe){const route=pipe.routes[k];return `<g data-edge="${e(m.id)}" data-pipe="true" data-from-port="${e(pipe.fromPort)}" data-to-port="${e(pipe.toPort)}"><path data-pipe-path="true" class="pipe-body" d="${e(route.d)}"/><path class="pipe-core" d="${e(route.d)}"/><path class="pipe-direction" d="${e(route.arrow)}" marker-end="url(#arrow-${k})"/></g>`}
   const compiled=first.compositionManifest?.candidates.find(x=>x.id===first.compositionManifest.selectedId)?.symbolic?.[k]?.find(x=>x.id===m.id);
   if(compiled)return `<path class="link" data-edge="${e(m.id)}" data-symbolic-route="true" d="${e(compiled.d)}" marker-end="url(#arrow-${k})"/>`;
   const a=loc.get(m.from),b=loc.get(m.to),ax=a[0]+a[2]/2,ay=a[1]+a[3]/2,bx=b[0]+b[2]/2,by=b[1]+b[3]/2,dx=bx-ax,dy=by-ay;
   const pts=c.waypoints?.[k]?.[m.id]??[],q=pts[0]??[bx,by],z=pts.at(-1)??[ax,ay];const ray=(x,y,box,other,pad)=>{const vx=other[0]-x,vy=other[1]-y,scale=1/Math.max(Math.abs(vx)/(box[2]/2+pad),Math.abs(vy)/(box[3]/2+pad));if(!Number.isFinite(scale))throw Error("degenerate connector");return [x+vx*scale,y+vy*scale]};const points=[ray(ax,ay,a,q,7),...pts,ray(bx,by,b,z,9)];
   return `<path class="link" data-edge="${e(m.id)}" d="${points.map((q,i)=>(i?"L":"M")+q.join(" ")).join(" ")}" marker-end="url(#arrow-${k})"/>`}).join("");
  const gradients=[],surface=first.surfaceRendering;
  function renderPart(o,s,i){
   const p=surface?.parts.find(x=>x.objectId===o.id&&x.shapeIndex===i),motion=surface?.motions.find(x=>x.objectId===o.id&&x.shapeIndex===i);
   let fill=role(s.fill);
   if(p){const id='vmi-material-'+k+'-'+c.objects.indexOf(o)+'-'+i;gradients.push(surfaceGradient(p.material,s.fill,id));fill='url(#'+id+')'}
   let markup=shape(s,fill);
   const bindings=first.dynamic?.spec.bindings.filter(b=>b.objectId===o.id&&b.shapeIndex===i)??[];
   for(const b of bindings){const v=first.dynamic.initial.outputs.find(x=>x.id===b.id).value;if(b.property==='liquidHeight')markup=markup.replace('<rect ',`<rect data-binding="${e(b.id)}" data-bottom="${s.y+s.h}" `).replace(`y="${s.y}"`,`y="${s.y+s.h-v}"`).replace(`height="${s.h}"`,`height="${v}"`);else markup=`<g data-binding="${e(b.id)}" ${b.property==='opacity'?`opacity="${v}"`:`transform="rotate(${v} ${b.pivot.join(' ')})"`}>${markup}</g>`;}
   if(!motion)return markup;
   const angle=motion.angles[c.initialState],pivot=motion.pivot;
   return '<g data-motion-object="'+e(o.id)+'" data-motion-index="'+i+'" transform="rotate('+angle+' '+pivot.join(' ')+')" style="transform-box:view-box;transform-origin:'+pivot[0]+'px '+pivot[1]+'px;transform:rotate('+angle+'deg)">'+markup+'</g>';
  }
  const obs=c.objects.map(o=>{const [x,y,w,h]=o[k],label=sem.objects.find(a=>a.id===o.id).label;return `<g data-object="${e(o.id)}"${o.geometry?` data-geometry="${e(o.geometry.kind)}"`:""} class="object"><rect class="halo" x="${x-4}" y="${y-4}" width="${w+8}" height="${h+8}" rx="10"/><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 100 100">${o.shapes.map((s,i)=>renderPart(o,s,i)).join("")}</svg><text x="${x+w/2}" y="${y+h+19}" class="object-label">${e(label)}</text></g>`}).join("");
  return `<svg class="scene ${k}"${first.compositionManifest?` data-composition="${e(first.compositionManifest.selectedId)}"`:""} viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(c.staticSummary)}"><defs><marker id="arrow-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--line)"/></marker>${gradients.join("")}</defs>${connections}${obs}</svg>`;
 }
 const stateData=c.states.map(s=>({id:s.id,label:s.label,explanation:s.explanation,highlight:s.highlight}));
 const initial=stateData.find(s=>s.id===c.initialState);
 const cards=c.objects.map(o=>`<button disabled class="inspect" data-focus="${e(o.id)}" aria-pressed="false"><strong>${e(sem.objects.find(x=>x.id===o.id).label)}</strong><span>${e(o.caption)}</span></button><div class="detail" data-detail="${e(o.id)}" hidden>${e(o.detail)}</div>`).join("");
 const relationText=sem.mappings.map(m=>`<li data-relation="${e(m.id)}">${e(sem.objects.find(o=>o.id===m.from).label)} → ${e(sem.objects.find(o=>o.id===m.to).label)} <small>${e(m.relation)}</small></li>`).join("");
 const dynamicLiteral=JSON.stringify(first.dynamic??null).replace(/</g,'\\u003c').replace(/&/g,'\\u0026');
 const dynamicControls=first.dynamic?`<section class="panel"><h2>业务情景模拟</h2><p>${e(first.dynamic.spec.boundary)}</p>${first.dynamic.spec.inputs.map(i=>`<label style="display:block">${e(i.label)} (${e(i.unit)}) <output data-input-value="${e(i.id)}">${i.initial}</output><input disabled style="display:block;width:100%" type="range" data-dynamic-input="${e(i.id)}" min="${i.min}" max="${i.max}" step="${i.step}" value="${i.initial}"></label>`).join('')}<p id="dynamic-error" role="status"></p></section>`:'';
 const motionLiteral=JSON.stringify(first.surfaceRendering?.motions??[]).replace(/</g,"\\u003c").replace(/&/g,"\\u0026");
 const literal=JSON.stringify(stateData).replace(/</g,"\\u003c").replace(/&/g,"\\u0026");
 return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(c.title)}</title><style>
*{box-sizing:border-box}body{margin:0;font:16px/1.6 var(--font);background:var(--background);color:var(--ink)}${themes}
main{max-width:1120px;margin:auto;padding:clamp(16px,4vw,48px)}header{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;flex-wrap:wrap}h1{font-size:clamp(25px,4vw,44px);line-height:1.15;margin:6px 0 10px}h2{font-size:18px;margin:0 0 12px}p{margin:0 0 12px}.kicker,small{color:var(--muted);font-size:12px;letter-spacing:.06em}.controls{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}button{font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--line);padding:8px 14px;border-radius:var(--radius);cursor:pointer}button[aria-pressed=true]{border:2px solid var(--accent);padding:7px 13px;box-shadow:inset 0 -3px var(--accent)}button:focus-visible{outline:3px solid var(--warning);outline-offset:3px}button:disabled{cursor:default}.layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(220px,1fr);gap:16px}.panel{min-width:0;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px;box-shadow:var(--shadow)}.scene{display:block;width:100%;height:auto;overflow:visible}.mobile{display:none}.link{stroke:var(--line);stroke-width:1.5;stroke-dasharray:5 5;fill:none}.pipe-body,.pipe-core,.pipe-direction{fill:none;stroke-linejoin:round;stroke-linecap:round}.pipe-body{stroke:var(--line);stroke-width:7}.pipe-core{stroke:var(--metal);stroke-width:4}.pipe-direction{stroke:var(--ink);stroke-width:1.7}.object-label{fill:var(--ink);font:600 13px var(--font);text-anchor:middle}.scene [data-motion-object]{transition:transform var(--duration) ease-in-out}.halo{fill:none;stroke:transparent;stroke-width:2;transition:stroke var(--duration)}.object.is-state .halo{stroke:var(--warning);stroke-dasharray:5 3}.object.is-focus .halo{stroke:var(--accent);stroke-width:3;stroke-dasharray:none}.inspect{display:block;width:100%;text-align:left;margin:6px 0}.inspect span{display:block;font-size:13px;color:var(--muted)}.detail{padding:8px 12px;color:var(--ink)}.status{border-left:3px solid var(--warning);padding-left:12px;margin:12px 0}.proof{margin-top:16px}.proof summary{cursor:pointer}.proof ul{padding-left:20px}.proof li{margin-bottom:8px}footer{margin-top:14px;color:var(--muted);font-size:13px}.state-static{margin-top:12px}.state-static li{margin-bottom:8px}@media(max-width:760px){.layout{grid-template-columns:1fr}.desktop{display:none}.mobile{display:block}.panel{padding:12px}.object-label{font-size:12px}}@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
</style></head><body data-style="${e(first.design.id)}"><main><header><div><div class="kicker">VMI / P4 · QUALITATIVE SCENE</div><h1>${e(c.title)}</h1><p>${e(c.subtitle)}</p></div><div aria-label="艺术方向" class="controls">${plans.map((p,i)=>`<button disabled data-style-choice="${e(p.design.id)}" aria-pressed="${i===0}">${e(p.design.id)}</button>`).join("")}</div></header><div class="controls" aria-label="示意状态">${stateData.map(s=>`<button disabled data-state="${e(s.id)}" aria-pressed="${s.id===initial.id}">${e(s.label)}</button>`).join("")}</div>${dynamicControls}<div class="layout"><section class="panel"><div class="kicker">机制示意 / NOT TO SCALE</div>${graph("desktop",800,440)}${graph("mobile",360,620)}<div class="status" aria-live="polite"><strong id="state-label">${e(initial.label)}</strong><p id="state-copy">${e(initial.explanation)}</p></div></section><aside class="panel"><h2>对象检视</h2><p class="kicker">点击对象名称，保持当前状态不变。</p>${cards}<button disabled id="clear-focus">清除检视</button><details class="proof"><summary>关系与证据</summary><ul>${relationText}</ul><p>证据状态：${e(sem.evidenceKind)} · ${e(sem.evidenceRef)}</p><p>普通表达：${e(first.plainAlternative)}</p></details></aside></div><details class="proof panel state-static"><summary>静态状态对照（无需动画）</summary><ul>${stateData.map(s=>`<li><strong>${e(s.label)}</strong>：${e(s.explanation)}</li>`).join("")}</ul></details><footer>定性类比，不代表测量值或实际物理仿真。${e(sem.boundary)}。${e(conceptBoundary(first))}</footer><noscript><p>交互不可用；初始图及静态状态对照仍可阅读。</p></noscript></main><script>const states=${literal},motions=${motionLiteral};let state=${JSON.stringify(initial.id).replace(/</g,"\\u003c")},focus=null;const all=s=>Array.from(document.querySelectorAll(s));function update(){const a=states.find(s=>s.id===state);document.querySelector("#state-label").textContent=a.label;document.querySelector("#state-copy").textContent=a.explanation;all("[data-state]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.state===state)));all("[data-motion-object]").forEach(g=>{const m=motions.find(x=>x.objectId===g.dataset.motionObject&&x.shapeIndex===Number(g.dataset.motionIndex));if(m){g.setAttribute("transform","rotate("+m.angles[state]+" "+m.pivot.join(" ")+")");g.style.transform="rotate("+m.angles[state]+"deg)"}});all("[data-object]").forEach(g=>{g.classList.toggle("is-state",a.highlight.includes(g.dataset.object));g.classList.toggle("is-focus",focus===g.dataset.object)});all("[data-focus]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.focus===focus)));all("[data-detail]").forEach(d=>d.hidden=d.dataset.detail!==focus)}all("button").forEach(b=>b.disabled=false);all("[data-style-choice]").forEach(b=>b.onclick=()=>{document.body.dataset.style=b.dataset.styleChoice;all("[data-style-choice]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)))});all("[data-state]").forEach(b=>b.onclick=()=>{state=b.dataset.state;update()});all("[data-focus]").forEach(b=>b.onclick=()=>{focus=b.dataset.focus===focus?null:b.dataset.focus;update()});document.querySelector("#clear-focus").onclick=()=>{focus=null;update()};update();const dynamic=${dynamicLiteral};const evaluateBindings=${evaluateBindings.toString()};if(dynamic){const inputs=all("[data-dynamic-input]");let last=dynamic.initial;function refresh(values){try{const next=evaluateBindings(dynamic.spec,values??Object.fromEntries(inputs.map(i=>[i.dataset.dynamicInput,Number(i.value)])));for(const b of dynamic.spec.bindings){const v=next.outputs.find(o=>o.id===b.id).value;for(const g of all("[data-binding]").filter(g=>g.dataset.binding===b.id)){if(b.property==="opacity")g.setAttribute("opacity",v);else if(b.property==="rotate")g.setAttribute("transform","rotate("+v+" "+b.pivot.join(" ")+")");else{g.setAttribute("height",v);g.setAttribute("y",Number(g.dataset.bottom)-v)}}}last=next;for(const i of inputs)i.value=last.values[i.dataset.dynamicInput];for(const o of all("[data-input-value]"))o.textContent=last.values[o.dataset.inputValue];document.querySelector("#dynamic-error").textContent="";return true}catch(e){for(const i of inputs)i.value=last.values[i.dataset.dynamicInput];document.querySelector("#dynamic-error").textContent="输入无法计算，已保留上次有效状态。";return false}}for(const i of inputs){i.disabled=false;i.addEventListener("input",()=>refresh())}if(window.parent!==window){let revision=-1;window.addEventListener("message",event=>{const m=event.data;if(event.source!==window.parent||!m||m.type!=="ig:vmi:inputs:v1"||!Number.isSafeInteger(m.revision)||m.revision<0||m.revision<=revision)return;const v=m.values,keys=dynamic.spec.inputs.map(i=>i.id);if(!v||typeof v!=="object"||Array.isArray(v)||Object.keys(v).length!==keys.length||!keys.every(k=>Object.hasOwn(v,k)&&typeof v[k]==="number"&&Number.isFinite(v[k])))return;const ok=refresh(v);if(ok){revision=m.revision;for(const i of inputs)i.disabled=true}window.parent.postMessage({type:"ig:vmi:ack:v1",revision:m.revision,ok},"*")});window.parent.postMessage({type:"ig:vmi:ready:v1"},"*")}};</script></body></html>`;
 function conceptBoundary(p){return "当前为可交互 SVG 原型，未验证真实物理或独立理解效果。"}
}
