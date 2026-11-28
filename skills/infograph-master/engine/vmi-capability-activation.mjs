// Authored applicability decisions checked against actual canonical compiler output.
export const activationKeys=['geometry','materials','topology','composition','dynamic','art'];
export function activationTemplate(){
 return {version:1,plainComparison:{ref:'',advantage:'',tradeoff:''},sourceInteraction:{status:null,ref:'',reason:''},decisions:Object.fromEntries(activationKeys.map(k=>[k,{mode:null,ref:'',reason:'',alternative:''}]))};
}
const text=s=>typeof s==='string'&&s.trim().length>=8&&s.length<=4000;
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
export function auditActivation(spec,output,art){
 const issues=[],rows=[];
 const need=(ok,msg)=>{if(!ok)issues.push(msg)};
 const p=output?.plans?.[0];
 const compiled=Boolean(p&&output?.html);
 const actual={geometry:Boolean(p?.geometryManifest?.length),materials:Boolean(p?.surfaceRendering?.parts?.length),topology:Boolean(p?.topology?.length),composition:Boolean(p?.compositionManifest?.selectedId),dynamic:Boolean(p?.dynamic?.spec?.bindings?.length),art:Boolean(art?.selected?.id&&art?.css)};
 need(spec?.version===1,'activation review required');
 need(compiled,'compiled scene required');
 need(text(spec?.plainComparison?.ref)&&text(spec?.plainComparison?.advantage)&&text(spec?.plainComparison?.tradeoff)&&(!compiled||text(p?.plainAlternative)),'plain representation comparison required');
 const interaction=spec?.sourceInteraction;
 need(['none','preserve','alternative'].includes(interaction?.status)&&text(interaction?.ref)&&text(interaction?.reason),'source interaction disposition required');
 if(compiled&&interaction?.status==='preserve')need(actual.dynamic,'source dynamic mechanism must be preserved through compiled binding');
 if(interaction?.status==='alternative')need(spec?.decisions?.dynamic?.mode==='custom','alternative interaction requires explicit custom route');
 const decisions=spec?.decisions;
 need(obj(decisions)&&Object.keys(decisions).length===activationKeys.length&&activationKeys.every(k=>Object.hasOwn(decisions,k)),'exact six capability decisions required');
 for(const k of activationKeys){
  const d=decisions?.[k];
  need(['use','omit','custom'].includes(d?.mode)&&text(d?.ref)&&text(d?.reason)&&text(d?.alternative),k+': concrete choice, evidence and alternative required');
  if(compiled&&d?.mode==='use')need(actual[k],k+': declared capability absent from compiled output');
  if(compiled&&(d?.mode==='omit'||d?.mode==='custom'))need(!actual[k],k+': disposition contradicts actual compiled output');
  rows.push({capability:k,mode:d?.mode??null,compiled:compiled?actual[k]:null,ref:d?.ref??null,reason:d?.reason??null,alternative:d?.alternative??null});
 }
 return {version:1,status:issues.length?'blocked':'declared-activation-checked',issues,rows,compilerEvidenceStatus:compiled?'available':'deferred-until-scene-compiles',plainAlternative:p?.plainAlternative??null,plainComparison:spec?.plainComparison??null,sourceInteraction:interaction??null,scope:'compiler presence and authored rationale only; no independent applicability, aesthetic, custom implementation or semantic proof',releaseAuthorized:false};
}
