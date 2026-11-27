// Synthetic subprocess fixture. Never use as a production reviewer.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const mode=process.argv[2]??'valid';
if(mode==='timeout'){await new Promise(r=>setTimeout(r,5000));process.exit(0)}
if(mode==='nonzero')process.exit(7);
const {requestSha256,request}=JSON.parse(readFileSync(0,'utf8'));
if(mode==='invalid'){console.log('not JSON');process.exit(0)}
const hash=b=>createHash('sha256').update(b).digest('hex');
assert.equal(hash(Buffer.from(JSON.stringify(request,null,2)+'\n')),requestSha256);
for(const f of [request.evidence.html,request.evidence.browserReport,...request.evidence.captures,...(request.evidence.source?[request.evidence.source]:[])]){
 assert.equal(hash(readFileSync(f.path)),f.sha256);
}
assert.equal(request.evidence.source,null,'fixture source must be withheld');
const t=request.task.template;
const review={...t,reviewer:request.reviewer.id,reviewerKind:mode==='self'?'agent-self':'independent-model',captureReviews:t.captureReviews.map(x=>({...x,observation:'synthetic adapter observation, not actual visual review'})),reviews:t.reviews.map(x=>({...x,status:'pass',ref:'synthetic fixture',observation:'synthetic rubric result',captureIds:[t.captureReviews[0].id]}))};
if(mode==='incomplete')review.reviews[0].status='not-run';
if(mode==='reject')review.captureReviews[0].sha256='bad';
console.log(JSON.stringify({version:1,requestSha256:mode==='stale'?'bad':requestSha256,review}));
