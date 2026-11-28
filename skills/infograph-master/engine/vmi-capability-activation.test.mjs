import test from 'node:test';
import assert from 'node:assert/strict';
import {activationKeys,activationTemplate,auditActivation} from './vmi-capability-activation.mjs';
const fixture=()=>({html:'<svg/>',plans:[{plainAlternative:'Plain flow diagram',geometryManifest:[],surfaceRendering:null,topology:[],compositionManifest:null,dynamic:null}]});
const review=()=>({version:1,plainComparison:{ref:'Synthetic comparison',advantage:'Explains process ordering',tradeoff:'Takes additional space'},sourceInteraction:{status:'none',ref:'Synthetic source',reason:'No host controls'},decisions:Object.fromEntries(activationKeys.map(k=>[k,{mode:'omit',ref:'Synthetic source',reason:'Baseline test fixture',alternative:'Existing compiler path'}]))});
test('blank/missing records do not pass and plain alternative is required',()=>{
 assert.equal(auditActivation(review(),fixture(),null).status,'declared-activation-checked');
 assert.equal(auditActivation(undefined,fixture(),null).status,'blocked');
 assert.equal(auditActivation(activationTemplate(),fixture(),null).status,'blocked');
 const r=review();delete r.decisions.geometry;
 assert.equal(auditActivation(r,fixture(),null).status,'blocked');
 const f=fixture();delete f.plans[0].plainAlternative;
 assert.equal(auditActivation(review(),f,null).status,'blocked');
 assert.equal(auditActivation(review(),{html:null,plans:[]},null).status,'blocked');
});
test('all six declared uses require compiler evidence; omissions cannot conceal actual use',()=>{
 const art={selected:{id:'editorial'},css:'body{}'};
 const f=fixture();Object.assign(f.plans[0],{geometryManifest:[{}],surfaceRendering:{parts:[{}]},topology:[{}],compositionManifest:{selectedId:'row'},dynamic:{spec:{bindings:[{}]}}});
 const r=review();for(const k of activationKeys)r.decisions[k].mode='use';
 assert.equal(auditActivation(r,f,art).status,'declared-activation-checked');
 assert.equal(auditActivation(r,fixture(),null).issues.filter(x=>x.includes('absent')).length,6);
 assert.equal(auditActivation(review(),f,art).issues.filter(x=>x.includes('contradicts')).length,6);
});
test('source interaction cannot be silently replaced by static output',()=>{
 const r=review();r.sourceInteraction.status='preserve';
 assert.equal(auditActivation(r,fixture(),null).status,'blocked');
 r.sourceInteraction.status='alternative';
 assert.equal(auditActivation(r,fixture(),null).status,'blocked');
 r.decisions.dynamic.mode='custom';
 assert.equal(auditActivation(r,fixture(),null).status,'declared-activation-checked');
 assert.equal(auditActivation(r,fixture(),null).rows.find(x=>x.capability==='dynamic').compiled,false);
});

test('run-013 failure class: absent compiler output defers dependent assertions, but cannot pass',()=>{
 const r=review();for(const k of activationKeys)r.decisions[k].mode='use';
 r.sourceInteraction.status='preserve';
 const blocked=auditActivation(r,{html:null,plans:[]},null);
 assert.equal(blocked.status,'blocked');
 assert.deepEqual(blocked.issues,['compiled scene required']);
 assert.equal(blocked.compilerEvidenceStatus,'deferred-until-scene-compiles');
 assert.ok(blocked.rows.every(x=>x.compiled===null));
 const compiled=auditActivation(r,fixture(),null);
 assert.equal(compiled.compilerEvidenceStatus,'available');
 assert.equal(compiled.status,'blocked');
 assert.equal(compiled.issues.filter(x=>x.includes('absent')).length,6);
});
test('authoring defects remain visible before compiler output exists',()=>{
 const r=review();r.plainComparison.tradeoff='';delete r.decisions.geometry;
 const blocked=auditActivation(r,{html:null,plans:[]},null);
 assert.ok(blocked.issues.includes('plain representation comparison required'));
 assert.ok(blocked.issues.includes('exact six capability decisions required'));
 assert.ok(blocked.issues.includes('geometry: concrete choice, evidence and alternative required'));
});
