// Conservative source signals require review, never automatic metaphor selection.
const text=x=>typeof x==='string'&&x.trim().length>0;
export function activationSignals(prepared){
 const nodes=prepared?.ir?.nodes??[];
 return nodes.filter(n=>n.kind==='table'||n.kind==='chart'||n.kind==='control').map(n=>({
  id:n.id,ref:n.ref,kind:n.kind,label:n.label,
  review:n.kind==='table'?'expression':n.kind==='control'?'interaction':'representation',
  partial:n.truncated===true
 }));
}
export function auditActivation(signals,reviews,slices,quality){
 const issues=[],seen=new Set(),known=new Map(signals.map(s=>[s.id,s])),bySlice=new Map(slices.map(s=>[s.id,s]));
 for(const r of Array.isArray(reviews)?reviews:[]){
  const s=known.get(r?.observationId);
  if(!s||seen.has(r.observationId)){issues.push({code:'activation-invalid-review',id:r?.observationId});continue}
  seen.add(s.id);
  if(r.ref!==s.ref||!text(r.reason)||!['mapped','removed','not-applicable'].includes(r.disposition)){issues.push({code:'activation-evidence',id:s.id});continue}
  if(r.disposition==='mapped'){
   const target=bySlice.get(r.sliceId);
   if(!target){issues.push({code:'activation-missing-slice',id:s.id});continue}
   if(s.review==='expression'&&!['retain','convert'].includes(target.expression))issues.push({code:'activation-expression-unreviewed',id:s.id});
   if(s.review==='interaction'&&quality.semanticInteraction!==true&&!text(r.staticReason))issues.push({code:'activation-interaction-rationale',id:s.id});
   if(s.review==='representation'&&target.mechanism==='none'&&!text(r.mechanismReason))issues.push({code:'activation-mechanism-rationale',id:s.id});
  }
 }
 for(const s of signals)if(!seen.has(s.id))issues.push({code:'activation-unreviewed',id:s.id,ref:s.ref,review:s.review});
 return {signals,issues,eligible:issues.length===0,scope:'bounded source IR review; not independent semantic or visual classification'};
}
