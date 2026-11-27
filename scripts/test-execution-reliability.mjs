import assert from 'node:assert/strict';
import {authoringTask,spatialScaffold} from './execution-authoring.mjs';
import {compileSpatialComposition} from '../skills/infograph-master/engine/global-spatial-composition.mjs';

const inventory=[{id:'summary',page:'overview'},{id:'trend',page:'overview'},{id:'detail',page:'analysis'}];
const requirements={inventory,areas:['QD05'],integrated:false};
const scaffold=spatialScaffold(requirements);
assert.deepEqual(scaffold.conflicts,[]);
assert.deepEqual(scaffold.invalidIds,[]);
assert.deepEqual(scaffold.atlas.slices.map(x=>[x.id,x.pageId]),inventory.map(x=>[x.id,x.page]));
assert.deepEqual(scaffold.spec.pages[0].sliceOrder,['summary','trend']);
assert.equal(new Set(scaffold.atlas.inventory.map(x=>x.id)).size,5);
assert.deepEqual(spatialScaffold({inventory:[{id:'overview',page:'overview'}]}).conflicts,['overview']);
assert.deepEqual(spatialScaffold({inventory:[{id:'bad id',page:'overview'}]}).invalidIds,['bad id']);
assert.throws(()=>compileSpatialComposition(scaffold.atlas,scaffold.spec),/missing spatial contract/);
const prior={'production-plan':{output:{revision:1,specialists:requirements,selectedMechanisms:[]},receipt:{outputSha256:'synthetic'}}};
for(const stage of ['reconstruction-prepare','production-plan','specialist-plan']){
 const task=authoringTask(stage,{},prior,[]);
 for(const ref of ['context-guide.md','acceptance.md','design-principles.md']){
  assert(task.references.includes('skills/infograph-master/references/'+ref));
 }
 assert.equal(new Set(task.references).size,task.references.length);
}
const task=authoringTask('specialist-plan',{},prior,[]);
assert.deepEqual(task.template.routes.QD05.spec.atlas,scaffold.atlas);
assert.deepEqual(task.template.routes.QD05.spec.spec,scaffold.spec);
assert.equal(task.template.routes.QD05.spec.atlas.coverage,null);
console.log('execution reliability scaffold regression passed');
