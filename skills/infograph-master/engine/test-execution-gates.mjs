import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditExecution} from './execution-gates.mjs';
const rules=JSON.parse(readFileSync(new URL('../references/execution-gates.json',import.meta.url),'utf8'));const fixture=JSON.parse(readFileSync(new URL('./execution-gates.example.json',import.meta.url),'utf8'));assert.deepEqual(auditExecution(fixture.input,rules),fixture.result);assert.equal(fixture.result.buildEligible,false);const records=[...fixture.input.records,{key:'storyboard',revision:1,status:'pass',ref:'fixture:storyboard'}];assert.equal(auditExecution({...fixture.input,records},rules).buildEligible,true);assert.equal(auditExecution({...fixture.input,records,revision:2},rules).buildEligible,false);
