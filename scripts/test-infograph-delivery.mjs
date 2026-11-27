import assert from 'node:assert/strict';
import {deliveryDecision} from './execution-delivery.mjs';
const observed={status:'browser-observed-pass'};
const complete={status:'declared-design-review-complete',reviewerKind:'independent-model',critique:{findings:[]}};
const self={...complete,reviewerKind:'agent-self'};
const incomplete={...self,status:'review-incomplete'};
const missingCaptures={...self,status:'capture-review-incomplete'};
const findings={...incomplete,critique:{findings:[{severity:'minor'}]}};
const repair={...findings,status:'repair-required'};
let n=0;
function expect(browser,review,mode,eligible){assert.equal(deliveryDecision(browser,review,mode).eligible,eligible,JSON.stringify({browser,review,mode}));n++}
for(const status of ['browser-pending','browser-observed-fail','browser-blocked'])expect({status},complete,'reviewed-candidate',false);
for(const status of ['browser-pending','browser-observed-fail','unknown'])expect({status},null,'unverified-draft',false);
expect({status:'browser-blocked'},null,'unverified-draft',true);
expect({status:'browser-blocked'},repair,'unverified-draft',false);
for(const review of [null,{status:'critique-pending'},incomplete,missingCaptures,self,{...incomplete,status:'budget-exhausted'}]){
 expect(observed,review,'unverified-draft',true);
 expect(observed,review,'reviewed-candidate',false);
}
for(const review of [findings,repair,{...findings,status:'capture-review-incomplete'},{...findings,status:'budget-exhausted'},{status:'review-incomplete'}, {...complete,reviewerKind:null},{...complete,critique:{findings:[{severity:'blocker'}]}}]){
 for(const mode of ['unverified-draft','reviewed-candidate'])expect(observed,review,mode,false);
}
for(const reviewerKind of ['independent-model','independent-human']){
 expect(observed,{...complete,reviewerKind},'reviewed-candidate',true);
 expect(observed,{...complete,reviewerKind},'unverified-draft',false);
}
assert.match(deliveryDecision(observed,incomplete,'unverified-draft').label,/UNVERIFIED DRAFT/);
assert.throws(()=>deliveryDecision(observed,complete,'release'),/invalid/);
console.log('P4 handoff policy: '+(n+2)+' assertions passed');
