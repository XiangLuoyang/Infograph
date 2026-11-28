import {explorePerspectives} from '../skills/infograph-master/visual-metaphor-intelligence/engine/exploration.mjs';
import {evaluatePacket} from '../skills/infograph-master/visual-metaphor-intelligence/engine/pipeline.mjs';
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
