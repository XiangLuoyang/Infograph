import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {proposeRepairs} from './resolution-engine.mjs';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const ir=read('./specialist-ir.example.json'),{report}=read('./conflict.example.json'),catalog=read('./repair-catalog.json');
assert.deepEqual(proposeRepairs(ir,report,catalog),read('./resolution.example.json'));
assert.throws(()=>proposeRepairs({...ir,revision:7},report,catalog));
report.results[0].status='unknown';
assert.ok(proposeRepairs(ir,report,catalog).proposals.some(p=>p.candidates[0].id==='collect-evidence'));
