import {auditSystemPlan,auditSystemProgress} from './system-refactor.mjs';
import {fingerprint} from './reconstruction-orchestrator.mjs';
const copy=x=>JSON.parse(JSON.stringify(x));
const str=x=>typeof x==='string'&&x.trim().length>0;
const hash=x=>/^sha256:[a-f0-9]{64}$/.test(x||'');
const actions=['adapt','refine','restructure','reinvent'];
function verify(plan,state){
 if(!state||state.version!==1||state.planFingerprint!==fingerprint(plan)||state.ledger?.planRevision!==plan.planRevision||state.ledger?.contractRevision!==plan.contract.revision||!hash(state.currentRef)||!Array.isArray(state.history))throw Error('stale or invalid checkpoint');
 const a=auditSystemProgress(plan,state.ledger);if(a.errors.length)throw Error(a.errors.join('; '));return a;
}
export function initBatchLoop(plan,ledger,originalRef){
 if(!auditSystemPlan(plan).eligible||!hash(originalRef)||originalRef!==plan.sourceRef)throw Error('invalid plan or original bytes');
 const a=auditSystemProgress(plan,ledger);if(a.errors.length)throw Error(a.errors.join('; '));
 if(ledger.records.length!==plan.atlas.slices.length||ledger.records.some(r=>['implemented','in-progress'].includes(r.status)))throw Error('initial ledger must enumerate all slices without preimplemented work');
 return {version:1,planFingerprint:fingerprint(plan),currentRef:originalRef,ledger:copy(ledger),active:null,history:[]};
}
export function beginBatch(plan,state,{limit=3,currentRef}={}){
 const a=verify(plan,state);if(state.active)throw Error('active batch exists; resume or reject it');
 if(currentRef!==state.currentRef)throw Error('working artifact changed');
 if(!Number.isInteger(limit)||limit<1||limit>12)throw Error('invalid batch limit');
 const ids=a.ready.slice(0,limit);if(!ids.length)return {state:copy(state),batch:null,remaining:a.counts.unfinished,reason:'no ready changes; inspect pending retention, dependencies, or final QA'};
 const selected=plan.atlas.slices.filter(s=>ids.includes(s.id)),pages=new Set(selected.map(s=>s.pageId)),shared=new Set(selected.flatMap(s=>s.sharedIds));
 const affected=plan.atlas.slices.filter(s=>pages.has(s.pageId)||s.sharedIds.some(id=>shared.has(id))||s.executionDeps.some(id=>ids.includes(id))).map(s=>s.id);
 const next=copy(state);
 next.active={id:'batch-'+(state.history.length+1),inputRef:currentRef,sliceIds:ids,affectedSliceIds:affected,requiredChecks:[...ids.flatMap(id=>['semantic:'+id,'style:'+id,'interaction:'+id]),...affected.map(id=>'neighbor:'+id),'shared-state','navigation'],planFingerprint:state.planFingerprint};
 for(const r of next.ledger.records)if(ids.includes(r.sliceId))r.status='in-progress';
 return {state:next,batch:next.active,remaining:a.counts.unfinished};
}
export function finishBatch(plan,state,result){
 verify(plan,state);const b=state.active;if(!b)throw Error('no active batch');
 if(result?.batchId!==b.id||result.inputRef!==b.inputRef||result.planFingerprint!==state.planFingerprint)throw Error('stale batch result');
 if(!hash(result.outputRef)||result.outputRef===b.inputRef)throw Error('candidate bytes must differ');
 const next=copy(state),checks=result.checks||[];
 const missing=b.requiredChecks.filter(key=>{const r=checks.filter(x=>x.key===key);return r.length!==1||r[0].status!=='pass'||r[0].outputRef!==result.outputRef||!str(r[0].ref)});
 if(missing.length)return {accepted:false,state:next,missing,reason:'candidate not promoted; repair or reject active batch'};
 for(const r of next.ledger.records)if(b.sliceIds.includes(r.sliceId)){r.status='implemented';r.outputRef=result.outputRef;r.ref=result.artifactRef||result.outputRef;}
 next.currentRef=result.outputRef;
 next.history.push({batchId:b.id,status:'accepted',inputRef:b.inputRef,outputRef:result.outputRef,sliceIds:b.sliceIds,checks:copy(checks)});
 next.active=null;next.ledger.integration={};return {accepted:true,state:next,missing:[]};
}
export function rejectBatch(plan,state,reason,currentRef){
 verify(plan,state);if(!state.active||!str(reason)||currentRef!==state.currentRef)throw Error('reject requires active batch and last accepted bytes');
 const n=copy(state),b=n.active;
 for(const r of n.ledger.records)if(b.sliceIds.includes(r.sliceId))r.status='pending';
 n.history.push({batchId:b.id,status:'rejected',inputRef:b.inputRef,sliceIds:b.sliceIds,reason});n.active=null;return n;
}
export function resumeBatch(plan,state,currentRef){
 const a=verify(plan,state);if(currentRef!==state.currentRef)throw Error('working artifact changed');
 return {active:state.active,currentRef,ready:a.ready,counts:a.counts,remaining:a.unverified,scopeComplete:!state.active&&a.scopeComplete,fullDashboardComplete:!state.active&&a.fullDashboardComplete};
}
