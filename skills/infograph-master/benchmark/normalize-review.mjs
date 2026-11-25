import {scoreRun} from './score.mjs';
// Coordinator supplies predeclared applicability and independently reviewed hard failures.
// Screenshot-only ratings must not substitute for functional engineering evidence.
export function normalizeReview({review,key,records,applicability,adjudications,rubric}){
 if(review?.version!=='0.1'||review.scope!=='screenshots-only'||typeof review.reviewer!=='string'||!review.reviewer.trim()||!Array.isArray(review.records))throw Error('invalid review');
 const map=new Map(key.map(k=>[k.blindId,k])),runs=new Map(records.map(r=>[r.runId,r]));
 if(map.size!==key.length||runs.size!==records.length||new Set(key.map(k=>k.runId)).size!==key.length)throw Error('duplicate identity');
 const seen=new Set(),dimensions=Object.keys(rubric.weights);
 return review.records.map(r=>{
 const k=map.get(r.id),run=k&&runs.get(k.runId);
 if(!k||!run||seen.has(r.id)||r.task!==k.task||run.task!==k.task||run.status!=='completed')throw Error('review identity mismatch');
 seen.add(r.id);
 const applicable=applicability[k.task],a=adjudications[k.runId];
 if(!Array.isArray(applicable)||!applicable.length||new Set(applicable).size!==applicable.length||applicable.some(d=>!dimensions.includes(d)))throw Error('invalid applicability');
 if(!r.scores||Object.entries(r.scores).some(([d,v])=>!dimensions.includes(d)||(v!==null&&(!Number.isInteger(v)||v<0||v>5))))throw Error('invalid review rating');
 if(!a||a.hardFailReview!=='complete')return {runId:k.runId,reviewer:review.reviewer,status:'not-run',score:null};
 if(!Array.isArray(a.hardFails)||a.hardFails.some(f=>!rubric.hardFails.includes(f)))throw Error('invalid hard fail');
 const scores={...r.scores};
 for(const d of ['interaction','engineering'])scores[d]=a.verifiedScores?.[d]??null;
 const result=scoreRun({applicable,hardFails:a.hardFails,scores},rubric);
 return {runId:k.runId,reviewer:review.reviewer,applicable,...result};
 });
}
