import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluatePacket} from './pipeline.mjs';
import {evaluateBindings} from './dynamic-binding.mjs';
const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('dynamic bindings compile through canonical VMI pipeline',()=>{
 const p=json('benchmark/studio-packet.json');
 p.scene.dynamicBindings={version:1,ref:'synthetic',boundary:'test only',inputs:[{id:'budget',label:'Budget',unit:'units',min:0,max:100,initial:50,step:1}],derived:[{id:'ratio',unit:'ratio',ref:'synthetic',expr:{op:'div',args:[{ref:'budget'},100]}}],bindings:[{id:'level',objectId:'i',shapeIndex:3,property:'liquidHeight',source:'ratio',domain:[0,1],range:[0,22],ref:'synthetic'},{id:'turn',objectId:'b',shapeIndex:5,property:'rotate',pivot:[50,50],source:'ratio',domain:[0,1],range:[-90,90],ref:'synthetic'},{id:'fade',objectId:'s',shapeIndex:1,property:'opacity',source:'ratio',domain:[0,1],range:[0,1],ref:'synthetic'}]};
 const r=evaluatePacket(p,json('ontology/objects.json'),json('ontology/mechanisms.json'));
 assert.deepEqual(r.issues,[]);assert.ok(r.html);
 assert.deepEqual(r.plans[0].dynamic.initial.outputs.map(x=>x.value),[11,0,.5]);
 assert.equal((r.html.match(/data-binding="/g)||[]).length,6);
 assert.doesNotThrow(()=>new Function(r.html.match(/<script>([\s\S]*?)<\/script>/)[1]));
 for(const budget of [0,25,50,75,100])assert.deepEqual(evaluateBindings(p.scene.dynamicBindings,{budget}).outputs.map(x=>x.value),[22*budget/100,-90+180*budget/100,budget/100]);
 assert.throws(()=>evaluateBindings(p.scene.dynamicBindings,{budget:101}));
});
