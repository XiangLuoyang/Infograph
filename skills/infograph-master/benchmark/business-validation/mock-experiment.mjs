import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {prepare} from './prepare.mjs';
const read=n=>JSON.parse(readFileSync(new URL(n,import.meta.url),'utf8'));
const schedule=prepare(read('tasks.json'),read('fixtures.json'));
const applicability=read('applicability.json');
const privateKey=[],publicReview=[],records=[];
for(const run of schedule){
 const request={prompt:run.prompt};
 assert.deepEqual(Object.keys(request),['prompt']);
 // Mock transport only: no model, no filesystem sandbox, no real visual scores.
 const html='<html lang="en"><body><p>Mock artifact</p></body></html>';
 const id=randomUUID();
 privateKey.push({id,runId:run.id});
 publicReview.push({id,task:run.task,html,reader:applicability.tasks[run.task].reader});
 records.push({runId:run.id,task:run.task,arm:run.arm,status:'mock-completed',artifactHash:createHash('sha256').update(html).digest('hex')});
}
assert.equal(new Set(publicReview.map(r=>r.id)).size,18);
assert(publicReview.every(r=>!Object.hasOwn(r,'arm')&&!Object.hasOwn(r,'runId')));
const reviews=publicReview.map(r=>({id:r.id,status:'not-run',scores:null}));
const joined=reviews.map(r=>{const key=privateKey.find(k=>k.id===r.id);const record=records.find(x=>x.runId===key.runId);assert(record);return {...record,reviewStatus:r.status,scores:r.scores};});
const pairs=[];
for(const task of Object.keys(applicability.tasks)){
 const group=joined.filter(r=>r.task===task);
 assert.deepEqual(group.map(r=>r.arm).sort(),['baseline','v1.1','v1.2']);
 pairs.push({task,status:'not-run',delta:null});
}
assert.equal(pairs.length,6);
console.log(JSON.stringify({mode:'mock',runs:records.length,anonymousPackets:publicReview.length,pairs,realModelRuns:0,qualityConclusion:null,sandbox:'not-run'}));

import {scoreBusiness} from './score-business.mjs';
const rubric=read('../rubric.json');
const empty=scoreBusiness(schedule,[],applicability,rubric);
assert(empty.pairs.every(p=>p.status==='not-run'&&p.delta===null));
const synthetic=schedule.map(r=>({runId:r.id,hardFailReview:'complete',hardFails:[],scores:Object.fromEntries(Object.keys(rubric.weights).filter(k=>applicability.tasks[r.task][k]).map(k=>[k,3]))}));
const equal=scoreBusiness(schedule,synthetic,applicability,rubric);
assert(equal.records.every(r=>r.score===60));assert(equal.pairs.every(p=>p.delta.vsBaseline===0&&p.delta.vsV11===0));
synthetic[0].hardFails=['material numerical error'];
assert(scoreBusiness(schedule,synthetic,applicability,rubric).pairs.some(p=>p.status==='fail'&&p.delta===null));
assert.throws(()=>scoreBusiness(schedule,[synthetic[0],synthetic[0]],applicability,rubric));
console.log('Synthetic rubric regression passed; no model quality measurements');
