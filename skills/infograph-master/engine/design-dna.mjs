export function sampleDNA(reports,bindings){
 const errors=[],missing=[],str=x=>typeof x==="string"&&x.trim().length>0;
 if(!Array.isArray(reports)||!reports.length||!Array.isArray(bindings)||!bindings.length)throw Error("reports and style bindings required");
 const index=new Map(),keys=new Set(),samples=[];
 let sourceRef=null;
 for(const r of reports){
  if(r.version!==1||!str(r.sourceRef)||!Array.isArray(r.states)||!Number.isInteger(r.viewport?.width)||!Number.isInteger(r.viewport?.height))throw Error("invalid runtime report");
  if(sourceRef!==null&&sourceRef!==r.sourceRef)throw Error("mixed source versions");sourceRef=r.sourceRef;
  const viewport=r.viewport.width+"x"+r.viewport.height;
  for(const s of r.states){
   for(const p of s.probes||[]){
    if(p.kind!=="style")continue;
    const k=JSON.stringify([viewport,s.id,p.id]);if(index.has(k))throw Error("duplicate style probe");
    index.set(k,{...p,stateStatus:s.status,viewport,state:s.id});
   }
  }
 }
 for(const b of bindings){
  const id=JSON.stringify([b?.sliceId,b?.roleId,b?.viewport,b?.state,b?.probeId,b?.property]);
  if(!["sliceId","roleId","viewport","state","probeId","property"].every(k=>str(b?.[k]))||keys.has(id)){errors.push("invalid/duplicate binding: "+id);continue}keys.add(id);
  const p=index.get(JSON.stringify([b.viewport,b.state,b.probeId])),v=p?.value?.computed?.[b.property];
  const observed=p?.status==="observed"&&p.stateStatus==="observed"&&!p.partial&&str(p.ref)&&str(v);
  const sample={...b,status:observed?"observed":"not-run",value:observed?v:null,ref:observed?p.ref:null,outputRef:sourceRef};
  if(!observed)missing.push(id);samples.push(sample);
 }
 const roles=new Map();
 for(const s of samples){if(!roles.has(s.roleId))roles.set(s.roleId,[]);roles.get(s.roleId).push(s)}
 const candidates=[...roles].map(([roleId,items])=>{
  const variants=new Map();for(const s of items.filter(x=>x.status==="observed")){if(!variants.has(s.value))variants.set(s.value,[]);variants.get(s.value).push({sliceId:s.sliceId,viewport:s.viewport,state:s.state,property:s.property,ref:s.ref})}
  const properties=[...new Set(items.map(s=>s.property))];const incomplete=items.some(s=>s.status!=="observed");
  return {roleId,property:properties.length===1?properties[0]:null,status:properties.length!==1?"mixed-properties":incomplete?"incomplete":variants.size===1?"uniform-observed":"variant-review",candidate:!incomplete&&properties.length===1&&variants.size===1?[...variants.keys()][0]:null,variants:[...variants].map(([value,evidence])=>({value,count:evidence.length,evidence})),observed:items.filter(x=>x.status==="observed").length,total:items.length};
 });
 return {version:1,sourceRef,samples,candidates,errors,missing,scope:"author-selected computed styles in sampled states; not full design language, semantic role discovery or visual quality certification",releaseAuthorized:false};
}
export function compareDNA(sample,contract,decisions){
 if(!sample||!Array.isArray(sample.samples)||!Array.isArray(contract?.roles)||!Array.isArray(decisions))throw Error("invalid style comparison");
 const checks=[],observations=[],errors=[...(sample.errors||[])],roles=new Map(contract.roles.map(r=>[r.id,r])),seen=new Set();
 for(const d of decisions){
  for(const roleId of d.roleIds||[]){
   const key=JSON.stringify([d.sliceId,roleId]);if(seen.has(key))throw Error("duplicate slice role");seen.add(key);
   const role=roles.get(roleId),ex=(contract.exceptions||[]).find(x=>x.sliceId===d.sliceId&&x.roleId===roleId),expected=ex?.value??role?.target;
   const rows=sample.samples.filter(x=>x.sliceId===d.sliceId&&x.roleId===roleId);
   // Roles not represented by computed style (e.g. chart semantics) require separate manual review.
   const auto=typeof role?.computedProperty==="string"&&role.computedProperty.trim().length>0;
   if(!auto){checks.push({sliceId:d.sliceId,roleId,status:"manual-review",reason:"not declared as computed style role"});continue}
   const required=Array.isArray(role.requiredStates)?role.requiredStates:[];
   if(!required.length){errors.push("required viewport/state list missing: "+roleId);checks.push({sliceId:d.sliceId,roleId,status:"not-run"});continue}
   const missing=required.filter(x=>!rows.some(r=>r.viewport===x.viewport&&r.state===x.state&&r.property===role.computedProperty&&r.status==="observed"));
   const wrong=rows.filter(r=>r.status==="observed"&&(r.property!==role.computedProperty||r.value!==expected));
   const incomplete=rows.some(r=>r.status!=="observed");
   const status=wrong.length?"mismatch":missing.length||incomplete||!rows.length?"not-run":"observed-match";
   checks.push({sliceId:d.sliceId,roleId,status,expected,missing,actual:rows.map(r=>({viewport:r.viewport,state:r.state,value:r.value,ref:r.ref,status:r.status}))});
   if(status==="observed-match")observations.push({sliceId:d.sliceId,roleId,status:"observed",value:expected,outputRef:sample.sourceRef,ref:rows.map(r=>r.ref).join(" | ")});
  }
 }
 return {checks,styleObservations:observations,errors,status:errors.length||checks.some(x=>x.status==="mismatch")?"mismatch":checks.some(x=>x.status!=="observed-match")||!checks.length?"incomplete":"observed-match",scope:"exact sampled computed properties only; manual roles and visual coherence still need independent review",releaseAuthorized:false};
}
