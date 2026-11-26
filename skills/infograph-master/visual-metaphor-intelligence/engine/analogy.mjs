export function validateGraph(g,predicates,source=false){
 const text=x=>typeof x==="string"&&x.trim().length>0;
 if(!g||!text(g.id)||!Array.isArray(g.nodes)||!g.nodes.length||g.nodes.length>12||!Array.isArray(g.edges)||!g.edges.length||g.edges.length>24)throw Error("invalid graph or size");
 const ns=new Set(),es=new Set();
 for(const n of g.nodes){if(!text(n.id)||ns.has(n.id)||!text(n.label))throw Error("invalid node");ns.add(n.id)}
 for(const e of g.edges){if(!text(e.id)||es.has(e.id)||!ns.has(e.from)||!ns.has(e.to)||!predicates.has(e.predicate))throw Error("invalid edge");es.add(e.id)}
 if(source&&(!text(g.name)||!text(g.domain)||!/^https?:\/\//.test(g.source?.url??"")||!text(g.source?.claim)||!text(g.source?.review)||!Array.isArray(g.limits)||!g.limits.length||!g.limits.every(text)))throw Error("missing source or analogy limits");
 return g;
}

export function rankCandidates(target,objects,ontology,{shortlist=12,budget=20000}={}){
 if(!Number.isInteger(shortlist)||shortlist<1||!Number.isInteger(budget)||budget<1||budget>1000000)throw Error("invalid search bounds");
 const ps=new Set(ontology.predicates.map(p=>p.id));validateGraph(target,ps);
 if(!Array.isArray(objects)||new Set(objects.map(o=>o.id)).size!==objects.length)throw Error("duplicate source IDs");
 const targetCounts=new Map();for(const e of target.edges)targetCounts.set(e.predicate,(targetCounts.get(e.predicate)||0)+1);
 const coarse=objects.map(o=>{validateGraph(o,ps,true);const counts=new Map();for(const e of o.edges)counts.set(e.predicate,(counts.get(e.predicate)||0)+1);let recall=0;for(const [p,n] of targetCounts)recall+=Math.min(n,counts.get(p)||0);return {o,recall}}).filter(x=>x.recall>0).sort((a,b)=>b.recall-a.recall||a.o.id.localeCompare(b.o.id));
 const results=coarse.slice(0,shortlist).map(({o,recall})=>{
  let best=[],bestNodes={},steps=0,truncated=false;
  const ordered=[...target.edges].sort((a,b)=>Number(b.essential===true)-Number(a.essential===true)||a.id.localeCompare(b.id));
  const weight=edges=>edges.reduce((s,p)=>s+(target.edges.find(e=>e.id===p.targetEdge).essential===true?3:1),0);
  function dfs(i,mapping,usedNodes,usedEdges,matched){
   if(++steps>budget){truncated=true;return}
   if(weight(matched)>weight(best)){best=matched.slice();bestNodes=Object.fromEntries(mapping)}
   if(i===ordered.length||truncated)return;
   const e=ordered[i];
   for(const s of o.edges){
    if(s.predicate!==e.predicate||usedEdges.has(s.id))continue;
    const m=new Map(mapping),u=new Set(usedNodes);let ok=true;
    for(const [a,b] of [[e.from,s.from],[e.to,s.to]]){if(m.has(a)){if(m.get(a)!==b)ok=false}else if(u.has(b))ok=false;else {m.set(a,b);u.add(b)}}
    if(ok)dfs(i+1,m,u,new Set([...usedEdges,s.id]),[...matched,{targetEdge:e.id,sourceEdge:s.id}]);
    if(truncated)return;
   }
   dfs(i+1,mapping,usedNodes,usedEdges,matched);
  }
  dfs(0,new Map(),new Set(),new Set(),[]);
  const matchedIds=new Set(best.map(x=>x.targetEdge));const missing=target.edges.filter(e=>!matchedIds.has(e.id)).map(e=>e.id);
  return {id:o.id,name:o.name,domain:o.domain,coarseRecall:recall,matched:best,nodeMapping:bestNodes,unmapped:missing,missingEssential:target.edges.filter(e=>e.essential===true&&!matchedIds.has(e.id)).map(e=>e.id),coverage:best.length/target.edges.length,weightedMatch:weight(best),truncated,steps,source:o.source,limits:o.limits,status:"candidate-not-approved"};
 }).sort((a,b)=>a.missingEssential.length-b.missingEssential.length||b.weightedMatch-a.weightedMatch||Number(a.truncated)-Number(b.truncated)||a.id.localeCompare(b.id));
 return {status:results.length?"candidates":"open-discovery-required",results,searchTruncated:coarse.length>shortlist||results.some(x=>x.truncated),unsearched:Math.max(0,coarse.length-shortlist),scope:"exact directed predicate alignment over authored graphs; not SME or MAC/FAC reproduction; no semantic or creative approval"};
}

export function critiqueMapping(target,candidate,review){
 const issues=[];const txt=x=>typeof x==="string"&&x.trim().length>0;
 if(!candidate||!Array.isArray(candidate.missingEssential)||candidate.missingEssential.length)issues.push("essential relation not mapped");
 if(candidate?.truncated)issues.push("search truncated: inspect alternative alignments");
 if(!review||!txt(review.evidenceRef)||!txt(review.boundary)||!txt(review.plainAlternative)||!txt(review.styleRef))issues.push("missing evidence, analogy boundary, plain alternative or style reference");
 if(!review||review.unsupportedCausality!==false||review.falseQuantification!==false||review.sourceMechanismVerified!==true)issues.push("semantic hard gate not satisfied");
 if(!review||!["observed","hypothesis","assumption","conceptual"].includes(review.evidenceKind))issues.push("missing evidence status");
 return {eligibleForConcept:issues.length===0,issues,status:"declared review only",releaseAuthorized:false};
}
