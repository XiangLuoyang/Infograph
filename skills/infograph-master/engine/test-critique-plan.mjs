import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {critiquePlan} from './critique-plan.mjs';
const rubric=JSON.parse(readFileSync(new URL('../references/critique-rubric.json',import.meta.url),'utf8'));const f=JSON.parse(readFileSync(new URL('./critique.example.json',import.meta.url),'utf8'));assert.deepEqual(critiquePlan(f.input,rubric),f.result);assert.equal(f.result.next.key,'evidence:claim-support');assert.equal(critiquePlan({...f.input,attempt:3},rubric).status,'budget-exhausted');assert.equal(critiquePlan({...f.input,previous:[f.result.signature]},rubric).status,'no-progress');assert.equal(critiquePlan({...f.input,revision:2},rubric).unknown.length,19);
