import {planTasks} from './task-scheduler.mjs';
import {executeSpecialist} from './specialist-execution.mjs';
const safe=k=>typeof k==='string'&&k.length>0&&!['__proto__','prototype','constructor'].includes(k);
const clone=x=>JSON.parse(JSON.stringify(x));
function read(obj,path){for(const k of path){if(!safe(k)||obj==null||!Object.hasOwn(obj,k))throw Error('missing or unsafe source path');obj=obj[k]}return obj}
function valid(v,type){return type==='number'?typeof v==='number'&&Number.isFinite(v):type==='string'?typeof v==='string':type==='boolean'?typeof v==='boolean':false}
export function executeBoundTasks(tasks,run=executeSpecialist){
 const order=planTasks(tasks),map=new Map(tasks.map(t=>[t.id,t])),results=new Map();
 for(const t of tasks){const used=new Set();for(const b of t.bindings??[]){if(!t.dependsOn.includes(b.from)||!Array.isArray(b.path)||!b.path.length||!b.path.every(safe)||!safe(b.to)||used.has(b.to)||!['number','string','boolean'].includes(b.type)||Object.hasOwn(t.input??{},b.to))throw Error('invalid or conflicting binding');used.add(b.to)}}
 for(const id of order){const t=map.get(id),blockedBy=t.dependsOn.filter(d=>results.get(d).status!=='generated');if(blockedBy.length){results.set(id,{id,status:'blocked',blockedBy});continue}
 const trace=[];try{const input=clone(t.input??{});if(!input||typeof input!=='object'||Array.isArray(input))throw Error('invalid input');
 for(const b of t.bindings??[]){const value=read(results.get(b.from).output.payload,b.path);if(!valid(value,b.type))throw Error('binding type mismatch');input[b.to]=value;trace.push({from:b.from,path:b.path,to:b.to,type:b.type,value})}
 const output=run(t.studio,input);results.set(id,{id,status:output.status,input,trace,output});
 }catch(e){results.set(id,{id,status:'error',trace,message:String(e.message)})}}
 return {order,results:[...results.values()],status:[...results.values()].every(r=>r.status==='generated')?'generated':'incomplete'};
}
