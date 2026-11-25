import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inspectResult,createPreviewScheduler} from './studio-preview.mjs';
const repair=JSON.parse(readFileSync(new URL('./master-engine.report.json',import.meta.url),'utf8'));
const x=inspectResult({status:'rendered-unverified',repair});
assert.equal(x.tasks.length,5);assert.equal(x.tasks.find(t=>t.id==='chart').bindings.length,2);assert.equal(x.observations.length,6);
let q=[],n=0;const s=createPreviewScheduler(()=>n++,{schedule:f=>(q.push(f),q.length-1),cancel:()=>{}});s.request();s.request();q[0]();q[1]();assert.equal(n,1);s.request();s.cancel();q[2]();assert.equal(n,1);
