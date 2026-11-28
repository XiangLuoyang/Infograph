// Deterministic assembly of verified engine outputs, not arbitrary HTML rewriting.
import {spatialCSS} from '../skills/infograph-master/engine/global-spatial-composition.mjs';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
const ensure=(b,m)=>{if(!b)throw Error(m)};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const marker=id=>'<!--IG:'+id+'-->';
// Embedded visual inheritance is a deterministic transform of verified ART and VMI outputs.
export function embeddedDesign(direction){
 const p=direction.palette,t=direction.typography,g=direction.geometry;
 const ensure=(b,m)=>{if(!b)throw Error(m)};
 const hex=x=>typeof x==='string'&&/^#[0-9a-f]{6}$/i.test(x);
 const bounded=(x,min,max)=>Number.isFinite(x)&&x>=min&&x<=max;
 const font={serif:'Georgia,"Noto Serif CJK SC","Songti SC",serif',sans:'system-ui,"Noto Sans CJK SC","Microsoft YaHei",sans-serif'};
 ensure(typeof direction.id==='string'&&/^[a-z0-9-]+$/.test(direction.id),'invalid art direction id');
 const colors={background:p.canvas,surface:p.surface,ink:p.text,muted:p.muted,accent:p.accent,warning:p.warning,line:p.controlBorder,metal:p.line,highlight:p.surface};
 ensure(Object.values(colors).every(hex),'invalid inherited color');
 ensure(Object.hasOwn(font,t.body)&&Object.hasOwn(font,t.heading)&&bounded(t.bodyPx,12,24)&&bounded(t.notePx,10,22)&&bounded(t.headingPx,14,48)&&bounded(t.lineHeight,1.2,2)&&bounded(g.spacing,8,48)&&bounded(g.radius,0,24),'invalid inherited typography or geometry');
 const luminance=h=>h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
 const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
 ensure(['ink','muted'].every(k=>['background','surface'].every(bg=>contrast(colors[k],colors[bg])>=4.5))&&['accent','warning','line'].every(k=>contrast(colors[k],colors.surface)>=3),'inherited contrast failed');
 const vars=Object.entries(colors).map(([k,v])=>'--'+k+':'+v).join(';');
 const css='body[data-style]{'+vars+';--font:'+font[t.body]+';--radius:'+g.radius+'px;--shadow:none;font:'+t.bodyPx+'px/'+t.lineHeight+' var(--font)}\n'
 +'main{max-width:none;padding:clamp(8px,2vw,'+g.spacing+'px)}header{gap:8px}h1,h2{font-family:'+font[t.heading]+'}h1{font-size:'+t.headingPx+'px;line-height:1.25;margin:0 0 6px}h2{font-size:'+Math.max(t.bodyPx+2,16)+'px}.kicker,small,footer{font-size:'+t.notePx+'px}.controls{margin:8px 0;gap:6px}.layout{gap:12px;grid-template-columns:minmax(0,3fr) minmax(180px,1fr)}.panel{padding:clamp(8px,1.5vw,'+g.spacing+'px)}button{padding:6px 10px}button[aria-pressed=true]{padding:5px 9px}.inspect span{font-size:'+t.notePx+'px}header .controls[aria-label="艺术方向"],header .kicker{display:none}.proof{margin-top:8px}@media(max-width:760px){.layout{grid-template-columns:1fr}}';
 return {id:direction.id,colors,bodyPx:t.bodyPx,headingPx:t.headingPx,radius:g.radius,bodyFont:font[t.body],headingFont:font[t.heading],css,scope:'opaque palette, typography, density, geometry; decorative material shapes remain scene-owned'};
}
export function embedVerifiedScene(html,direction){
 if(!direction)return {html,design:null};
 const design=embeddedDesign(direction),end='</style></head>';
 if(typeof html!=='string'||html.split(end).length!==2)throw Error('unexpected canonical VMI preview document');
 return {html:html.replace(end,()=>'\n</style><style data-ig-inherited="'+design.id+'">'+design.css+end),design};
}
export function integrationContract(stages){
 const art=stages['production-plan']?.artDirection,spatial=stages['specialist-plan']?.outputs?.QD05,vmi=stages['vmi-packet'];
 const slots=[],runtime={art:null,spatial:null,vmi:[]};
 const style=(id,css)=>{ensure(typeof css==='string'&&!/<\/style/i.test(css),'invalid generated stylesheet');slots.push({id,kind:'style',fragment:'<style data-ig-engine="'+id+'">'+css+'</style>'})};
 if(art){
  style('ART',art.css);
  runtime.art={id:art.selected.id,palette:art.selected.palette,css:art.css};
 }
 if(spatial?.layouts?.some(l=>l.composition)){
  style('SPATIAL',spatialCSS(spatial));
  runtime.spatial={css:spatialCSS(spatial),tiers:spatial.tiers,layouts:spatial.layouts.map(l=>({sliceId:l.sliceId,tierId:l.tierId,regions:l.regions.map(r=>r.id),rows:l.rows,generated:Boolean(l.composition)}))};
 }
 if(vmi){
  const scenes=Array.isArray(vmi.scenes)?vmi.scenes.map(s=>({sliceId:s.sliceId,output:s.output})):[{sliceId:vmi.sliceId,output:vmi}];
  for(const [i,s] of scenes.entries()){
   ensure(typeof s.sliceId==='string'&&s.output?.html&&s.output?.plans?.length,'verified scene preview missing');
   const id='VMI-'+(i+1),title=s.output.plans[0].scene.title;
   const embedded=embedVerifiedScene(s.output.html,art?.selected);
   // Separate documents isolate SVG IDs and JS/CSS. No same-origin permission.
   slots.push({id,kind:'vmi',sliceId:s.sliceId,fragment:'<iframe data-ig-engine="'+id+'" title="'+esc(title)+'" sandbox="allow-scripts" style="display:block;width:100%;height:clamp(540px,75vh,820px);border:0" srcdoc="'+esc(embedded.html)+'"></iframe>'});
   runtime.vmi.push({id,sliceId:s.sliceId,design:embedded.design,dynamic:s.output.plans[0].dynamic?{inputs:s.output.plans[0].dynamic.spec.inputs.map(({id,min,max,initial,step})=>({id,min,max,initial,step}))}:null,composition:s.output.plans[0].compositionManifest?{id:s.output.plans[0].compositionManifest.selectedId,boxes:Object.fromEntries(["desktop","mobile"].map(k=>[k,s.output.plans[0].compositionManifest.candidates.find(c=>c.id===s.output.plans[0].compositionManifest.selectedId)[k].boxes])),symbolic:Object.fromEntries(["desktop","mobile"].map(k=>[k,s.output.plans[0].compositionManifest.candidates.find(c=>c.id===s.output.plans[0].compositionManifest.selectedId).symbolic[k].map(r=>({id:r.id,d:r.d}))]))}:null,geometry:(s.output.plans[0].geometryManifest??[]).map(g=>({id:g.objectId,kind:g.kind})),topology:(s.output.plans[0].topology??[]).map(t=>({id:t.edgeId,fromPort:t.fromPort,toPort:t.toPort,routes:Object.fromEntries(Object.entries(t.routes).map(([k,v])=>[k,v.d]))})),objects:s.output.plans[0].semantic.objects.map(o=>o.id),edges:s.output.plans[0].semantic.mappings.map(m=>m.id)});
  }
 }
 return {slots,runtime};
}
export function integrationTask(contract){
 return {status:contract.slots.length?'engine-integration-required':'no-engine-slots',slots:contract.slots.map(s=>({id:s.id,kind:s.kind,sliceId:s.sliceId,marker:marker(s.id),sha256:hash(s.fragment)})),runtime:contract.runtime,scope:'selected engine bytes plus bounded runtime checks; no aesthetic or complete host integration guarantee',releaseAuthorized:false};
}
// Conservative static-slot lexer; explicit head/body markup required.
export function validateSlotContexts(html,slots){
 const wanted=new Map(slots.map(s=>[s.id,s.kind])),seen=new Set();
 const tokens=/<!--[\s\S]*?(?:-->|$)|<![^>]*>|<\/?[A-Za-z][\w:-]*(?:"[^"]*"|'[^']*'|[^'">])*?>/g;
 const raw=new Set(['script','style','title','textarea','xmp','iframe','noembed','noframes','noscript','plaintext']);
 const unsafe=new Set(['template','svg','math','select','option','optgroup','table','thead','tbody','tfoot','tr','colgroup','picture']);
 let section='',blocked=[],rawTag='',m;
 while((m=tokens.exec(html))){
  const t=m[0],tag=/^<(\/?)([A-Za-z][\w:-]*)/.exec(t);
  if(rawTag){if(tag&&tag[1]&&tag[2].toLowerCase()===rawTag&&rawTag!=='plaintext')rawTag='';continue}
  const slot=/^<!--IG:([A-Z0-9-]+)-->$/.exec(t);
  if(slot&&wanted.has(slot[1])){
   const id=slot[1],expected=wanted.get(id)==='style'?'head':'body';
   if(section!==expected||blocked.length||seen.has(id))throw Error('invalid static HTML slot context: '+id+' (expected '+expected+' markup)');
   seen.add(id);continue;
  }
  if(!tag)continue;
  const name=tag[2].toLowerCase(),close=Boolean(tag[1]);
  if(name==='head'||name==='body'){if(close){if(section===name)section=''}else section=name}
  if(close){if(blocked.at(-1)===name)blocked.pop();continue}
  if(raw.has(name)){rawTag=name;continue}
  if(unsafe.has(name))blocked.push(name);
 }
 for(const id of wanted.keys())if(!seen.has(id))throw Error('engine slot not in static HTML markup: '+id);
}
export function assembleArtifact(template,contract){
 ensure(typeof template==='string','HTML template required');
 validateSlotContexts(template,contract.slots);
 let html=template;
 for(const s of contract.slots){
  const m=marker(s.id);ensure(html.split(m).length===2,'exactly one required slot: '+s.id);
  html=html.replace(m,()=>s.fragment);
 }
 ensure(!/<!--IG:[A-Z0-9-]+-->/.test(html),'unresolved engine slot');
 verifyIntegratedHTML(html,contract);
 return html;
}
export function verifyIntegratedHTML(html,contract){
 ensure(!/<!--IG:[A-Z0-9-]+-->/.test(html),'unresolved engine slot');
 let marked=html;
 const slots=contract.slots.map(s=>{
  ensure(html.split(s.fragment).length===2,'missing, modified or duplicate compiled engine fragment: '+s.id);
  marked=marked.replace(s.fragment,()=>marker(s.id));
  return {id:s.id,kind:s.kind,sha256:hash(s.fragment)};
 });
 validateSlotContexts(marked,contract.slots);
 return {slots,scope:'exact fragment presence in static markup, not actual application until browser review'};
}
