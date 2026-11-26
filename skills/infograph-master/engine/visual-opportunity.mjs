export function auditVisualOpportunity(input){
 const {revision,inventory,slices,globalReviews=[],renderReview}=input??{};
 const validText=x=>typeof x==="string"&&x.trim().length>0;
 if(!Number.isInteger(revision)||revision<0||!Array.isArray(inventory)||!inventory.length||!Array.isArray(slices)||!Array.isArray(globalReviews))throw Error("invalid visual opportunity packet");
 const issues=[], seen=new Set(), byId=new Map(), families=new Map();
 const add=(code,id,message)=>issues.push({code,id,message});
 for(const i of inventory){if(!validText(i.id)||seen.has(i.id)||!validText(i.page)||!validText(i.ref))throw Error("invalid or duplicate inventory slice");seen.add(i.id);byId.set(i.id,i)}
 const covered=new Set();
 for(const s of slices){
  if(!byId.has(s.id)||covered.has(s.id))throw Error("unknown or duplicate slice");
  covered.add(s.id);
  if(s.revision!==revision)add("stale",s.id,"slice revision mismatch");
  if(!validText(s.task)||!validText(s.relation)||!validText(s.ref)||!validText(s.selectedFamily)||!validText(s.rationale)||!validText(s.rendererPlan))add("incomplete-design",s.id,"declare task, relation, source, selection and renderer plan");
  if(!Array.isArray(s.candidates)||new Set(s.candidates.filter(validText)).size<2||!s.candidates.includes(s.selectedFamily))add("candidate-comparison",s.id,"compare at least two distinct candidate families or forms and select one");
  if(!["none","reviewed","selected"].includes(s.mechanism))add("mechanism-unreviewed",s.id,"evaluate mechanism applicability");
  if(s.mechanism==="selected"&&(!validText(s.mechanismRef)||!validText(s.evidenceBoundary)))add("mechanism-evidence",s.id,"link mapping, state contract and evidence boundary");
  if(!["none","retain","convert","defer"].includes(s.expression))add("expression-unreviewed",s.id,"review dense table/prose disposition");
  if(s.expression==="defer")add("expression-deferred",s.id,"unresolved opportunity");
  if(["retain","convert"].includes(s.expression)&&(!validText(s.expressionReason)||!validText(s.exactAccess)))add("expression-evidence",s.id,"justify table/prose decision and preserve exact access");
  if(s.visible!==false&&validText(s.selectedFamily)){
   const list=families.get(s.selectedFamily)??[];list.push(s);families.set(s.selectedFamily,list);
  }
 }
 for(const i of inventory)if(!covered.has(i.id))add("uncovered",i.id,"inventory slice not assessed");
 const repetition=[];
 for(const [family,list] of families){
  if(list.length<2)continue;
  const tasks=[...new Set(list.map(s=>s.relation+" / "+s.task))];
  if(tasks.length<2)continue;
  const ids=list.map(s=>s.id).sort();
  repetition.push({family,ids,tasks});
  const matches=globalReviews.filter(r=>r.family===family);
  const r=matches[0];
  if(matches.length!==1||r.revision!==revision||!Array.isArray(r.ids)||JSON.stringify([...r.ids].sort())!==JSON.stringify(ids)||!["retain","recompose"].includes(r.decision)||!validText(r.reason)||!validText(r.ref))add("global-repetition",family,"review repeated family across distinct tasks; retain with reason or recompose");
  else if(r.decision==="recompose"&&r.resolved!==true)add("global-recomposition-pending",family,"implement/reassess proposed recomposition");
 }
 const designEligible=issues.length===0;
 if(!renderReview||renderReview.revision!==revision||renderReview.status!=="pass"||!validText(renderReview.ref)||!validText(renderReview.artifactRef))add("render-review",null,"actual revision-bound integrated review not recorded");
 return {revision,inventoryCount:inventory.length,coveredCount:covered.size,repetition,issues,designEligible,declaredReviewComplete:issues.length===0,releaseAuthorized:false,scope:"authored inventory and declarations only; no automatic aesthetic or evidence validation"};
}
