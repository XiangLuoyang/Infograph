import {executeSpecialist} from './specialist-execution.mjs';
export function planTasks(tasks){
 if(!Array.isArray(tasks)||!tasks.length)throw Error('tasks required');
 const map=new Map();
 for(const t of tasks){if(!t||typeof t.id!=='string'||!t.id||map.has(t.id)||!Array.isArray(t.dependsOn)||new Set(t.dependsOn).size!==t.dependsOn.length||!['color','typography','composition','material','motion','representation'].includes(t.studio))throw Error('invalid task');map.set(t.id,t)}
 const order=[],active=new Set(),done=new Set();
 function visit(id){if(active.has(id))throw Error('dependency cycle');if(done.has(id))return;if(!map.has(id))throw Error('missing dependency '+id);active.add(id);for(const dep of map.get(id).dependsOn)visit(dep);active.delete(id);done.add(id);order.push(id)}
 for(const id of map.keys())visit(id);
 return order;
}
export function affectedTasks(tasks,changed){
 const order=planTasks(tasks),map=new Map(tasks.map(t=>[t.id,t])),dirty=new Set(changed);
 for(const id of dirty)if(!map.has(id))throw Error('unknown changed task');
 for(const id of order)if(map.get(id).dependsOn.some(d=>dirty.has(d)))dirty.add(id);
 return order.filter(id=>dirty.has(id));
}
export function executeTasks(tasks,run=executeSpecialist){
 const order=planTasks(tasks),map=new Map(tasks.map(t=>[t.id,t])),results=new Map();
 for(const id of order){const t=map.get(id),blockedBy=t.dependsOn.filter(d=>results.get(d).status!=='generated');
 if(blockedBy.length){results.set(id,{id,status:'blocked',blockedBy});continue}
 try{const output=run(t.studio,t.input);results.set(id,{id,status:output.status,output})}catch(e){results.set(id,{id,status:'error',message:String(e.message)})}}
 return {order,results:[...results.values()],status:[...results.values()].every(r=>r.status==='generated')?'generated':'incomplete'};
}
