import {scoreRun} from '../score.mjs';
export function scoreBusiness(schedule,reviews,applicability,rubric){
 const ids=new Set(schedule.map(r=>r.id));if(ids.size!==18||schedule.length!==18)throw Error('invalid schedule');
 const byId=new Map();
 for(const r of reviews){
 if(!ids.has(r.runId)||byId.has(r.runId))throw Error('invalid review identity');
 if(r.hardFailReview!=='complete'||!Array.isArray(r.hardFails)||r.hardFails.some(x=>!rubric.hardFails.includes(x)))throw Error('invalid adjudication');
 const run=schedule.find(x=>x.id===r.runId),applicable=Object.keys(rubric.weights).filter(k=>applicability.tasks[run.task][k]===true);
 for(const [k,v] of Object.entries(r.scores??{}))if(!applicable.includes(k)||!(v===null||Number.isInteger(v)&&v>=0&&v<=5))throw Error('invalid rating');
 byId.set(r.runId,scoreRun({...r,applicable},rubric));
 }
 const records=schedule.map(r=>({runId:r.id,task:r.task,arm:r.arm,...(byId.get(r.id)??{status:'not-run',score:null})}));
 const pairs=Object.keys(applicability.tasks).map(task=>{
 const group=records.filter(r=>r.task===task);if(group.length!==3||new Set(group.map(r=>r.arm)).size!==3||!['baseline','v1.1','v1.2'].every(a=>group.some(r=>r.arm===a)))throw Error('invalid task group');
 const get=a=>group.find(r=>r.arm===a);
 return {task,status:group.every(r=>r.status==='scored')?'scored':group.some(r=>r.status==='fail')?'fail':'not-run',delta:group.every(r=>r.status==='scored')?{vsBaseline:Math.round((get('v1.2').score-get('baseline').score)*10)/10,vsV11:Math.round((get('v1.2').score-get('v1.1').score)*10)/10}:null};
 });
 return {records,pairs};
}
