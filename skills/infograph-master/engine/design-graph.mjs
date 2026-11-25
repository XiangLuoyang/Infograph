export function auditDesignGraph(graph,model){
 const errors=[],byId=new Map(),links=graph?.links;
 if(graph?.version!==model.version||!Array.isArray(graph?.objects)||!Array.isArray(links))return {errors:['invalid graph envelope']};
 const str=x=>typeof x==='string'&&x.trim().length>0;
 for(const o of graph.objects){if(!str(o?.id)||byId.has(o.id)||!Object.hasOwn(model.types,o.type)){errors.push('invalid object '+o?.id);continue}byId.set(o.id,o);for(const k of model.types[o.type])if(!str(o[k]))errors.push(o.id+' missing '+k);if(o.type==='Validation'&&!['pass','fail','not-run'].includes(o.status))errors.push(o.id+' invalid validation status');if(o.type==='Constraint'&&!['hard','soft'].includes(o.severity))errors.push(o.id+' invalid severity')}
 const seen=new Set(),valid=[];for(const l of links){const a=byId.get(l?.from),b=byId.get(l?.to),r=Object.hasOwn(model.relations,l?.type)?model.relations[l.type]:null,key=JSON.stringify([l?.from,l?.type,l?.to]);if(!a||!b||!r||!r[0].includes(a.type)||!r[1].includes(b.type)||seen.has(key)){errors.push('invalid or duplicate link '+key);continue}seen.add(key);valid.push(l)}
 for(const o of byId.values()){if(o.type==='Claim'&&o.status!=='hypothesis'&&!valid.some(l=>l.type==='supports'&&l.to===o.id))errors.push(o.id+' unsupported claim');if(o.type==='Validation'&&o.status==='pass'&&(!str(o.evidenceId)||byId.get(o.evidenceId)?.type!=='Evidence'))errors.push(o.id+' pass requires evidence')}
 for(const type of ['contains','advances']){const active=new Set(),done=new Set();function visit(id){if(active.has(id)){errors.push(type+' cycle '+id);return}if(done.has(id))return;active.add(id);for(const l of valid)if(l.type===type&&l.from===id)visit(l.to);active.delete(id);done.add(id)}for(const id of byId.keys())visit(id)}
 return {errors,objects:byId.size,links:valid.length,scope:'candidate graph integrity only; no truth, rendering or domain certification'};
}
