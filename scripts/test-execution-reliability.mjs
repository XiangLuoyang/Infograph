import assert from 'node:assert/strict';
import {authoringTask,spatialScaffold,specialistScaffold} from './execution-authoring.mjs';
import {compileSpatialComposition} from '../skills/infograph-master/engine/global-spatial-composition.mjs';

import {atlasIdentityDiff} from './execution-specialists.mjs';
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
assert.deepEqual(atlasIdentityDiff(scaffold.atlas,requirements),{missing:[],unexpected:[],duplicates:[]});
assert.deepEqual(atlasIdentityDiff({slices:[{id:'summary',pageId:'overview'},{id:'summary',pageId:'overview'},{id:'trend',pageId:'analysis'}]},requirements),{missing:[['trend','overview'],['detail','analysis']],unexpected:[['trend','analysis']],duplicates:[['summary','overview']]});
const integrated=structuredClone(prior);
integrated['production-plan'].output.specialists={...requirements,integrated:true,areas:['QD01','QD02','QD03','QD04','QD05']};
const workspace=authoringTask('specialist-plan',{},integrated,[]).template.workspace;
assert.deepEqual(workspace.atlas,scaffold.atlas);
assert.deepEqual(workspace.spatial,scaffold.spec);
assert.deepEqual(workspace.story,specialistScaffold('QD01').story);
assert.deepEqual(workspace.choreography,specialistScaffold('QD02'));
assert.deepEqual(workspace.concept,specialistScaffold('QD03'));
assert.deepEqual(workspace.motion,specialistScaffold('QD04'));
assert.equal(workspace.concept.source,null);
console.log('execution reliability scaffold regression passed');

import {activationSignals,auditActivation} from './execution-activation.mjs';
const prepared={ir:{nodes:[{id:'t',kind:'table',ref:'source#t',label:'Table'},{id:'c',kind:'chart',ref:'source#c',label:'Chart'},{id:'i',kind:'control',ref:'source#i',label:'Filter'}]}};
const signals=activationSignals(prepared);
assert.equal(signals.length,3);
const slices=[{id:'s',expression:'retain',mechanism:'none'}];
const quality={semanticInteraction:false};
const reviews=signals.map(s=>({observationId:s.id,ref:s.ref,disposition:'mapped',sliceId:'s',reason:'retain exact lookup',mechanismReason:'ordinary monitoring chart',staticReason:'filter only'}));
assert.equal(auditActivation(signals,reviews,slices,quality).eligible,true);
assert.equal(auditActivation(signals,[],slices,quality).eligible,false);
assert.equal(auditActivation(signals,reviews,[{...slices[0],expression:'none'}],quality).eligible,false);
assert.equal(auditActivation(signals,reviews.map(r=>({...r,ref:'wrong'})),slices,quality).eligible,false);
assert.equal(auditActivation([],undefined,slices,quality).eligible,true);
const sourcePrior={'reconstruction-prepare':{output:prepared,receipt:{outputSha256:'synthetic'}}};
assert.equal(authoringTask('production-plan',{},sourcePrior,[]).template.activationReviews.length,3);
console.log('activation regression assertions passed');

const scenePrepared={ir:{nodes:[{id:'m',kind:'region',label:'视觉隐喻',ref:'source#m'},{id:'ordinary',kind:'chart',label:'Sales trend',ref:'source#ordinary'}]}};
const sceneSignals=activationSignals(scenePrepared);
assert.equal(sceneSignals.filter(s=>s.review==='mechanism-candidate').length,1);
const hint=sceneSignals.find(s=>s.kind==='scene-hint');
const review={observationId:hint.id,ref:hint.ref,evidenceRefs:hint.evidenceRefs,disposition:'mapped',sliceId:'s',reason:'assess existing scene',mechanismReason:'compare conventional alternative',mechanismDecision:'reviewed'};
assert.equal(auditActivation([hint],[review],slices,quality).eligible,true);
assert.equal(auditActivation([hint],[{...review,mechanismDecision:'selected'}],slices,quality).eligible,false);
assert.equal(auditActivation([hint],[{...review,mechanismDecision:'selected'}],[{...slices[0],mechanism:'selected'}],quality).eligible,true);
assert.equal(auditActivation([hint],[{...review,evidenceRefs:[]}],slices,quality).eligible,false);
assert.equal(auditActivation([hint],[],slices,quality).eligible,false);

const depthSignal=sceneSignals.find(s=>s.review==='scene-depth');
assert.ok(depthSignal);
const depthReview={...review,observationId:depthSignal.id,artDecision:'simple',motionDecision:'static',artReason:'flat diagram sufficient',motionReason:'no state change'};
assert.equal(auditActivation([depthSignal],[depthReview],slices,quality).eligible,true);
assert.equal(auditActivation([depthSignal],[{...depthReview,artDecision:'rich'}],slices,quality).eligible,false);
const richQuality={...quality,richScene:true,areas:[{id:'QD03',applicable:true},{id:'QD04',applicable:true}]};
assert.equal(auditActivation([depthSignal],[{...depthReview,motionDecision:'physical'}],slices,richQuality).eligible,true);
assert.equal(auditActivation([depthSignal],[{...depthReview,motionDecision:'semantic'}],slices,richQuality).eligible,false);
console.log('scene depth regression assertions passed');
