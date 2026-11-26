import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditExecution} from './execution-gates.mjs';
const rules=JSON.parse(readFileSync(new URL('../references/execution-gates.json',import.meta.url),'utf8'));const fixture=JSON.parse(readFileSync(new URL('./execution-gates.example.json',import.meta.url),'utf8'));assert.deepEqual(auditExecution(fixture.input,rules),fixture.result);assert.equal(fixture.result.buildEligible,false);const records=[...fixture.input.records,{key:'storyboard',revision:1,status:'pass',ref:'fixture:storyboard'}];assert.equal(auditExecution({...fixture.input,records},rules).buildEligible,true);assert.equal(auditExecution({...fixture.input,records,revision:2},rules).buildEligible,false);

const complete=auditExecution({...fixture.input,records},rules);assert.equal(complete.reviewComplete,true);
for(const key of rules.find(g=>g.id==='G09').requires){const r=auditExecution({...fixture.input,records:records.filter(x=>x.key!==key)},rules);assert.equal(r.buildEligible,false);assert.ok(r.blockers.includes('G09'));}
for(const key of rules.find(g=>g.id==='G10').requires){const r=auditExecution({...fixture.input,records:records.map(x=>x.key===key?{...x,status:'not-run'}:x)},rules);assert.equal(r.buildEligible,true);assert.equal(r.reviewComplete,false);assert.ok(r.blockers.includes('G10'));}
assert.ok(!auditExecution({...fixture.input,substantial:false,records},rules).gates.some(g=>['G09','G10'].includes(g.id)));
