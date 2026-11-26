export function mineOpportunities(packet){
 const str=x=>typeof x==="string"&&x.trim().length>0;
 const list=x=>Array.isArray(x)?x:[];
 if(!packet||!Array.isArray(packet.assets)||!Array.isArray(packet.intents)||!Array.isArray(packet.findings)||!Array.isArray(packet.relationships))throw Error("invalid opportunity packet");
 const assets=new Map(),intents=new Map(),findings=new Map(),rels=new Set(),errors=[],opportunities=[];
 for(const [items,index,name] of [[packet.assets,assets,"asset"],[packet.intents,intents,"intent"],[packet.findings,findings,"finding"]])for(const a of items){if(!str(a?.id)||index.has(a.id))throw Error("invalid "+name+" id");index.set(a.id,a)}
 const families={
  aggregate_detail:{focus:"Show the aggregate and segment contrast at a common grain",routes:["visual-intelligence/representation-foundations.md","references/contextual-focus.md"],concepts:["aligned aggregate and segment comparison","overview-to-detail investigation","evidence-linked mechanism if independently warranted"]},
  concentration:{focus:"Make uneven allocation or exposure visible",routes:["visual-intelligence/representation-foundations.md"],concepts:["ranked contribution view","proportional composition with exact denominator","linked allocation and consequence view"]},
  flow_constraint:{focus:"Separate available resource, allocation, bottleneck and outcome",routes:["references/dynamic-visual-metaphor.md","visual-intelligence/representation-foundations.md"],concepts:["stage-by-stage evidence strip","explicit flow topology with qualitative states","mechanism scene paired with measured comparisons"]},
  temporal_change:{focus:"Expose sequence, baseline and magnitude of change",routes:["visual-intelligence/representation-foundations.md"],concepts:["aligned time series","annotated change and baseline comparison","driver decomposition if evidence permits"]},
  tradeoff:{focus:"Expose competing objectives and constraints",routes:["references/dynamic-visual-metaphor.md","visual-intelligence/representation-foundations.md"],concepts:["decision matrix with real measures","constraint relationship map","qualitative tension scene when justified"]},
  exception_lookup:{focus:"Reduce time to locate actionable exceptions",routes:["references/visual-design.md","references/contextual-focus.md"],concepts:["prioritized exception table","overview with linked drilldown","retain compact lookup layout if already effective"]},
  dependency:{focus:"Reveal dependency paths and downstream consequences",routes:["references/contextual-focus.md","visual-intelligence/representation-foundations.md"],concepts:["directed dependency map","grouped linked inspection","stage progression with conditional outcomes"]}
 };
 for(const r of packet.relationships){
  const valid=str(r?.id)&&!rels.has(r.id)&&Object.hasOwn(families,r.type)&&["observed","hypothesis","unknown"].includes(r.status)&&str(r.statement)&&str(r.ref)&&str(r.limit)&&Array.isArray(r.assetIds)&&new Set(r.assetIds).size===r.assetIds.length&&r.assetIds.length>=2&&r.assetIds.every(x=>assets.has(x))&&intents.has(r.intentId)&&Array.isArray(r.findingIds)&&r.findingIds.every(x=>findings.has(x));
  if(!valid){errors.push("invalid relationship: "+r?.id);continue}rels.add(r.id);
  const intent=intents.get(r.intentId);
  if(r.status==="unknown"||intent.status==="unknown"){opportunities.push({id:r.id,status:"investigate",reason:"unknown relationship or task",evidence:r.ref,validation:r.limit});continue}
  const f=r.findingIds.map(id=>findings.get(id)).filter(x=>x.status==="defect"&&x.level>=3&&list(x.intentIds).includes(r.intentId)&&str(x.ref)&&str(x.taskImpact));
  if(!f.length){opportunities.push({id:r.id,status:"retain-or-test",reason:"no evidenced L3–L5 task defect",evidence:r.ref,validation:r.limit});continue}
  const observed=r.assetIds.every(id=>assets.get(id).status==="observed"&&str(assets.get(id).ref));
  const family=families[r.type];const isHypothesis=r.status!=="observed"||!observed||intent.status!=="explicit";
  opportunities.push({id:r.id,status:isHypothesis?"candidate-needs-validation":"candidate",relationship:r.type,intentId:r.intentId,assetIds:r.assetIds,findingIds:f.map(x=>x.id),evidence:[r.ref,...r.assetIds.map(id=>assets.get(id).ref),...f.map(x=>x.ref)],taskImpact:f.map(x=>x.taskImpact),focus:family.focus,concepts:family.concepts,routes:family.routes,limit:r.limit,claimBoundary:isHypothesis?"do not present inferred relation as confirmed":"observed relation does not establish causality",readerTask:"Measure whether the reader can resolve the linked task more accurately or efficiently than on the original"});
 }
 return {opportunities,errors,scope:"relationship- and diagnosis-conditioned prompts; author supplied relations, not automatic causal discovery or design quality scoring",releaseAuthorized:false};
}
export function auditExploration(packet,opportunities){
 const errors=[],str=x=>typeof x==="string"&&x.trim().length>0;
 if(!packet||!Array.isArray(packet.options)||!Array.isArray(opportunities))throw Error("invalid exploration");
 const ids=new Set(opportunities.filter(o=>["candidate","candidate-needs-validation"].includes(o.status)).map(o=>o.id)),seen=new Set(),modes=new Map(),dims=["architecture","representation","interaction","readerPath"];
 for(const o of packet.options){
  if(!o||!["refine","restructure","reinvent"].includes(o.mode)||modes.has(o.mode)||!str(o.id)||seen.has(o.id)){errors.push("invalid option identity");continue}
  modes.set(o.mode,o);seen.add(o.id);
  for(const k of [...dims,"benefit","tradeoff","evidencePlan","preservationPlan","readerTest"])if(!str(o[k]))errors.push(o.id+": missing "+k);
  if(!Array.isArray(o.opportunityIds)||o.opportunityIds.some(id=>!ids.has(id)))errors.push(o.id+": invalid opportunity trace");
  if(o.mode!=="refine"&&ids.size&&!o.opportunityIds?.length)errors.push(o.id+": no opportunity trace");
  if(!Array.isArray(o.routes)||!o.routes.length||o.routes.some(r=>!str(r)))errors.push(o.id+": no capability routing");
 }
 for(const m of ["refine","restructure","reinvent"])if(!modes.has(m))errors.push("missing "+m);
 const a=modes.get("refine"),b=modes.get("restructure"),c=modes.get("reinvent");
 const norm=x=>String(x??"").trim().toLowerCase().replace(/\s+/g," ");
 const distinct=(x,y)=>dims.filter(k=>norm(x[k])!==norm(y[k]));
 if(a&&b&&distinct(a,b).length<2)errors.push("restructure insufficiently distinct");
 if(b&&c&&distinct(b,c).length<2)errors.push("reinvent insufficiently distinct");
 if(a&&c&&distinct(a,c).length<2)errors.push("reinvent insufficiently distinct from baseline");
 const selected=packet.options.find(o=>o?.id===packet.selected);
 if(!selected||!str(packet.reason))errors.push("selection requires rationale");
 if(selected?.mode==="refine"&&ids.size&&!str(packet.highLevelDisposition))errors.push("unaddressed high-level opportunity");
 if(!ids.size&&selected&&selected.mode!=="refine"&&!str(packet.nonDefectRationale))errors.push("unjustified structural change without opportunity");
 return {eligible:errors.length===0,errors,scope:"declared option differentiation and traceability only; wording differences do not prove material design difference",releaseAuthorized:false};
}
