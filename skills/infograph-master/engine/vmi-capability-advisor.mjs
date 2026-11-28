// Advisory only: use verified exploration mappings and actual geometry catalog.
const patterns={
 tank:/(水箱|储罐|蓄水池|水库|reservoir|\btank\b)/i,
 'handwheel-valve':/(手轮阀|手动阀|阀门|handwheel|manual valve|\bvalve\b)/i,
 'manifold-four':/(四路分流|四通分配|four[- ](?:way|port|branch)|manifold)/i,
 'dial-indicator':/(指针表|仪表盘|压力表|刻度盘|dial|gauge)/i
};
const unique=a=>[...new Set(a)];
function graphShape(p){
 const n=p.nodes.length,edges=p.edges.filter(e=>e.essential),out=new Map(p.nodes.map(x=>[x.id,new Set()])),adj=new Map(p.nodes.map(x=>[x.id,new Set()]));
 for(const e of edges){out.get(e.from)?.add(e.to);adj.get(e.from)?.add(e.to);adj.get(e.to)?.add(e.from)}
 const degree=[...adj].filter(([,s])=>s.size===n-1).map(([id])=>id);
 const active=new Set(),done=new Set();function cycle(id){if(active.has(id))return true;if(done.has(id))return false;active.add(id);for(const next of out.get(id)??[])if(cycle(next))return true;active.delete(id);done.add(id);return false}
 const cyclic=p.nodes.some(x=>cycle(x.id));
 return {nodes:n,essentialEdges:edges.length,cyclic,branchNodes:[...out].filter(([,s])=>s.size>=2).map(([id,s])=>({id,distinctTargets:s.size})),hubNodes:n>=3?degree:[],composition:n<2||n>6?['manual']:unique(['row-grid/stack',...(!cyclic&&[...out.values()].some(s=>s.size>=2)?['layered']:[]),...(n>=3&&degree.length?['hub']:[])])};
}
export function recommendCapabilities(perspectives,exploration,corpus,library,art=null){
 const sources=new Map(corpus.map(s=>[s.id,s])),templates=library.filter(t=>Array.isArray(t.roles)&&t.roles.length);
 return perspectives.map(p=>{
  const view=exploration.views.find(v=>v.perspectiveId===p.id);
  if(!view)throw Error('missing exploration perspective: '+p.id);
  const shape=graphShape(p);
  const targetNodes=new Map(p.nodes.map(n=>[n.id,n]));
  const candidates=view.results.slice(0,4).map(r=>{
   const source=sources.get(r.id);if(!source)throw Error('missing mapped source: '+r.id);
   const components=Object.entries(r.nodeMapping??{}).map(([targetId,sourceId])=>{
    const target=targetNodes.get(targetId),node=source.nodes.find(n=>n.id===sourceId);
    if(!target||!node)throw Error('invalid mapped node');
    const matches=templates.filter(t=>t.roles.includes(node.role)).map(t=>{
     const lexical=Boolean(patterns[t.kind]?.test(node.label??''));
     const branchCount=shape.branchNodes.find(b=>b.id===targetId)?.distinctTargets??0;
     const cardinality=t.branchCount===undefined||branchCount===t.branchCount;
     return {kind:t.kind,status:lexical&&cardinality?'inspect-physical-fit':'role-only-not-recommended',materials:unique(t.parts.map(x=>x[1])),branchCount:t.branchCount??null,requiresBranchEvidence:t.branchCount!==undefined,reason:!lexical?'Source label does not identify this physical form; role match is insufficient.':!cardinality?'Mapped essential branch count does not support this component.':'Role and source label support inspection only; verify actual physical form, mapped relation and boundaries.'};
    });
    return {targetId,targetLabel:target.label,sourceId:source.id,nodeId:node.id,sourceLabel:node.label,sourceRole:node.role??null,geometry:matches,customGeometryNeeded:!matches.some(t=>t.status==='inspect-physical-fit')};
   });
   return {sourceId:r.id,name:r.name,domain:r.domain,coverage:r.coverage,missingEssential:r.missingEssential,reviewRequired:r.reviewRequired,truncated:r.truncated,eligibleForManualComparison:r.eligibleForManualComparison,sourceRef:source.source?.url??null,limits:source.limits,components};
  });
  return {perspectiveId:p.id,evidenceRef:p.evidenceRef,evidenceKind:p.evidenceKind,shape,candidates,openDiscoveryRequired:view.needsOpenDiscovery,advice:{
   geometry:'Inspect physical-fit candidates before selection; role-only candidates are warnings, not suggested substitutions. Use custom geometry or plain representation when unsupported.',
   materials:'Use catalog material recipes only for compatible physical components and decoration; no quantified level, needle or flow without evidence.',
   topology:'Use physical pipes only for explicitly mapped fluid connections with valid ports; other relations stay symbolic. Branch count alone is not a pipe relation.',
   composition:'Compare listed structural families against actual reviewed scene objects and readable labels; this target graph is not a selected scene.',
   dynamic:'Inspect source controls and formulas; no numeric motion, units or ranges inferred from abstract graph edges.',
   art:art?.selected?.id?'Reuse upstream ART '+art.selected.id+'; verify actual inherited render.':'No upstream ART selected; compare inherited baseline or return to production-plan for executable ART if appropriate.'
  },scope:'bounded advisory suggestions from authored and verified graph mappings, not independent source verification, aesthetic recommendation, automatic geometry selection or approved concept'};
 });
}
