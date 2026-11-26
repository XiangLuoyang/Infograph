export function auditSystemPlan(p){
 const errors=[],unknowns=[],str=x=>typeof x==="string"&&x.trim().length>0,arr=x=>Array.isArray(x)?x:[],has=(x,k)=>Object.hasOwn(x||{},k);
 const fail=(ok,msg)=>{if(!ok)errors.push(msg)};
 if(!p||p.version!==1||!str(p.sourceRef)||!str(p.planRevision))throw Error("invalid system plan envelope");
 fail(["full","targeted"].includes(p.scope),"invalid scope");
 const atlas=p.atlas||{},pages=arr(atlas.pages),slices=arr(atlas.slices),inventory=arr(atlas.inventory),pageIds=new Set(),sliceIds=new Set(),invIds=new Set();
 fail(["complete-declared","partial"].includes(atlas.coverage)&&str(atlas.discoveryRef),"atlas coverage/evidence required");
 if(atlas.coverage!=="complete-declared")unknowns.push("inventory coverage partial");
 fail(inventory.length>0&&pages.length>0&&slices.length>0,"nonempty independent inventory and atlas required");
 for(const i of inventory){fail(str(i?.id)&&!invIds.has(i.id)&&["page","slice"].includes(i.kind)&&str(i.ref),"invalid inventory entry");invIds.add(i?.id)}
 const assigned=new Set();
 for(const x of [...pages.map(x=>({...x,kind:"page"})),...slices.map(x=>({...x,kind:"slice"}))]){
  const set=x.kind==="page"?pageIds:sliceIds;
  fail(str(x.id)&&!set.has(x.id)&&!pageIds.has(x.id)&&!sliceIds.has(x.id)&&str(x.title)&&str(x.task)&&str(x.ref),"invalid/duplicate atlas node: "+x.id);set.add(x.id);
  fail(arr(x.inventoryIds).length>0,"unbound atlas node: "+x.id);
  for(const id of arr(x.inventoryIds)){fail(invIds.has(id)&&!assigned.has(id)&&inventory.some(i=>i.id===id&&i.kind===x.kind),"invalid inventory mapping: "+id);assigned.add(id)}
 }
 for(const i of inventory)fail(assigned.has(i.id),"unmapped discovered "+i.kind+": "+i.id);
 const shared=new Set();for(const d of arr(atlas.shared)){fail(str(d?.id)&&!shared.has(d.id)&&str(d.ref)&&str(d.description),"invalid shared asset");shared.add(d?.id)}
 for(const s of slices){
  fail(pageIds.has(s.pageId),"missing parent: "+s.id);
  fail(Array.isArray(s.sharedIds)&&new Set(s.sharedIds).size===s.sharedIds.length&&s.sharedIds.every(id=>shared.has(id)),"invalid shared dependency: "+s.id);
  fail(Array.isArray(s.executionDeps)&&new Set(s.executionDeps).size===s.executionDeps.length&&s.executionDeps.every(id=>sliceIds.has(id)&&id!==s.id),"invalid execution dependencies: "+s.id);
 }
 for(const page of pages)fail(slices.some(s=>s.pageId===page.id),"page has no registered slice: "+page.id);
 const visiting=new Set(),visited=new Set();
 function visit(id){if(visiting.has(id)){errors.push("execution dependency cycle: "+id);return}if(visited.has(id))return;visiting.add(id);for(const dep of arr(slices.find(s=>s.id===id)?.executionDeps))if(sliceIds.has(dep))visit(dep);visiting.delete(id);visited.add(id)}
 for(const id of sliceIds)visit(id);
 const contract=p.contract||{},roles=arr(contract.roles),roleIds=new Set(),dims=["color","typography","material","composition","chart","interaction"];
 fail(str(contract.revision)&&["inherit","evolve","replace"].includes(contract.strategy)&&str(contract.rationale)&&str(contract.baselineRef),"global contract required");
 for(const d of dims)fail(str(contract.dna?.[d]?.baseline)&&str(contract.dna?.[d]?.target)&&str(contract.dna?.[d]?.ref),"missing DNA dimension: "+d);
 for(const r of roles){
  fail(str(r?.id)&&!roleIds.has(r.id)&&dims.includes(r.dimension)&&str(r.baseline)&&str(r.target)&&str(r.ref),"invalid style role: "+r?.id);roleIds.add(r?.id);
  if(contract.strategy==="inherit"&&r.baseline!==r.target)errors.push("inherit cannot change role: "+r.id);
 }
 for(const d of dims)fail(roles.some(r=>r.dimension===d),"missing role dimension: "+d);
 const changedRoles=new Set(roles.filter(r=>r.baseline!==r.target).map(r=>r.id));
 const targets=arr(p.targetSliceIds),targetIds=new Set(targets);
 fail(targets.length===targetIds.size&&targets.every(id=>sliceIds.has(id)),"invalid target slices");
 if(p.scope==="full")fail(targetIds.size===sliceIds.size,"full scope must cover every slice");
 if(p.scope==="targeted")fail(targets.length>0&&str(p.scopeReason),"targeted scope requires explicit boundary");
 const decisions=arr(p.decisions),byId=new Map();
 const actions=["retain","adapt","refine","restructure","reinvent","defer","out-of-scope"];
 for(const d of decisions){
  if(!sliceIds.has(d?.sliceId)||byId.has(d.sliceId)){errors.push("invalid/duplicate slice decision: "+d?.sliceId);continue}byId.set(d.sliceId,d);
  const target=targetIds.has(d.sliceId);
  fail(actions.includes(d.action)&&str(d.reason)&&str(d.taskImpact)&&str(d.assessmentRef)&&[0,1,2,3].includes(d.priority),"invalid decision: "+d.sliceId);
  fail(target?d.action!=="out-of-scope":d.action==="out-of-scope","scope/action mismatch: "+d.sliceId);
  fail(Array.isArray(d.roleIds)&&new Set(d.roleIds).size===d.roleIds.length&&d.roleIds.every(id=>roleIds.has(id))&&(d.roleIds.length>0||str(d.roleExemption)),"missing style role usage: "+d.sliceId);
  fail(d.contractRevision===contract.revision,"stale style contract: "+d.sliceId);
  if(["adapt","refine","restructure","reinvent"].includes(d.action))fail(str(d.changeSpec)&&str(d.preservationPlan),"missing implementation spec: "+d.sliceId);
  if(arr(d.roleIds).some(id=>changedRoles.has(id))&&["retain","out-of-scope","defer"].includes(d.action))errors.push("changed role not migrated: "+d.sliceId);
  if(d.action==="defer")unknowns.push("deferred: "+d.sliceId);
 }
 for(const id of sliceIds)fail(byId.has(id),"unassessed slice: "+id);
 const exceptions=arr(contract.exceptions),exIds=new Set();
 for(const e of exceptions){const k=JSON.stringify([e.sliceId,e.roleId]);fail(sliceIds.has(e.sliceId)&&roleIds.has(e.roleId)&&arr(byId.get(e.sliceId)?.roleIds).includes(e.roleId)&&!exIds.has(k)&&str(e.value)&&str(e.reason)&&str(e.approvalRef),"invalid local style exception: "+k);exIds.add(k)}
 return {eligible:errors.length===0,errors,unknowns,counts:{pages:pages.length,slices:slices.length,assessed:byId.size,targeted:targetIds.size,plannedChanges:decisions.filter(d=>["adapt","refine","restructure","reinvent"].includes(d.action)).length,retained:decisions.filter(d=>d.action==="retain").length,deferred:decisions.filter(d=>d.action==="defer").length,outOfScope:decisions.filter(d=>d.action==="out-of-scope").length},scope:"declared inventory, design roles and plan traceability; not automatic completeness or visual approval",releaseAuthorized:false};
}
export function auditSystemProgress(p,ledger){
 const plan=auditSystemPlan(p),errors=[...plan.errors],unverified=[...plan.unknowns],str=x=>typeof x==="string"&&x.trim().length>0,arr=x=>Array.isArray(x)?x:[];
 if(!ledger||ledger.version!==1)throw Error("invalid ledger");
 if(ledger.sourceRef!==p.sourceRef||ledger.planRevision!==p.planRevision||ledger.contractRevision!==p.contract.revision)errors.push("ledger revision mismatch");
 const slices=p.atlas.slices,decisions=new Map(p.decisions.map(d=>[d.sliceId,d])),records=new Map(),changedActions=["adapt","refine","restructure","reinvent"];
 const statusOf=id=>records.get(id)?.status||"pending";
 for(const r of arr(ledger.records)){
  const d=decisions.get(r?.sliceId);
  if(!d||records.has(r.sliceId)){errors.push("invalid/duplicate progress row: "+r?.sliceId);continue}
  records.set(r.sliceId,r);
  if(!["pending","in-progress","implemented","retained","blocked","deferred","out-of-scope"].includes(r.status)||!str(r.ref)||r.contractRevision!==p.contract.revision)errors.push("invalid/stale progress: "+r.sliceId);
  const allowed=changedActions.includes(d.action)?["pending","in-progress","implemented","blocked"]:d.action==="retain"?["pending","retained","blocked"]:d.action==="defer"?["deferred"]:["out-of-scope"];
  if(!allowed.includes(r.status))errors.push("progress/action mismatch: "+r.sliceId);
  if(r.status==="implemented"&&!str(r.outputRef))errors.push("implemented without artifact: "+r.sliceId);
 }
 for(const s of slices)if(!records.has(s.id))unverified.push("missing ledger row: "+s.id);
 const settled=id=>["implemented","retained"].includes(statusOf(id));
 for(const s of slices)if(statusOf(s.id)==="implemented"&&!s.executionDeps.every(settled))errors.push("implemented before dependencies: "+s.id);
 const ready=slices.filter(s=>changedActions.includes(decisions.get(s.id)?.action)&&statusOf(s.id)==="pending"&&s.executionDeps.every(settled)).sort((a,b)=>decisions.get(a.id).priority-decisions.get(b.id).priority||a.id.localeCompare(b.id)).map(s=>s.id);
 for(const d of p.decisions)if(d.action!=="out-of-scope"&&!settled(d.sliceId))unverified.push("unfinished: "+d.sliceId);
 const integration=ledger.integration||{},outputRef=integration.outputRef;
 if(!str(outputRef))unverified.push("integrated output missing");
 if(integration.contractRevision!==p.contract.revision)unverified.push("integration contract revision missing/stale");
 const reviews=arr(integration.reviews);
 const required=[...p.atlas.pages.map(x=>"page:"+x.id),...slices.map(x=>"slice:"+x.id),...p.atlas.shared.map(x=>"shared:"+x.id),"global-navigation","global-coherence","global-data-parity"];
 for(const key of required){const rows=reviews.filter(r=>r.key===key);if(rows.length!==1||rows[0].status!=="pass"||!str(rows[0].ref)||rows[0].outputRef!==outputRef||!str(outputRef))unverified.push("integration check incomplete: "+key)}
 const style=arr(integration.styleObservations),roles=new Map(p.contract.roles.map(r=>[r.id,r]));
 for(const d of p.decisions)for(const roleId of arr(d.roleIds)){
  const rows=style.filter(r=>r.sliceId===d.sliceId&&r.roleId===roleId),exception=arr(p.contract.exceptions).find(e=>e.sliceId===d.sliceId&&e.roleId===roleId),expected=exception?.value??roles.get(roleId)?.target;
  if(rows.length!==1||rows[0].status!=="observed"||rows[0].value!==expected||rows[0].outputRef!==outputRef||!str(rows[0].ref)||!str(outputRef))unverified.push("style role mismatch/not-run: "+d.sliceId+"/"+roleId);
 }
 const counts={...plan.counts,implemented:[...records.values()].filter(r=>r.status==="implemented").length,retainedVerified:[...records.values()].filter(r=>r.status==="retained").length,unfinished:p.decisions.filter(d=>d.action!=="out-of-scope"&&!settled(d.sliceId)).length};
 const complete=errors.length===0&&unverified.length===0;
 return {planEligible:plan.eligible,ready:errors.length?[]:ready,counts,errors,unverified,scopeComplete:complete,fullDashboardComplete:complete&&p.scope==="full",scope:"declared ledger plus matched style observations; no automated visual or semantic certification",releaseAuthorized:false};
}
