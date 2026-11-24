import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateDesign,compileDesign} from './design-v2.mjs';
const read=async n=>JSON.parse(await readFile(new URL(n,import.meta.url),'utf8'));
const c={};for(const n of ['styles.json','composition-patterns.json','material-catalog.json','motion-grammar.json','chart-rules.json'])c[n]=await read(n);
const d=await read('design-v2.example.json');
assert.deepEqual(validateDesign(d,c).errors,[]);
assert.equal(compileDesign(d,c).scenes[0].blocks[0].span.mobile,12);
for(const mutate of [x=>x.visual.material='missing',x=>x.narrative.scenes[0].blocks[0].evidenceIds=['X'],x=>x.narrative.scenes[0].blocks[0].fields=[],x=>x.interaction.initial='X',x=>x.validation.results=[{check:'browser-review',status:'pass'}],x=>x.narrative.scenes.push(x.narrative.scenes[0]),x=>x.interaction.transitions=[{id:'T1',from:'S1',to:'X',motion:'focus',trigger:'click'}]]){const x=structuredClone(d);mutate(x);assert.ok(validateDesign(x,c).errors.length)}
console.log('9 Design IR assertions passed');
