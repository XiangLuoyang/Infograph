import assert from 'node:assert/strict';
import {deliveryDecision} from './execution-delivery.mjs';
const complete={status:'declared-design-review-complete'};
for(const status of ['browser-pending','browser-observed-fail','browser-blocked']){
 assert.equal(deliveryDecision({status},complete,'reviewed-candidate').eligible,false);
}
for(const status of ['browser-pending','browser-observed-fail','browser-observed-pass']){
 assert.equal(deliveryDecision({status},null,'unverified-draft').eligible,false);
}
assert.equal(deliveryDecision({status:'browser-blocked'},null,'unverified-draft').classification,'unverified-draft');
assert.equal(deliveryDecision({status:'browser-observed-pass'},null,'reviewed-candidate').eligible,false);
assert.equal(deliveryDecision({status:'browser-observed-pass'},{status:'repair-required'},'reviewed-candidate').eligible,false);
assert.equal(deliveryDecision({status:'browser-observed-pass'},complete,'reviewed-candidate').eligible,true);
assert.throws(()=>deliveryDecision({status:'browser-observed-pass'},complete,'release'),/invalid/);
console.log('P4 handoff policy negative paths passed');
