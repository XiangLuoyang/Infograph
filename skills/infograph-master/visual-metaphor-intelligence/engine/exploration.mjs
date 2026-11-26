export function relationPolicy(ontology){
 const ids=new Set(ontology.predicates.map(x=>x.id)),aliases=ontology.aliases??{},rules=ontology.relationRules??[];
 for(const [a,b] of Object.entries(aliases))if(ids.has(a)||!ids.has(b))throw Error("invalid alias");
 const seen=new Set();for(const r of rules){const k=r.source+">"+r.target;if(!ids.has(r.source)||!ids.has(r.target)||r.source===r.target||seen.has(k)||r.kind!=="source-entails-broader")throw Error("invalid relation rule");seen.add(k)}
 const normalize=x=>ids.has(x)?x:Object.hasOwn(aliases,x)?aliases[x]:null;
 return {normalize,match(source,target){const a=normalize(source),b=normalize(target);if(!a||!b)return null;if(a===b)return {kind:source===target?"exact":"alias",quality:1};return rules.some(r=>r.source===a&&r.target===b)?{kind:"generalized",quality:.65}:null}};
}

export function inspectPair(t,s,p){
 const m=p.match(s.predicate,t.predicate);if(!m)return null;const unknown=[];
 for(const k of ["condition","polarity"]){if(t[k]!==undefined){if(s[k]===undefined)unknown.push(k);else if(t[k]!==s[k])return null}}
 return {...m,unknown};
}

export function alignPerspective(target,objects,ontology,{shortlist=12,budget=20000,domainCap=3}={}){
 const policy=relationPolicy(ontology),txt=x=>typeof x==="string"&&x.trim().length>0;
 if(!Number.isInteger(shortlist)||shortlist<1||shortlist>100||!Number.isInteger(budget)||budget<1||budget>1000000||!Number.isInteger(domainCap)||domainCap<1)throw Error("invalid bounds");
 function validate(g,source){if(!txt(g?.id)||!Array.isArray(g.nodes)||!g.nodes.length||g.nodes.length>12||!Array.isArray(g.edges)||!g.edges.length||g.edges.length>24)throw Error("invalid graph");
 const ns=new Set(),es=new Set();for(const n of g.nodes){if(!txt(n.id)||!txt(n.label)||ns.has(n.id)||n.role!==undefined&&!txt(n.role))throw Error("invalid node");ns.add(n.id)}
 for(const e of g.edges){if(!txt(e.id)||es.has(e.id)||!ns.has(e.from)||!ns.has(e.to)||!policy.normalize(e.predicate)||e.condition!==undefined&&!txt(e.condition)||e.polarity!==undefined&&!["positive","negative","neutral"].includes(e.polarity))throw Error("invalid edge");es.add(e.id)}
 if(source&&(!txt(g.name)||!txt(g.domain)||!/^https:\/\//.test(g.source?.url??"")||!txt(g.source?.claim)||!txt(g.source?.review)||!g.limits?.length||!g.limits.every(txt)))throw Error("invalid source");}
 validate(target,false);if(!Array.isArray(objects)||new Set(objects.map(o=>o.id)).size!==objects.length)throw Error("duplicate objects");
 const ordered=[...target.edges].sort((a,b)=>Number(b.essential===true)-Number(a.essential===true)||a.id.localeCompare(b.id)),tm=new Map(target.nodes.map(n=>[n.id,n]));
 const candidates=objects.map(o=>{validate(o,true);let recall=0;for(const t of ordered)if(o.edges.some(s=>inspectPair(t,s,policy)))recall+=t.essential?3:1;return {o,recall}}).filter(x=>x.recall).sort((a,b)=>b.recall-a.recall||a.o.id.localeCompare(b.o.id));
 const counts=new Map(),selected=[],deferred=[];for(const c of candidates){const n=counts.get(c.o.domain)||0;if(selected.length<shortlist&&n<domainCap){selected.push(c);counts.set(c.o.domain,n+1)}else deferred.push(c)}while(selected.length<shortlist&&deferred.length)selected.push(deferred.shift());
 const results=selected.map(({o,recall})=>{
 let best=[],nodes={},bestScore=[-1,-1,-1],steps=0,truncated=false;const sm=new Map(o.nodes.map(n=>[n.id,n]));
 const score=a=>[a.filter(x=>x.essential&&x.kind!=="generalized"&&!x.unknown.length).length,a.filter(x=>x.essential).length,a.reduce((n,x)=>n+x.quality*(x.essential?3:1)*(x.unknown.length?.5:1),0)];
 const better=(a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]>b[i];return false};
 function visit(i,map,usedNodes,usedEdges,matched){if(++steps>budget){truncated=true;return}const sc=score(matched);if(better(sc,bestScore)){best=matched.slice();nodes=Object.fromEntries(map);bestScore=sc}if(i===ordered.length||truncated)return;const t=ordered[i];
 for(const s of o.edges){if(usedEdges.has(s.id))continue;const m=inspectPair(t,s,policy);if(!m)continue;const next=new Map(map),used=new Set(usedNodes),unknown=[...m.unknown];let ok=true;
 for(const [a,b] of [[t.from,s.from],[t.to,s.to]]){const tr=tm.get(a).role,sr=sm.get(b).role;if(tr!==undefined&&sr!==undefined&&tr!==sr){ok=false;break}if(tr!==undefined&&sr===undefined)unknown.push("role:"+a);if(next.has(a)){if(next.get(a)!==b)ok=false}else if(used.has(b))ok=false;else{next.set(a,b);used.add(b)}}
 if(ok)visit(i+1,next,used,new Set([...usedEdges,s.id]),[...matched,{targetEdge:t.id,sourceEdge:s.id,essential:t.essential===true,...m,unknown:[...new Set(unknown)]}]);if(truncated)return}
 visit(i+1,map,usedNodes,usedEdges,matched)}
 visit(0,new Map(),new Set(),new Set(),[]);const mapped=new Set(best.map(x=>x.targetEdge)),missingEssential=ordered.filter(x=>x.essential&&!mapped.has(x.id)).map(x=>x.id),reviewRequired=best.filter(x=>x.kind==="generalized"||x.unknown.length).map(x=>x.targetEdge);
 return {id:o.id,name:o.name,domain:o.domain,source:o.source,limits:o.limits,coarseRecall:recall,matches:best,nodeMapping:nodes,missingEssential,unmapped:ordered.filter(x=>!mapped.has(x.id)).map(x=>x.id),reviewRequired,coverage:best.length/ordered.length,score:bestScore,truncated,steps,eligibleForManualComparison:!missingEssential.length&&!truncated,status:"candidate-not-approved"}
 }).sort((a,b)=>a.missingEssential.length-b.missingEssential.length||b.score[0]-a.score[0]||b.score[2]-a.score[2]||Number(a.truncated)-Number(b.truncated)||a.id.localeCompare(b.id));
 return {perspectiveId:target.id,results,unsearched:deferred.map(x=>x.o.id),searchTruncated:!!deferred.length||results.some(x=>x.truncated),needsOpenDiscovery:!results.some(x=>x.eligibleForManualComparison&&!x.reviewRequired.length)||new Set(results.filter(x=>x.eligibleForManualComparison).map(x=>x.domain)).size<2,scope:"authored directed graph alignment; generalized and unknown relations require review"};
}

export function explorePerspectives(perspectives,objects,ontology,options={}){
 if(!Array.isArray(perspectives)||!perspectives.length||perspectives.length>8||new Set(perspectives.map(p=>p.id)).size!==perspectives.length)throw Error("invalid perspectives");
 const views=perspectives.map(p=>{if(typeof p.rationale!=="string"||!p.rationale.trim()||typeof p.evidenceRef!=="string"||!p.evidenceRef.trim()||!["observed","hypothesis","assumption","conceptual"].includes(p.evidenceKind)||!p.edges?.some(e=>e.essential===true))throw Error("missing abstraction evidence or essential relations");return {...alignPerspective(p,objects,ontology,options),rationale:p.rationale,evidenceRef:p.evidenceRef,evidenceKind:p.evidenceKind}});
 return {views,openDiscoveryRequired:views.some(v=>v.needsOpenDiscovery),candidateDomains:[...new Set(views.flatMap(v=>v.results.map(r=>r.domain)))],scope:"separate perspectives; no pooled score or automatic selection"};
}
