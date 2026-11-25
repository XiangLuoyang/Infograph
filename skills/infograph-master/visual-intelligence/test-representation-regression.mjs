import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selectRepresentation} from './representation-selector.mjs';
const index=JSON.parse(readFileSync(new URL('./representation-index.json',import.meta.url),'utf8'));
assert.equal(index.length,630);
assert.equal(new Set(index.map(x=>x.id)).size,630);
assert.equal(index.flatMap(x=>x.routes).length,28);
for(const x of index) for(const r of x.routes) assert.equal(new Set(r.requires).size,r.requires.length);
const flow=index.find(x=>x.id==='VIZ-0142');
for(const r of flow.routes) {
 const available=[...new Set([...r.requires,...flow.overlays.flatMap(o=>o.requiredInputs||[])])];
 for(const k of ['source','target','quantity','unit','coordinates','crs']) assert.ok(r.requires.includes(k));
 const req={relation:r.relation,task:r.task,available,limit:100};
 assert.ok(selectRepresentation(index,req).ready.some(x=>x.id===flow.id));
 for(const k of r.requires) assert.ok(selectRepresentation(index,{...req,available:available.filter(v=>v!==k)}).blocked.some(x=>x.id===flow.id));
}
for(const id of ['VIZ-0161','VIZ-0091']) assert.ok(index.find(x=>x.id===id).routes.every(r=>r.channels.includes('color')));
assert.throws(()=>selectRepresentation(index,{limit:0}));
console.log('C02 regression checks passed');
