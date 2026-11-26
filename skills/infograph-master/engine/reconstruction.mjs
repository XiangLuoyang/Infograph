// P0 declared reconstruction contract; no automatic extraction or approval.
export function auditReconstruction(packet) {
 const errors=[],reviewErrors=[];
 const need=(ok,msg,arr=errors)=>{if(!ok)arr.push(msg)};
 const nonempty=x=>typeof x==="string"&&x.trim().length>0;
 const arr=x=>Array.isArray(x)?x:[];
 const ids=(a,name)=>{const s=new Set();for(const x of a){need(nonempty(x?.id)&&!s.has(x.id),`invalid/duplicate ${name} id`);s.add(x?.id)}return s};
 const p=packet||{}, assets=arr(p.assets), intents=arr(p.intents), findings=arr(p.findings), options=arr(p.options), mappings=arr(p.preservation), checks=arr(p.review);
 need(nonempty(p.sourceRef),"source artifact reference required");need(nonempty(p.baselineRef),"baseline reference required");need(["critique","refine","restructure","reinvent"].includes(p.scope),"invalid scope");
 need(["source-and-render","source-only","render-only"].includes(p.inspection),"inspection coverage required");
 const assetIds=ids(assets,"asset"), intentIds=ids(intents,"intent");ids(findings,"finding");
 need(assets.length>0,"asset inventory required");need(intents.length>0,"intent recovery required");
 const layers=["data","business","information","narrative","visual","interaction"];
 for(const l of layers){const c=arr(p.coverage).filter(x=>x?.layer===l);need(c.length===1&&["observed","inferred","unknown","not-applicable"].includes(c[0]?.status)&&nonempty(c[0]?.ref),`coverage missing: ${l}`);if(c[0]?.status==="observed")need(assets.some(a=>a.layer===l),`observed layer lacks asset: ${l}`)}
 for(const a of assets){need(layers.includes(a.layer)&&nonempty(a.description)&&nonempty(a.ref)&&["observed","inferred","unknown"].includes(a.status)&&typeof a.essential==="boolean"&&typeof a.locked==="boolean",`invalid asset: ${a.id}`)}
 for(const i of intents){need(["explicit","inferred","unknown"].includes(i.status)&&nonempty(i.statement)&&nonempty(i.ref)&&typeof i.blocking==="boolean",`invalid intent: ${i.id}`);if(i.status==="inferred")need(nonempty(i.alternative)&&nonempty(i.validation),`inferred intent lacks alternative/validation: ${i.id}`);if(i.status==="unknown"&&i.blocking)need(false,`blocking intent unknown: ${i.id}`)}
 for(const l of [5,4,3,2,1]){const f=findings.filter(x=>x.level===l);need(f.length>0,`diagnosis missing L${l}`)}
 for(const f of findings){need([1,2,3,4,5].includes(f.level)&&["defect","adequate","unknown","not-applicable"].includes(f.status)&&nonempty(f.ref)&&nonempty(f.taskImpact)&&nonempty(f.repair),`invalid diagnosis: ${f.id}`);if(f.status==="defect")need(arr(f.intentIds).length>0&&f.intentIds.every(id=>intentIds.has(id)),`defect lacks intent trace: ${f.id}`)}
 const modes=["refine","restructure","reinvent"];
 for(const m of modes){const o=options.filter(x=>x.mode===m);need(o.length===1&&nonempty(o[0]?.concept)&&nonempty(o[0]?.benefit)&&nonempty(o[0]?.tradeoff)&&nonempty(o[0]?.reason),`alternative missing: ${m}`)}
 need(modes.includes(p.selected)&&nonempty(p.selectionReason),"selected design and rationale required");
 if(p.scope==="refine")need(p.selected==="refine","refine scope exceeded");
 if(p.scope==="restructure")need(p.selected!=="reinvent","restructure scope exceeded");
 if(p.selected==="refine"&&findings.some(f=>f.level>=3&&f.status==="defect"))need(nonempty(p.highLevelDisposition),"refinement leaves high-level defects without disposition");
 const mapped=new Set();for(const m of mappings){need(assetIds.has(m.assetId)&&!mapped.has(m.assetId),`invalid/duplicate mapping: ${m.assetId}`);mapped.add(m.assetId);const a=assets.find(x=>x.id===m.assetId);need(["preserve","replace-equivalent","remove","defer"].includes(m.action)&&nonempty(m.reason),`invalid mapping: ${m.assetId}`);if(["preserve","replace-equivalent"].includes(m.action))need(nonempty(m.target)&&nonempty(m.verification),`missing target/check: ${m.assetId}`);if(a?.essential)need(["preserve","replace-equivalent"].includes(m.action),`essential asset lost: ${m.assetId}`);if(a?.locked&&m.action!=="preserve")need(nonempty(m.approvalRef),`locked asset changed without approval: ${m.assetId}`)}
 for(const a of assets)need(mapped.has(a.id),`unmapped asset: ${a.id}`);
 const routes=arr(p.routes);need(routes.length>0&&routes.every(x=>nonempty(x.ref)&&nonempty(x.reason)&&arr(x.intentIds).length>0&&x.intentIds.every(id=>intentIds.has(id))),"capability routes must trace to intent");
 const tasks=arr(p.tasks);const taskIds=ids(tasks,"task");need(tasks.length>0&&tasks.every(t=>intentIds.has(t.intentId)&&nonempty(t.baseline)&&nonempty(t.target)&&nonempty(t.method)),"before/after reader tasks required");
 const expected=[...assets.filter(a=>a.essential||a.locked).map(a=>"asset:"+a.id),...tasks.map(t=>"task:"+t.id),"render","data-parity","interaction-parity"];
 for(const k of expected){const r=checks.filter(x=>x.key===k);need(r.length===1&&r[0]?.status==="pass"&&nonempty(r[0]?.ref),`review incomplete: ${k}`,reviewErrors)}
 if(p.inspection!=="source-and-render")need(nonempty(p.inspectionLimit),"limited inspection must disclose limitation");
 return {planEligible:errors.length===0,reviewComplete:errors.length===0&&reviewErrors.length===0,errors,reviewErrors,scope:"declared structure and traceability only; not verified business intent, source parity or aesthetics",releaseAuthorized:false};
}
