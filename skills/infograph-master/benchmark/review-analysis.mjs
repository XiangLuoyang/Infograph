import {normalizeReview} from './normalize-review.mjs';
import {collectRuns} from './collect-runs.mjs';
import {analyzePairs} from './benchmark-analytics.mjs';
// Settings are coordinator-read actual settings, keyed by run ID; never API secrets.
export function analyzeReviewed({schedule,records,settingsByRun,reviews,key,applicability,adjudications,rubric}){
 const collected=collectRuns(schedule,records),slots=new Map(),ratings=new Map(),seen=new Set();
 for(const r of collected.records){
 const s=settingsByRun[r.runId];
 if(!s||typeof s.model!=='string'||!s.model||!Number.isInteger(s.max_tokens)||s.max_tokens<1||!Number.isFinite(s.temperature))throw Error('missing settings: '+r.runId);
 const signature=JSON.stringify([r.modelVersion,s.model,s.max_tokens,s.temperature,s.reasoning_effort??null]);
 if(slots.has(r.modelSlot)&&slots.get(r.modelSlot)!==signature)throw Error('mixed model settings: '+r.modelSlot);
 slots.set(r.modelSlot,signature);
 }
 for(const review of reviews)for(const row of normalizeReview({review,key,records,applicability,adjudications,rubric})){
 const id=JSON.stringify([row.runId,row.reviewer]);if(seen.has(id))throw Error('duplicate reviewer rating');seen.add(id);
 const rows=ratings.get(row.runId)||[];rows.push(row);ratings.set(row.runId,rows);
 }
 const reviewed=collected.records.map(r=>{
 const rows=ratings.get(r.runId)||[],a=adjudications[r.runId];
 const hardFail=a?.hardFailReview==='complete'&&Array.isArray(a.hardFails)&&a.hardFails.length>0;
 if(hardFail&&a.hardFails.some(f=>!rubric.hardFails.includes(f)))throw Error('invalid hard fail');
 const status=r.status==='failed'?'execution-failed':hardFail?'fail':rows.length&&rows.every(x=>x.status==='scored')?'scored':'not-run';
 return {...r,reviewStatus:status,reviewCount:rows.length,score:status==='scored'?rows.reduce((n,x)=>n+x.score,0)/rows.length:null};
 });
 return {records:reviewed,reviewSummary:Object.fromEntries(['execution-failed','fail','scored','not-run'].map(s=>[s,reviewed.filter(r=>r.reviewStatus===s).length])),analysis:analyzePairs(schedule,reviewed)};
}
