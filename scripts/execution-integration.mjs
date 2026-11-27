// Deterministic assembly of verified engine outputs, not arbitrary HTML rewriting.
import {spatialCSS} from '../skills/infograph-master/engine/global-spatial-composition.mjs';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
const ensure=(b,m)=>{if(!b)throw Error(m)};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const marker=id=>'<!--IG:'+id+'-->';
export function integrationContract(stages){
 const art=stages['production-plan']?.artDirection,spatial=stages['specialist-plan']?.outputs?.QD05,vmi=stages['vmi-packet'];
 const slots=[],runtime={art:null,spatial:null,vmi:[]};
 const style=(id,css)=>{ensure(typeof css==='string'&&!/<\/style/i.test(css),'invalid generated stylesheet');slots.push({id,kind:'style',fragment:'<style data-ig-engine="'+id+'">'+css+'</style>'})};
 if(art){
  style('ART',art.css);
  runtime.art={id:art.selected.id,palette:art.selected.palette};
 }
 if(spatial?.layouts?.some(l=>l.composition)){
  style('SPATIAL',spatialCSS(spatial));
  runtime.spatial={tiers:spatial.tiers,layouts:spatial.layouts.map(l=>({sliceId:l.sliceId,tierId:l.tierId,regions:l.regions.map(r=>r.id),generated:Boolean(l.composition)}))};
 }
 if(vmi){
  const scenes=Array.isArray(vmi.scenes)?vmi.scenes.map(s=>({sliceId:s.sliceId,output:s.output})):[{sliceId:vmi.sliceId,output:vmi}];
  for(const [i,s] of scenes.entries()){
   ensure(typeof s.sliceId==='string'&&s.output?.html&&s.output?.plans?.length,'verified scene preview missing');
   const id='VMI-'+(i+1),title=s.output.plans[0].scene.title;
   // Separate documents isolate SVG IDs and JS/CSS. No same-origin permission.
   slots.push({id,kind:'vmi',sliceId:s.sliceId,fragment:'<iframe data-ig-engine="'+id+'" title="'+esc(title)+'" sandbox="allow-scripts" style="display:block;width:100%;height:clamp(540px,75vh,820px);border:0" srcdoc="'+esc(s.output.html)+'"></iframe>'});
   runtime.vmi.push({id,sliceId:s.sliceId,objects:s.output.plans[0].semantic.objects.map(o=>o.id),edges:s.output.plans[0].semantic.mappings.map(m=>m.id)});
  }
 }
 return {slots,runtime};
}
export function integrationTask(contract){
 return {status:contract.slots.length?'engine-integration-required':'no-engine-slots',slots:contract.slots.map(s=>({id:s.id,kind:s.kind,sliceId:s.sliceId,marker:marker(s.id),sha256:hash(s.fragment)})),runtime:contract.runtime,scope:'selected engine bytes plus bounded runtime checks; no aesthetic or complete host integration guarantee',releaseAuthorized:false};
}
export function assembleArtifact(template,contract){
 ensure(typeof template==='string','HTML template required');
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
 const slots=contract.slots.map(s=>{
  ensure(html.split(s.fragment).length===2,'missing, modified or duplicate compiled engine fragment: '+s.id);
  return {id:s.id,kind:s.kind,sha256:hash(s.fragment)};
 });
 return {slots,scope:'exact fragment presence, not actual application until browser review'};
}
