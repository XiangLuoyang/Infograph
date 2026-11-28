import {explorePerspectives} from '../skills/infograph-master/visual-metaphor-intelligence/engine/exploration.mjs';
import {evaluatePacket} from '../skills/infograph-master/visual-metaphor-intelligence/engine/pipeline.mjs';
import {recommendCapabilities} from '../skills/infograph-master/engine/vmi-capability-advisor.mjs';
import {geometryLibrary} from '../skills/infograph-master/visual-metaphor-intelligence/engine/physical-geometry.mjs';
import {auditActivation} from '../skills/infograph-master/engine/vmi-capability-activation.mjs';
const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
const text=v=>typeof v==='string'&&v.trim().length>0;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export const MAX_SCENES=8;
export function sceneInputs(input,selected){
 ensure(Array.isArray(selected)&&selected.length>0&&selected.length<=MAX_SCENES,'invalid selected scene count');
 const batch=Object.hasOwn(input,'scenes');
 if(batch)ensure(!Object.hasOwn(input,'sliceId')&&!Object.hasOwn(input,'perspectives')&&!Object.hasOwn(input,'sourceAdditions'),'mixed single and batch VMI fields');
 const list=batch?input.scenes:[input];
 ensure(Array.isArray(list)&&list.length===selected.length,'VMI scene coverage mismatch');
 const map=new Map();
 for(const s of list){ensure(s&&selected.includes(s.sliceId)&&!map.has(s.sliceId),'unknown or duplicate VMI slice');map.set(s.sliceId,s)}
 return selected.map(id=>map.get(id));
}
export function bindScenes(stage,input,selected,priorInput){
 const out=structuredClone(input);
 const bind=(obj,key,value)=>{if(Object.hasOwn(obj,key)&&!same(obj[key],value))throw Error('authored '+key+' conflicts with verified upstream');obj[key]=value};
 if(!Object.hasOwn(out,'scenes')){
  ensure(selected.length===1,'multiple selected scenes require scenes array');
  bind(out,'sliceId',selected[0]);
 }else if(out.scenes?.length===1&&selected.length===1&&!Object.hasOwn(out.scenes[0],'sliceId'))bind(out.scenes[0],'sliceId',selected[0]);
 const rows=sceneInputs(out,selected);
 if(stage==='vmi-packet'){
  const old=sceneInputs(priorInput,selected);
  for(let i=0;i<rows.length;i++){
   bind(rows[i],'perspectives',old[i].perspectives);
   if(old[i].sourceAdditions!==undefined)bind(rows[i],'sourceAdditions',old[i].sourceAdditions);
   else ensure(rows[i].sourceAdditions===undefined,'source additions must be explored before packet');
  }
 }
 if(Object.hasOwn(out,'scenes'))out.scenes=rows;
 return out;
}
export function extendedCorpus(base,additions=[]){
 ensure(Array.isArray(additions)&&additions.length<=24,'invalid local source addition count');
 const used=new Set(base.map(o=>o.id)),graphs=[];
 for(const a of additions){
  const g=a?.graph;
  ensure(text(a?.query)&&text(a.evidenceRef)&&text(a.verificationNotes)&&text(g?.id)&&!used.has(g.id),'missing local discovery evidence or duplicate source');
  ensure(/^https:\/\//.test(g.source?.url??'')&&text(g.source.claim)&&text(g.source.review)&&Array.isArray(g.limits)&&g.limits.length>0,'invalid local source provenance');
  used.add(g.id);graphs.push(g);
 }
 return [...base,...graphs];
}
export function evaluateSceneBatch(stage,input,selected,objects,ontology,activationContext=null){
 const rows=sceneInputs(input,selected);
 const results=rows.map(s=>{
  const corpus=extendedCorpus(objects,s.sourceAdditions);
  const output=stage==='vmi-explore'?explorePerspectives(s.perspectives,corpus,ontology,{shortlist:8,budget:4000}):evaluatePacket(s,corpus,ontology);
  if(stage==='vmi-explore'&&activationContext)output.designOpportunities=recommendCapabilities(s.perspectives,output,corpus,geometryLibrary(),activationContext.art);
  if(stage==='vmi-packet'&&activationContext){
   const activation=auditActivation(s.activation,output,activationContext.art);
   output.activation=activation;
   if(activation.issues.length)output.issues.push(...activation.issues.map(x=>'activation: '+x));
  }
  return {sliceId:s.sliceId,corpusSize:corpus.length,localSources:(s.sourceAdditions??[]).map(a=>({id:a.graph.id,domain:a.graph.domain,query:a.query,evidenceRef:a.evidenceRef,url:a.graph.source.url,verificationNotes:a.verificationNotes})),output};
 });
 // Preserve the old single-scene output shape; the batch never fabricates a combined HTML preview.
 if(!Object.hasOwn(input,'scenes')){
  const r=results[0];return {...r.output,sliceId:r.sliceId,corpusSize:r.corpusSize,localSources:r.localSources};
 }
 return {scenes:results,previewAvailable:stage==='vmi-packet'&&results.every(r=>Boolean(r.output.html)),issues:results.flatMap(r=>(r.output.issues??[]).map(x=>r.sliceId+': '+x)),openDiscoveryRequired:results.some(r=>r.output.openDiscoveryRequired),releaseAuthorized:false,scope:'separate scene engines; local source evidence is authored, not independently verified; no combined render'};
}
export function hasVmiPreview(output){return Array.isArray(output?.scenes)?output.previewAvailable===true:Boolean(output?.html)}

const retryFields=new Set(['targetId','concepts','reviews','selectedConceptId','scene','styles','activation']);
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const equivalent=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
export function vmiRetryStatus(input,output,selected){
 const rows=sceneInputs(input,selected);
 const result=Array.isArray(output?.scenes)?output.scenes:[{sliceId:output?.sliceId,output}];
 ensure(result.length===rows.length&&result.every((r,i)=>r.sliceId===rows[i].sliceId),'retry output/scene coverage mismatch');
 const scenes=result.map(r=>{
  const o=r.output,issues=Array.isArray(o?.issues)?o.issues:[],openDiscovery=o?.openDiscoveryRequired===true,preview=Boolean(o?.html);
  const ready=preview&&!issues.length&&!openDiscovery;
  return {sliceId:r.sliceId,ready,preview,openDiscovery,issues,action:ready?'preserve':openDiscovery?'retry-vmi-explore':'repair-packet'};
 });
 return {scenes,preserved:scenes.filter(s=>s.ready).map(s=>s.sliceId),repairable:scenes.filter(s=>s.action==='repair-packet').map(s=>s.sliceId),rediscover:scenes.filter(s=>s.openDiscovery).map(s=>s.sliceId),signature:JSON.stringify(stable(scenes.filter(s=>!s.ready).map(({sliceId,preview,openDiscovery,issues})=>({sliceId,preview,openDiscovery,issues:[...issues].sort()}))))};
}
export function prepareVmiRetry(input,output,selected,patch){
 const status=vmiRetryStatus(input,output,selected);
 ensure(status.rediscover.length===0,'open discovery requires retry vmi-explore; packet patch cannot change sources');
 ensure(status.repairable.length>0,'no failed packet scenes to repair');
 ensure(patch&&typeof patch==='object'&&!Array.isArray(patch)&&Object.keys(patch).length===1&&Array.isArray(patch.scenes)&&patch.scenes.length>0,'retry patch must be {scenes:[{sliceId,changes}]}');
 const map=new Map();
 for(const row of patch.scenes){
  ensure(row&&Object.keys(row).length===2&&status.repairable.includes(row.sliceId)&&!map.has(row.sliceId),'patch only failed scene IDs, once each');
  const changes=row.changes;
  ensure(changes&&typeof changes==='object'&&!Array.isArray(changes)&&Object.keys(changes).length>0&&Object.keys(changes).every(k=>retryFields.has(k)),'patch only authored packet fields; upstream fields are locked');
  map.set(row.sliceId,changes);
 }
 const rows=sceneInputs(input,selected);
 const changed=[];
 const next=rows.map(row=>{
  const changes=map.get(row.sliceId);if(!changes)return structuredClone(row);
  const updated={...structuredClone(row),...structuredClone(changes)};
  ensure(!equivalent(row,updated),'retry patch makes no effective change: '+row.sliceId);
  changed.push(row.sliceId);return updated;
 });
 return {packet:Object.hasOwn(input,'scenes')?{...structuredClone(input),scenes:next}:next[0],changed,preserved:status.preserved,remaining:status.repairable.filter(id=>!map.has(id)),signature:status.signature};
}
