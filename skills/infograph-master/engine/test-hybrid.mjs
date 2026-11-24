import assert from 'node:assert/strict';
import {routeBlock,planHybrid,createState,repairPlan} from './hybrid.mjs';
const b={id:'B1',task:'ranking',evidenceIds:['E1']},d={unit:'percent',rows:[{label:'A',value:10}]};
assert.equal(routeBlock(b,d).mode,'deterministic');
assert.equal(routeBlock({...b,task:'map'},d).mode,'generative');
assert.equal(routeBlock(b,{...d,rows:[{label:'A',value:-1}]}).mode,'generative');
const s=createState('a',['a','b']);let calls=0;const off=s.subscribe(()=>calls++);s.set('b');s.set('b');off();s.set('a');assert.equal(calls,1);assert.equal(s.get(),'a');assert.throws(()=>s.set('x'));
assert.equal(repairPlan([{blockId:'B1',message:'overflow'}],[{blockId:'B1'}])[0].scope,'block');
assert.equal(planHybrid({scenes:[{id:'S1',blocks:[b]}],interaction:{transitions:[]},spatial:{objects:[]}},{B1:d}).runtimeReady,true);
