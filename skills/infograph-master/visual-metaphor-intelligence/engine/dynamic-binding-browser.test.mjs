import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluatePacket} from './pipeline.mjs';
import {inspectVmiRuntime} from '../../engine/vmi-runtime-qa.mjs';
import {createVmiBridge} from '../../engine/vmi-host-bridge.mjs';
import {chromium} from 'playwright';
const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('real sandbox iframe dynamic lifecycle',async()=>{
 const p=json('benchmark/studio-packet.json');p.scene.dynamicBindings={version:1,ref:'synthetic',boundary:'test only',inputs:[{id:'budget',label:'Budget',unit:'units',min:0,max:100,initial:50,step:1}],derived:[{id:'ratio',unit:'ratio',ref:'synthetic',expr:{op:'div',args:[{ref:'budget'},100]}}],bindings:[{id:'level',objectId:'i',shapeIndex:3,property:'liquidHeight',source:'ratio',domain:[0,1],range:[0,22],ref:'synthetic'},{id:'turn',objectId:'b',shapeIndex:5,property:'rotate',pivot:[50,50],source:'ratio',domain:[0,1],range:[-90,90],ref:'synthetic'},{id:'fade',objectId:'s',shapeIndex:1,property:'opacity',source:'ratio',domain:[0,1],range:[0,1],ref:'synthetic'}]};
 const r=evaluatePacket(p,json('ontology/objects.json'),json('ontology/mechanisms.json'));assert.deepEqual(r.issues,[]);
 const browser=await chromium.launch({headless:true});
 try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent('<div id="slot"></div>');
 await page.evaluate(({html,bridge})=>{window.mount=(budget)=>{window.bridge?.dispose();const f=document.createElement('iframe');f.setAttribute('sandbox','allow-scripts');f.style.width='100%';f.style.height='800px';f.srcdoc=html;document.querySelector('#slot').replaceChildren(f);window.statuses=[];window.bridge=(new Function('return ('+bridge+')'))()(f,{budget},s=>window.statuses.push(s))};window.mount(50)},{html:r.html,bridge:createVmiBridge.toString()});
 const verify=async(budget)=>{await page.waitForFunction(()=>window.statuses.at(-1)?.ok===true);const f=page.frames().find(f=>f.parentFrame());assert.ok(f);const qaScene={dynamic:{inputs:[{id:'budget'}],bindings:[{id:'level',property:'liquidHeight'},{id:'turn',property:'rotate'},{id:'fade',property:'opacity'}]}};const expected={inputs:{budget},outputs:{level:22*(budget/100),turn:-90+180*(budget/100),fade:budget/100}};const qa=await inspectVmiRuntime(f,qaScene,{heightMode:'scroll'},expected);assert.ok(qa.ok,JSON.stringify(qa));const stale=await inspectVmiRuntime(f,qaScene,{heightMode:'scroll'},{...expected,inputs:{budget:budget===100?99:budget+1}});assert.ok(!stale.ok);const observed=await f.evaluate(()=>[...document.querySelectorAll('[data-binding]')].map(e=>[e.dataset.binding,e.getAttribute('height'),e.getAttribute('transform'),e.getAttribute('opacity')]));assert.equal(observed.length,6);for(const [id,h,t,o] of observed){if(id==='level')assert.equal(Number(h),22*(budget/100));if(id==='turn')assert.equal(t,'rotate('+(-90+180*(budget/100))+' 50 50)');if(id==='fade')assert.equal(Number(o),budget/100)}};
 await verify(50);
 for(const budget of [0,25,75,100]){await page.evaluate(b=>{window.statuses=[];window.bridge.setInputs({budget:b})},budget);await verify(budget)}
 await page.evaluate(()=>{window.statuses=[];window.bridge.setInputs({budget:101})});await page.waitForFunction(()=>window.statuses.at(-1)?.ok===false);assert.equal(await page.frames().find(f=>f.parentFrame()).locator('[data-input-value]').textContent(),'100');
 await page.evaluate(()=>window.mount(75));await verify(75);assert.deepEqual(errors,[]);await page.close();
 }}finally{await browser.close()}
});
