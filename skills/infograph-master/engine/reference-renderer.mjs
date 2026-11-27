import {createHash} from 'node:crypto';
import {compileReference,resolveAnchor,planLinks} from './reference-scene.mjs';
import {previewReferenceSurfaces} from './reference-surface.mjs';
import {mountMechanicalHub,validateWebGLObject} from './reference-webgl.mjs';
import {cameraBasis,projectPoint,projectedObjectPorts} from './reference-geometry.mjs';
import {normalizeLighting3D,directionalKey} from './reference-lighting3d.mjs';
import {directionCSS} from './reference-art-direction.mjs';
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeJSON=x=>JSON.stringify(x).replace(/</g,'\\u003c');
const themes=['brand','partner','external','neutral'];
const zero={dx:0,dy:0,rotation:0,scale:1};
const sha=b=>createHash('sha256').update(b).digest('hex');
export function validateRaster(asset){
 assert(asset&&typeof asset.data==='string'&&asset.data.length<=8_000_000&&typeof asset.source==='string'&&asset.source.trim()&&asset.permission==='cleared','raster provenance/size missing');
 const m=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(asset.data);
 assert(m,'only embedded PNG/JPEG/WebP permitted');const b=Buffer.from(m[2],'base64');
 assert(b.length>0&&b.toString('base64')===m[2]&&sha(b)===asset.sha256,'invalid raster bytes/hash');
 assert(m[1]==='png'?b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):m[1]==='jpeg'?b[0]===255&&b[1]===216:b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP','raster magic mismatch');
 return asset.data;
}
function sceneTransforms(plan,settings){
 const out={};for(const [sid,entries] of Object.entries(settings??{})){
 assert(plan.scenes.some(s=>s.id===sid)&&entries&&typeof entries==='object'&&!Array.isArray(entries),'unknown scene transforms');
 out[sid]={};for(const [id,t] of Object.entries(entries)){
 assert(plan.objects.some(o=>o.id===id&&o.dynamic)&&t&&typeof t==='object'&&!Array.isArray(t)&&Object.keys(t).every(k=>Object.hasOwn(zero,k)),'transform requires dynamic object');
 const v={...zero,...t};assert(Object.values(v).every(Number.isFinite)&&Math.abs(v.dx)<=1&&Math.abs(v.dy)<=1&&Math.abs(v.rotation)<=360&&v.scale>=.1&&v.scale<=4,'invalid transform range');out[sid][id]=v;
 }}return out;
}
const linkLayer=(plan,l)=>Math.min(...[l.from.object,l.to.object].map(id=>plan.objects.find(o=>o.id===id).depth))*2;
const initialStyle=(o,t)=>{const [x,y,w,h]=o.bounds;return 'left:'+((x+t.dx)*100)+'%;top:'+((y+t.dy)*100)+'%;width:'+(w*100)+'%;height:'+(h*100)+'%;z-index:'+(o.depth*2+1)+';transform:rotate('+t.rotation+'deg) scale('+t.scale+')'};
function runtime(p){
 const stage=document.getElementById('ref-stage'),controls=document.getElementById('ref-controls'),status=document.getElementById('ref-status'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 const objects=new Map(p.plan.objects.map(o=>[o.id,o])),elements=new Map(p.plan.objects.map(o=>[o.id,document.getElementById('obj-'+o.id)]));
 const lines=new Map(p.plan.links.map(l=>[l.id,document.getElementById('link-'+l.id)]));
 const glViews=new Map();const neutral={dx:0,dy:0,rotation:0,scale:1},ratio=p.plan.source.width/p.plan.source.height;
 let index=p.plan.scenes.findIndex(s=>s.id===p.initialScene),current=p.transforms[p.initialScene]??{},frame=0,timer=null;
 function draw(ts){current=ts;for(const [id,o] of objects){const t=ts[id]??neutral,el=elements.get(id);el.style.left=(o.bounds[0]+t.dx)*100+'%';el.style.top=(o.bounds[1]+t.dy)*100+'%';el.style.transform='rotate('+t.rotation+'deg) scale('+t.scale+')'}
  const activePlan={...p.plan,objects:p.plan.objects.map(o=>elements.get(o.id).dataset.glState==='ready'?projectedObjectPorts(o,ratio):o)};for(const l of planLinks(activePlan,ts,ratio)){const el=lines.get(l.id);for(const n of el.querySelectorAll('line')){n.setAttribute('x1',l.from[0]*p.plan.source.width);n.setAttribute('y1',l.from[1]*p.plan.source.height);n.setAttribute('x2',l.to[0]*p.plan.source.width);n.setAttribute('y2',l.to[1]*p.plan.source.height)}}
 }
 function go(next,instant=false){
  cancelAnimationFrame(frame);index=Math.max(0,Math.min(p.plan.scenes.length-1,next));const s=p.plan.scenes[index],vis=new Set(s.visible),start=current,end=p.transforms[s.id]??{};
  stage.dataset.scene=s.id;for(const [id,el] of [...elements,...lines])el.toggleAttribute('hidden',!vis.has(id));
  for(const [id,el] of elements)el.classList.toggle('state-emphasis',(p.objectHighlights[s.id]??[]).includes(id));
  for(const el of lines.values())el.classList.toggle('emphasis',(p.highlights[s.id]??[]).includes(el.dataset.id));
  for(const [id,view] of glViews){if(vis.has(id))view.redraw()}
  status.textContent=(index+1)+' / '+p.plan.scenes.length+' · '+s.intent;document.getElementById('ref-prev').disabled=index===0;document.getElementById('ref-next').disabled=index===p.plan.scenes.length-1;
  const duration=instant||motion.matches?0:p.duration;if(!duration){draw(end);return}
  let started=null;const keys=new Set([...Object.keys(start),...Object.keys(end)]);
  function tick(now){started??=now;const f=Math.min(1,(now-started)/duration),u=1-(1-f)**3,ts={};for(const id of keys){const a=start[id]??neutral,b=end[id]??neutral;ts[id]=Object.fromEntries(Object.keys(neutral).map(k=>[k,a[k]+(b[k]-a[k])*u]))}draw(ts);if(f<1)frame=requestAnimationFrame(tick);else draw(end)}
  frame=requestAnimationFrame(tick)
 }
 function stop(){clearInterval(timer);timer=null;document.getElementById('ref-play').textContent='Play';document.getElementById('ref-play').setAttribute('aria-pressed','false')}
 function play(){if(timer!==null){stop();return}if(index===p.plan.scenes.length-1)go(0,true);document.getElementById('ref-play').textContent='Pause';document.getElementById('ref-play').setAttribute('aria-pressed','true');timer=setInterval(()=>{go(index+1);if(index===p.plan.scenes.length-1)stop()},p.interval)}
 document.getElementById('ref-prev').onclick=()=>{stop();go(index-1)};document.getElementById('ref-next').onclick=()=>{stop();go(index+1)};document.getElementById('ref-play').onclick=play;
 document.getElementById('ref-reset').onclick=()=>{stop();go(p.plan.scenes.findIndex(s=>s.id===p.initialScene),true)};document.getElementById('ref-all').onclick=()=>{stop();go(p.plan.scenes.findIndex(s=>s.id===p.plan.staticScene),true)};
 stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();stop();go(index+(e.key==='ArrowLeft'?-1:1))}});
 motion.addEventListener('change',()=>{cancelAnimationFrame(frame);draw(p.transforms[p.plan.scenes[index].id]??{})});
 for(const o of p.plan.objects){const el=elements.get(o.id),canvas=el.querySelector('canvas');if(!canvas)continue;
 const fallback=el.querySelector('.gl-fallback');let view=null;
 function fail(reason){el.dataset.glState='fallback';canvas.hidden=true;fallback.hidden=false;fallback.textContent='3D unavailable — '+reason;view?.dispose();view=null;draw(current)}
 function redraw(){if(!view||el.hidden)return;try{view.draw()}catch{fail('draw failed')}}
 try{view=mountMechanicalHub(canvas,o.material,p.light,o.geometry,p.lighting3d);el.dataset.glState='ready';fallback.hidden=true;canvas.hidden=false;glViews.set(o.id,{redraw});new ResizeObserver(redraw).observe(el)}catch(error){const message=String(error?.message??error);el.dataset.glError=message.slice(0,500);const reason=message==='WebGL unavailable'?'context unavailable':message.includes('stencil')?'stencil unavailable':'initialization failed';el.dataset.glFailure=reason;console.warn('Infograph WebGL initialization:',o.id,message);fail(reason)}
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fail('context lost')});
 }
 controls.hidden=false;go(index,true);
}
const css=String.raw`
*{box-sizing:border-box} [hidden]{display:none!important} body{margin:0;background:#111b22;color:#f1f3f2;font:16px/1.45 system-ui,sans-serif}main{max-width:1450px;margin:auto;padding:clamp(12px,3vw,40px)}header{display:flex;align-items:end;justify-content:space-between;gap:16px;flex-wrap:wrap}h1{font-size:clamp(24px,3.3vw,46px);letter-spacing:-.035em;margin:0}p{margin:8px 0;color:#bcc9ce}.kicker{font-size:12px;letter-spacing:.15em;color:#bdcbd0}.stage{position:relative;width:100%;overflow:hidden;border:1px solid #52636c;border-radius:12px;isolation:isolate;container-type:inline-size;background:#14232b}.object,.link{position:absolute}.object{transform-origin:center;display:grid;place-items:center;text-align:center;overflow:hidden}.gl-object{overflow:visible}.gl-object canvas{width:100%;height:100%;display:block;filter:drop-shadow(0 9px 8px #0008)}.gl-planar-shadow canvas{filter:none}.gl-fallback{position:absolute;inset:15%;background:#233b43;border:1px solid #9eafb4;display:grid;place-items:center;font-size:clamp(9px,1.3cqw,17px);padding:5px;color:#f2e4cc}.object img{width:100%;height:100%;object-fit:fill;display:block}.shape{width:100%;height:100%}.label{padding:2px;color:#fff;font-size:clamp(10px,1.65cqw,23px);font-weight:650;line-height:1.12;overflow-wrap:anywhere}.surface{border:1px solid #9eafb4;border-radius:12%;background:linear-gradient(155deg,#b5c3c8 0%,#61777d 23%,#233b43 24%,#152c35 72%,#4f666d 73%,#92a2a7 100%);box-shadow:inset 0 0 0 5px #142831,0 16px 24px #0008}.surface:after{content:'';width:63%;height:46%;position:absolute;top:16%;left:18%;border:1px solid #b7cacc;background:linear-gradient(135deg,#294a57,#162d39);box-shadow:inset 0 0 16px #050b10}.surface-matte{border:1px solid #879399;background:linear-gradient(145deg,#aab3b6,#818e94);box-shadow:0 6px 12px rgba(0,0,0,var(--matte-shadow,.1)),inset 0 1px 0 rgba(255,255,255,var(--matte-highlight,.08))}.surface-matte:after{display:none}.semantic-object-label{position:absolute;bottom:0;left:0;right:0;padding:3px 4px;background:#f5f3ee;color:#222;font:600 clamp(9px,1.2cqw,15px)/1.15 system-ui;text-align:center;overflow-wrap:anywhere;z-index:3}.object.state-emphasis{outline:2px dashed var(--state-accent,#eac08a);outline-offset:2px}.object svg{width:100%;height:100%}.object[data-role=anchor]{border-radius:8%;border:1px solid var(--accent);background:#182a33;color:#fff;font-size:clamp(9px,1.45cqw,18px);font-weight:600;line-height:1.15;padding:4px;overflow-wrap:anywhere}.object[data-role=anchor] .shape{position:absolute;inset:0;pointer-events:none}.object[data-role=anchor] span{position:relative}.brand{--accent:#a4d4f4}.partner{--accent:#a7d3b7}.external{--accent:#eac08a}.neutral{--accent:#c4d0d3}.link{inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}.link .core{stroke:var(--accent);stroke-width:2.3;stroke-linecap:round}.link .shadow{stroke:#071117;stroke-width:6;stroke-linecap:round}.link.emphasis .core{stroke:#ffb091;stroke-width:4.2}.controls{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:15px 0}.controls button{border:1px solid #71858e;background:#223640;color:#f5f8fa;padding:10px 15px;border-radius:5px;font:inherit;cursor:pointer}.controls button:disabled{opacity:.45;cursor:default}.controls button:focus-visible,.stage:focus-visible,summary:focus-visible{outline:3px solid #efca8c;outline-offset:3px}.status{margin-left:auto;font-size:14px;color:#e6d0ac}.legend{display:flex;flex-wrap:wrap;gap:16px;font-size:13px;margin:12px 0}.legend span{border-left:3px solid var(--accent);padding-left:8px}.note{font-size:13px;color:#c3cbd1}details{border-top:1px solid #44555e;padding-top:12px;margin-top:16px}summary{cursor:pointer}ul{padding-left:20px}.warning{color:#ffd2a4}@media(max-width:600px){.stage{min-height:0}.label,.object[data-role=anchor]{font-size:clamp(8px,1.65cqw,12px);padding:1px}.status{width:100%;margin-left:0}.controls button{padding:8px 10px}.legend{gap:8px}}
`;
export function renderStructuredPrimitives(asset){
 const roles=['surface','metal','accent','warning','line','highlight','none'];
 const color=r=>{assert(roles.includes(r),'invalid primitive role');if(r==='none')return 'none';const c=asset.colors?.[r];assert(/^#[0-9a-f]{6}$/i.test(c??''),'invalid primitive color');return c};
 const n=(v,min=0,max=100)=>{assert(Number.isFinite(v)&&v>=min&&v<=max,'invalid primitive geometry');return v};
 assert(Array.isArray(asset?.shapes)&&asset.shapes.length>0&&asset.shapes.length<=80,'invalid primitive inventory');
 return '<svg class="shape" viewBox="0 0 100 100" aria-hidden="true">'+asset.shapes.map(s=>{
 const a=' fill="'+color(s.fill)+'" stroke="'+color(s.stroke)+'" stroke-width="'+n(s.sw,0,8)+'"';
 if(s.type==='circle')return '<circle cx="'+n(s.cx)+'" cy="'+n(s.cy)+'" r="'+n(s.r,1,50)+'"'+a+'/>';
 if(s.type==='rect'){assert(n(s.x)+n(s.w)<=100&&n(s.y)+n(s.h)<=100,'rectangle overflow');return '<rect x="'+s.x+'" y="'+s.y+'" width="'+s.w+'" height="'+s.h+'" rx="'+n(s.rx,0,20)+'"'+a+'/>'}
 assert(s.type==='path'&&typeof s.d==='string'&&s.d.length<=2000&&/^[MLCQZHVmlcqzhv0-9.,\s-]+$/.test(s.d),'invalid primitive path');
 return '<path d="'+esc(s.d)+'"'+a+'/>';
 }).join('')+'</svg>';
}
export function referenceDesignCSS(design){
 if(design===undefined)return '';
 const c=design.colors??{};
 for(const k of ['background','surface','ink','muted','accent','line','warning'])assert(/^#[0-9a-f]{6}$/i.test(c[k]??''),'invalid design color '+k);
 const fonts={sans:'system-ui,sans-serif',serif:'Georgia,serif',mono:'ui-monospace,monospace'};
 assert(Object.hasOwn(fonts,design.font),'invalid design font');
 assert(Number.isInteger(design.radius)&&design.radius>=0&&design.radius<=24,'invalid design radius');
 return 'body{background:'+c.background+';color:'+c.ink+';font-family:'+fonts[design.font]+'}p,.kicker,.note,.status{color:'+c.muted+'}.stage{background:'+c.surface+';border-color:'+c.line+';border-radius:'+design.radius+'px}.controls button{background:'+c.surface+';color:'+c.ink+';border-color:'+c.line+';border-radius:'+design.radius+'px}.controls button:focus-visible,.stage:focus-visible,summary:focus-visible{outline-color:'+c.accent+'}.label,.object[data-role=anchor]{color:'+c.ink+'}.neutral{--accent:'+c.line+'}.warning{color:'+c.warning+'}details{border-color:'+c.line+'}';
}
export function buildReferenceHTML(manifest,options={}){
 const artCSS=options.referenceDirection===undefined?'':directionCSS(options.referenceDirection);const lighting3d=normalizeLighting3D(options.lighting3d);assert(!options.lighting3d||options.webgl===true,'3D lighting requires WebGL opt-in');
 const assets=options.assets??{},plan=compileReference(manifest,{raster:true,webgl:options.webgl===true}),ratio=plan.source.width/plan.source.height;
 // Project physical attachment points only when the actual adapter is enabled; preserve 2D ports for fallback.
 for(const s of plan.slots.filter(s=>s.renderer==='webgl')){const o=plan.objects.find(o=>o.id===s.id);validateWebGLObject(o);projectedObjectPorts(o,ratio);}
 assert(Number.isFinite(ratio)&&ratio>=.5&&ratio<=3,'unsupported canvas ratio');
 const warnings=[...plan.issues];assert(plan.planningReady||options.allowDegraded===true,'essential renderer unavailable; explicit preview required');
 const transforms=sceneTransforms(plan,options.transforms),highlights=options.highlights??{};
 for(const [sid,ids] of Object.entries(highlights))assert(plan.scenes.some(s=>s.id===sid)&&Array.isArray(ids)&&ids.every(id=>plan.links.some(l=>l.id===id)),'invalid highlight');
 const objectHighlights=options.objectHighlights??{};
 for(const [sid,ids] of Object.entries(objectHighlights))assert(plan.scenes.some(s=>s.id===sid)&&Array.isArray(ids)&&ids.every(id=>plan.objects.some(o=>o.id===id)),'invalid object highlight');
 const initialScene=options.initialScene??plan.staticScene;assert(plan.scenes.some(s=>s.id===initialScene),'invalid initial scene');
 const duration=options.duration??360,interval=options.interval??1500;
 assert(Number.isInteger(duration)&&duration>=0&&duration<=2000&&Number.isInteger(interval)&&interval>=Math.max(400,duration+100)&&interval<=10000,'invalid timing');
 const surfaces=previewReferenceSurfaces(plan,options.light??{});const staticScene=plan.scenes.find(s=>s.id===initialScene),visible=new Set(staticScene.visible),ts=transforms[staticScene.id]??{};
 const theme=o=>themes.includes(o.theme)?o.theme:'neutral';
 const semanticLabels=options.semanticLabels===true;
 const legend=semanticLabels?'': '<div class="legend"><span class="brand">Brand demands</span><span class="partner">Partner demands</span><span class="external">External context</span></div>';
 const objects=plan.slots.map(slot=>{
 const o=plan.objects.find(x=>x.id===slot.id);let inner='',cls='',materialStyle='';
 if(slot.renderer==='raster'){inner='<img alt="'+esc(o.label)+'" src="'+validateRaster(assets[o.id])+'">'}
 else if(slot.renderer==='html'){cls='label';inner=esc(o.label)}
 else if(slot.renderer==='webgl'){validateWebGLObject(o);cls='gl-object'+(lighting3d.shadow?' gl-planar-shadow':'');inner='<canvas aria-hidden="true"></canvas><span class="gl-fallback">3D requires WebGL; schematic fallback</span>'}
 else if(slot.renderer==='css'){cls='surface'+(o.material?.family==='matte'?' surface-matte':'');if(o.material?.family==='matte'){const r=o.material.roughness;assert(Number.isFinite(r)&&r>=0&&r<=1,'invalid matte roughness');materialStyle=';--matte-highlight:'+((1-r)*.16).toFixed(3)+';--matte-shadow:'+((1-r)*.12+.04).toFixed(3)}const s=surfaces.objects.find(x=>x.id===o.id);if(s&&!s.requirementMet)warnings.push({objectId:o.id,severity:o.essential?'blocking':'review',reason:s.unmet.join('; ')});}
 else if(slot.renderer==='svg'&&Object.hasOwn(options.primitiveAssets??{},o.id)){inner=renderStructuredPrimitives(options.primitiveAssets[o.id])}
 else if(slot.renderer==='svg'){inner='<svg class="shape" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="2" y="2" width="96" height="96" rx="8" fill="none" stroke="var(--accent)" stroke-opacity=".5"/></svg>'+(o.role==='anchor'?'<span>'+esc(o.label)+'</span>':'<span class="label">'+esc(o.label)+'</span>')}
 else {assert(false,'unhandled renderer '+slot.renderer)}
 if(semanticLabels&&slot.renderer!=='html')inner+='<span class="semantic-object-label">'+esc(o.label)+'</span>';
 return '<div id="obj-'+o.id+'" class="object '+theme(o)+' '+cls+((objectHighlights[staticScene.id]??[]).includes(o.id)?' state-emphasis':'')+'" data-role="'+o.role+'" data-renderer="'+slot.renderer+'" aria-label="'+esc(o.label)+'" style="'+initialStyle(o,ts[o.id]??zero)+materialStyle+'"'+(visible.has(o.id)?'':' hidden')+'>'+inner+'</div>';
 }).join('');
 assert(!warnings.some(w=>w.severity==='blocking')||options.allowDegraded===true,'essential fidelity unmet; explicit preview required');
 const lines=planLinks(plan,ts,ratio).map(l=>{const spec=plan.links.find(x=>x.id===l.id),from=plan.objects.find(o=>o.id===spec.from.object),coords='x1="'+l.from[0]*plan.source.width+'" y1="'+l.from[1]*plan.source.height+'" x2="'+l.to[0]*plan.source.width+'" y2="'+l.to[1]*plan.source.height+'"';
 return '<svg id="link-'+l.id+'" data-id="'+l.id+'" class="link '+theme(from)+((highlights[staticScene.id]??[]).includes(l.id)?' emphasis':'')+'" style="z-index:'+linkLayer(plan,spec)+'" viewBox="0 0 '+plan.source.width+' '+plan.source.height+'" aria-hidden="true"'+(visible.has(l.id)?'':' hidden')+'><line class="shadow" '+coords+'/><line class="core" '+coords+'/></svg>'}).join('');
 const title=esc(options.title??'Reference reconstruction'),description=esc(options.description??'Illustrative qualitative scene; no measured forces.');
 const data={plan,transforms,highlights,objectHighlights,initialScene,duration,interval,light:surfaces.lighting,lighting3d};
 const summary=plan.objects.filter(o=>o.essential).map(o=>'<li>'+esc(o.label)+'</li>').join(''),relations=plan.links.map(l=>'<li>'+esc(plan.objects.find(o=>o.id===l.from.object).label)+' — '+esc(plan.objects.find(o=>o.id===l.to.object).label)+'</li>').join('');
 const issues=warnings.map(w=>'<li>'+esc(w.objectId??'Scene')+': '+esc(w.reason)+'</li>').join('');
 const script='const directionalKey='+directionalKey.toString()+';const cameraBasis='+cameraBasis.toString()+';const projectPoint='+projectPoint.toString()+';const projectedObjectPorts='+projectedObjectPorts.toString()+';const mountMechanicalHub='+mountMechanicalHub.toString()+';const requireThat=(ok,msg)=>{if(!ok)throw Error(msg)};const resolveAnchor='+resolveAnchor.toString()+';const planLinks='+planLinks.toString()+';('+runtime.toString()+')('+safeJSON(data)+');';
 const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>'+css+artCSS+referenceDesignCSS(options.designDNA)+'</style><main><header><div><div class="kicker">INFOGRAPH / REFERENCE SCENE LAB</div><h1>'+title+'</h1><p>'+description+'</p></div></header><section id="ref-stage" class="stage" style="aspect-ratio:'+plan.source.width+'/'+plan.source.height+'" tabindex="0" aria-label="Operating scene; use arrow keys to navigate" data-scene="'+staticScene.id+'">'+lines+objects+'</section><div class="controls" id="ref-controls" hidden><button id="ref-prev">Previous</button><button id="ref-next">Next</button><button id="ref-play" aria-pressed="false">Play</button><button id="ref-reset">Reset</button><button id="ref-all">Show all</button><span id="ref-status" class="status" aria-live="polite"></span></div>'+legend+'<p class="note">Qualitative metaphor. Geometry and motion are illustrative, not measured force. WebGL, if enabled, uses opaque primitive assemblies, optional LDR environment texture and planar directional shadows, and projected 3D anchors; not optical simulation or measured force.</p>'+(issues?'<details open class="warning"><summary>Preview limitations</summary><ul>'+issues+'</ul></details>':'')+'<details><summary>Accessible scene inventory and links</summary><ul>'+summary+relations+'</ul></details><noscript><p>Static full scene shown. Interactive playback requires JavaScript.</p></noscript></main><script>'+script+'</script></html>';
 return {html,report:{renderedHTML:true,browserVerified:false,releaseReady:false,planIssues:warnings,objectCount:plan.objects.length,linkCount:plan.links.length,sceneCount:plan.scenes.length,artDirection:options.referenceDirection??null,lighting3d:{environment:lighting3d.environment?{sha256:lighting3d.environment.sha256,source:lighting3d.environment.source}:null,planarShadow:!!lighting3d.shadow,keyElevation:lighting3d.keyElevation},renderers:[...new Set(plan.slots.map(s=>s.renderer))],scope:'HTML/SVG/CSS/embedded raster; optional restricted WebGL opaque primitive with direct BRDF approximation; no aesthetic certification'}};
}
