import {relationPolicy,inspectPair} from "./exploration.mjs";

export function enumerateCreativeRoutes(target, aligned, {max=12}={}){
 if(!Array.isArray(target?.edges)||!target.edges.some(e=>e.essential===true)||!Array.isArray(aligned?.results)||aligned.perspectiveId!==target.id||!Number.isInteger(max)||max<1||max>100)throw Error("invalid creative request");
 const essential=new Set(target.edges.filter(e=>e.essential===true).map(e=>e.id)),out=[];
 const covered=r=>new Set((r.matches??[]).filter(m=>essential.has(m.targetEdge)).map(m=>m.targetEdge));
 const rs=aligned.results.filter(r=>!r.truncated&&covered(r).size>0);
 const add=(operation,sources,prompt)=>{if(out.length<max)out.push({operation,sourceIds:sources.map(s=>s.id),prompt,status:"authorship-required"})};
 for(const r of rs.slice(0,3)){
  add("direct",[r],"Preserve the physical mechanism; identify a focal scene and a plain alternative.");
  add("substitute",[r],"Replace a visual form without changing its functional role. Retain explicit source anchor and explain where the substitution breaks.");
  add("transform",[r],"Show meaningful state change with stable identity; no unsupported temporal or quantitative claims.");
 }
 for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){
  const a=rs[i],b=rs[j];if(a.id===b.id)continue;
  const ac=covered(a),bc=covered(b),union=new Set([...ac,...bc]);
  if(union.size>Math.max(ac.size,bc.size))add("combine",[a,b],"Integrate complementary relationships as a schematic, not as a claim of a real hybrid mechanism. Verify all shared roles and boundaries.");
  if(union.size===essential.size)add("juxtapose",[a,b],"Use separate panels with explicit same-target identity and a shared reading path; do not imply physical coupling.");
 }
 return {perspectiveId:target.id,routes:out,plainAlternativeRequired:true,status:"prompts-not-generated-concepts",scope:"bounded route suggestions, not autonomous imagery or creativity scoring"};
}

export function auditConcept(target,concept,objects,ontology){
 const issues=[],warnings=[],T=x=>typeof x==="string"&&x.trim().length>0,add=(code,ref,detail)=>issues.push({code,ref,detail});
 const list=x=>Array.isArray(x)?x:[];
 const ops=["direct","combine","juxtapose","substitute","transform"];
 if(!target||!T(target.id)||!Array.isArray(target.nodes)||!Array.isArray(target.edges)||!target.edges.some(e=>e.essential===true)||!Array.isArray(objects))throw Error("invalid target or source corpus");
 const policy=relationPolicy(ontology);
 const tn=new Map(target.nodes.map(n=>[n.id,n])),te=new Map(target.edges.map(e=>[e.id,e])),sm=new Map(objects.map(o=>[o.id,o]));
 if(tn.size!==target.nodes.length||te.size!==target.edges.length||sm.size!==objects.length)throw Error("duplicate graph ids");
 for(const e of target.edges)if(!tn.has(e.from)||!tn.has(e.to)||!policy.normalize(e.predicate))throw Error("invalid target edge");
 if(!concept||!T(concept.id)||concept.targetId!==target.id||!ops.includes(concept.operation))throw Error("invalid concept");
 for(const k of ["intent","focalScene","plainAlternative","boundary","designDNARef","evidenceRef"])if(!T(concept[k]))add("missing-concept-field",k,"required authored field");
 if(!["observed","hypothesis","assumption","conceptual"].includes(concept.evidenceKind)||concept.evidenceKind!==target.evidenceKind)add("evidence-status","concept","preserve target evidence status");
 if(concept.evidenceRef!==target.evidenceRef)add("evidence-ref","concept","target evidence ref mismatch");
 const sources=list(concept.sourceIds),srcSet=new Set(sources);
 if(!sources.length||srcSet.size!==sources.length||sources.some(id=>!sm.has(id)))add("source-ids","concept","invalid or duplicated source ids");
 for(const id of srcSet){const s=sm.get(id);if(!s||!/^https:\/\//.test(s.source?.url??"")||!T(s.source?.claim)||!list(s.limits).length)add("source-provenance",id,"source and limits required")}
 if(["combine","juxtapose"].includes(concept.operation)&&srcSet.size<2)add("operation-source-count","concept","two distinct sources required");
 if(["direct","substitute","transform"].includes(concept.operation)&&srcSet.size!==1)add("operation-source-count","concept","one source for this operation");
 if(concept.operation==="combine"&&(!T(concept.integrationRationale)||concept.hybridIsSchematic!==true))add("hybrid-boundary","concept","integrated hybrid must be explicitly schematic");
 const panels=list(concept.panels),pm=new Map(panels.map(x=>[x.id,x]));
 if(!panels.length||pm.size!==panels.length||panels.some(x=>!T(x.id)||!T(x.label)))add("panels","concept","unique labeled panels required");
 if(concept.operation==="juxtapose"&&panels.length<2)add("juxtapose-panels","concept","separate panels required");
 const scene=list(concept.sceneObjects),om=new Map(scene.map(x=>[x.id,x])),seenTargetPanel=new Set(),usedSources=new Set(),usedAnchors=new Set();
 if(!scene.length||om.size!==scene.length)add("scene-objects","concept","unique scene objects required");
 for(const o of scene){
  if(!T(o.id)||!T(o.label)||!pm.has(o.panelId)||!tn.has(o.targetNode))add("object-identity",o.id,"invalid object, panel or target identity");
  const k=JSON.stringify([o.panelId,o.targetNode]);if(seenTargetPanel.has(k))add("duplicate-target-in-panel",o.id,"one stable object per target node per panel");seenTargetPanel.add(k);
  const anchors=list(o.anchors);
  if(!anchors.length)add("unanchored-object",o.id,"salient semantic objects require source anchors");
  for(const a of anchors){const s=sm.get(a.sourceId);if(!srcSet.has(a.sourceId)||!s?.nodes.some(n=>n.id===a.nodeId))add("invalid-anchor",o.id,"source node not found");else{usedSources.add(a.sourceId);const ak=JSON.stringify([o.panelId,a.sourceId,a.nodeId]);if(usedAnchors.has(ak))add("duplicate-source-anchor",o.id,"one source node cannot become different objects in same panel");usedAnchors.add(ak)}}
  if(concept.operation==="juxtapose"&&new Set(anchors.map(a=>a.sourceId)).size>1)add("juxtapose-mixed-object",o.id,"keep mechanisms separate in juxtaposition");
 }
 for(const s of srcSet)if(!usedSources.has(s))add("unused-source",s,"listed source not used");
 const bindings=list(concept.bindings),bm=new Map(),boundSourceEdges=new Set(),qualified=[];
 for(const b of bindings){
  const t=te.get(b.targetEdge),s=sm.get(b.sourceId),e=s?.edges.find(x=>x.id===b.sourceEdge),from=om.get(b.fromObject),to=om.get(b.toObject);
  if(!t||!srcSet.has(b.sourceId)||!e||!from||!to){add("invalid-binding",b.targetEdge,"unresolved edge or object");continue}
  if(bm.has(t.id)){add("duplicate-edge",t.id,"one primary representation per target edge");continue}bm.set(t.id,b);
  const key=JSON.stringify([from.panelId,b.sourceId,b.sourceEdge]);if(boundSourceEdges.has(key))add("duplicate-source-edge",t.id,"source relation reused in same panel");boundSourceEdges.add(key);
  if(from.panelId!==to.panelId)add("cross-panel-physical-edge",t.id,"no physical coupling across panels");
  if(from.targetNode!==t.from||to.targetNode!==t.to||!list(from.anchors).some(a=>a.sourceId===b.sourceId&&a.nodeId===e.from)||!list(to.anchors).some(a=>a.sourceId===b.sourceId&&a.nodeId===e.to))add("direction-or-identity",t.id,"endpoint direction or mapping mismatch");
  const m=inspectPair(t,e,policy);if(!m){add("relation-contradiction",t.id,"predicate, polarity or condition incompatible");continue}
  const reviewReasons=[...m.unknown];
  for(const k of ["condition","polarity"])if(e[k]!==undefined&&t[k]===undefined)reviewReasons.push("source-only:"+k);
  for(const [x,y] of [[t.from,e.from],[t.to,e.to]]){const tr=tn.get(x)?.role,sr=s.nodes.find(n=>n.id===y)?.role;if(tr&&sr&&tr!==sr)add("role-contradiction",t.id,"source and target roles conflict");else if(tr&&!sr)reviewReasons.push("role:"+x)}
  if(m.kind==="generalized")reviewReasons.push("generalization");
  if(reviewReasons.length){qualified.push({edge:t.id,reasons:reviewReasons});const r=b.qualifierReview;if(r?.status!=="accepted"||!T(r.reason)||!T(r.evidenceRef))add("qualification-unreviewed",t.id,"explicitly review conditional/generalized/unknown mapping")}
  if(!T(b.interpretation))add("missing-interpretation",t.id,"explain mapped relation");
 }
 for(const t of target.edges)if(t.essential===true&&!bm.has(t.id))add("essential-unmapped",t.id,"essential relationship absent");
 const panelSources=new Map();for(const o of scene){const set=panelSources.get(o.panelId)??new Set();for(const a of list(o.anchors))set.add(a.sourceId);panelSources.set(o.panelId,set)}
 if(concept.operation==="juxtapose"){for(const [id,set] of panelSources)if(set.size!==1)add("juxtapose-mixed-panel",id,"one physical mechanism per panel");const multi=[...tn.keys()].filter(id=>new Set(scene.filter(o=>o.targetNode===id).map(o=>o.panelId)).size>1);for(const id of multi)if(!list(concept.identityLinks).some(l=>l.targetNode===id&&T(l.label)))add("identity-link",id,"shared target must be explicitly identified across panels")}
 if(concept.operation==="substitute"){
  const ss=list(concept.substitutions);if(!ss.length)add("substitution-missing","concept","declare visual substitutions");
  for(const x of ss)if(!om.has(x.objectId)||!T(x.originalForm)||!T(x.replacementForm)||x.originalForm===x.replacementForm||!T(x.retainedFunction)||!T(x.boundary)||x.visualOnly!==true)add("substitution-unsafe",x.objectId,"substitution must preserve semantic function and state its limits");
 }
 if(concept.operation==="transform"){
  const states=list(concept.states),ids=new Set(states.map(x=>x.id));
  if(states.length<2||ids.size!==states.length||states.some(x=>!T(x.id)||!T(x.label)||!T(x.evidenceRef)||!["observed","hypothesis","assumption","conceptual"].includes(x.evidenceKind)))add("state-contract","concept","two evidence-labeled states required");
  const transitions=list(concept.transitions);
  if(!transitions.length)add("transition-missing","concept","declare meaningful state transition");
  for(const x of transitions)if(!ids.has(x.from)||!ids.has(x.to)||x.from===x.to||!list(x.changedObjects).length||x.changedObjects.some(id=>!om.has(id))||!T(x.trigger)||!T(x.meaning)||!T(x.staticAlternative)||x.quantitative===true)add("transition-unsafe",x.from,"stable objects, trigger, meaning and static alternative; quantitative motion requires later calibrated model");
 }
 if(concept.quantitativeGeometry!==false||concept.unsupportedCausality!==false||concept.qualitativeLabel!==true)add("misleading-encoding","concept","explicit qualitative geometry and no unsupported causality required for P3");
 if(!T(concept.stateDisclaimer)&&["transform","combine"].includes(concept.operation))add("state-disclaimer","concept","state/physical hybrid limits required");
 if(list(concept.counterexamples).length===0)add("counterexample-missing","concept","test a concrete failure case");
 for(const x of list(concept.counterexamples))if(!T(x.scenario)||!T(x.failure)||!T(x.mitigation)||!T(x.evidenceRef)||!["mitigated","not-applicable","unresolved"].includes(x.status)||x.status==="unresolved")add("counterexample-unresolved","concept","counterexample not resolved");
 return {conceptId:concept.id,eligibleForReview:issues.length===0,issues,warnings,qualified,scope:"recomputed declared mapping and scene contracts; no proof of source truth or visual quality",releaseAuthorized:false};
}

export function compareConcepts(target,concepts,objects,ontology,reviews){
 const dimensions=["semanticFidelity","comprehension","visualPotential","styleFit","interactionFit","originality","feasibility"],weights=[30,20,15,10,10,10,5];
 if(!Array.isArray(concepts)||!concepts.length||new Set(concepts.map(c=>c.id)).size!==concepts.length||!Array.isArray(reviews)||new Set(reviews.map(r=>r.conceptId)).size!==reviews.length)throw Error("invalid comparison");
 const results=concepts.map(c=>{
  const audit=auditConcept(target,c,objects,ontology),r=reviews.find(x=>x.conceptId===c.id),issues=[...audit.issues];
  if(!r||typeof r.reviewer!=="string"||!r.reviewer.trim()||!["agent-self","independent-human","independent-model"].includes(r.reviewerKind)||r.revision!==c.revision||!r.ref?.trim())issues.push({code:"review-missing",ref:c.id});
  let score=null;
  if(r&&dimensions.every(k=>Number.isInteger(r.ratings?.[k]?.score)&&r.ratings[k].score>=1&&r.ratings[k].score<=5&&typeof r.ratings[k].reason==="string"&&r.ratings[k].reason.trim()))score=dimensions.reduce((n,k,i)=>n+r.ratings[k].score/5*weights[i],0);else issues.push({code:"ratings-incomplete",ref:c.id});
  if(!r||r.sourceMechanismVerified!==true||r.misleading===true||r.excessiveExplanation===true||r.styleConflict===true||r.misleading!==false||r.excessiveExplanation!==false||r.styleConflict!==false)issues.push({code:"critic-hard-gate",ref:c.id});
  return {id:c.id,operation:c.operation,score,eligible:issues.length===0,issues,reviewerKind:r?.reviewerKind??null,independentComprehensionValidated:false,audit};
 }).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||(b.score??-1)-(a.score??-1)||a.id.localeCompare(b.id));
 const eligible=results.filter(x=>x.eligible);
 return {results,eligibleIds:eligible.map(x=>x.id),comparisonReady:eligible.length>=2,plainAlternativeRequired:true,selection:"author selects or uses plain alternative; no auto approval",scope:"declared review and provisional ordinal rubric; not measured creativity or reader comprehension",releaseAuthorized:false};
}
