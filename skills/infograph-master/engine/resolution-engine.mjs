export function proposeRepairs(ir,report,catalog){
 if(report?.designId!==ir.id||report.revision!==ir.revision||!Array.isArray(report.results))throw Error('stale or invalid report');
 const objects=new Map(ir.graph.objects.map(o=>[o.id,o])),proposals=[];
 for(const r of report.results){
 if(!['hard','soft'].includes(r.severity)||!['conflict','unknown','satisfied'].includes(r.status)||objects.get(r.blockId)?.type!=='Block'||!Object.hasOwn(catalog,r.ruleId))throw Error('invalid rule result');
 if(r.status==='satisfied')continue;
 const targets=ir.graph.links.filter(l=>l.from===r.blockId&&l.type==='uses').map(l=>l.to);
 const candidates=r.status==='unknown'?[{id:'collect-evidence',action:'Collect missing or measured facts',affectedIds:[],cost:0}]:catalog[r.ruleId].map(([id,action,types,cost])=>({id,action,affectedIds:targets.filter(t=>types.includes(objects.get(t)?.type)),cost})).sort((a,b)=>a.cost-b.cost);
 proposals.push({ruleId:r.ruleId,blockId:r.blockId,severity:r.severity,status:r.status,candidates,requires:['explicit selection','new design revision','recompute specialist outputs','fresh conflict check'],automatic:false});
 }
 proposals.sort((a,b)=>Number(b.severity==='hard')-Number(a.severity==='hard')||Number(b.status==='conflict')-Number(a.status==='conflict'));
 return {designId:ir.id,revision:ir.revision,proposals,scope:'heuristic proposal order; not proven repair or authorization'};
}
