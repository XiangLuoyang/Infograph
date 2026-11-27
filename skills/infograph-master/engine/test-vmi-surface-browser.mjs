import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
import {evaluatePacket} from '../visual-metaphor-intelligence/engine/pipeline.mjs';
import {geometryTemplate} from '../visual-metaphor-intelligence/engine/physical-geometry.mjs';
const load=p=>JSON.parse(readFileSync(new URL('../visual-metaphor-intelligence/'+p,import.meta.url),'utf8'));
const packet=load('benchmark/studio-packet.json'),objects=load('ontology/objects.json'),ontology=load('ontology/mechanisms.json');
const rotor=geometryTemplate('rotor'),b=packet.scene.objects.find(x=>x.id==='b');
b.shapes=rotor.shapes;
packet.scene.surfaceRendering={version:1,rationale:'synthetic vector scene study',parts:rotor.parts.map(([shapeIndex,material])=>({objectId:'b',shapeIndex,material,encoding:'decorative-only',ref:'fixture geometry'})),motions:[{objectId:'s',shapeIndex:4,kind:'rotation',encoding:'qualitative',pivot:[50,50],angles:{normal:0,relief:-70},ref:'fixture transition'}]};
const result=evaluatePacket(packet,objects,ontology);assert.ok(result.html,result.issues.join('; '));assert.equal(result.plans.length,2);
const browser=await chromium.launch();
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport,offline:true,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.setContent(result.html);
  const variant=viewport.width<760?'mobile':'desktop',scene=page.locator('svg.scene.'+variant);
  const part=scene.locator('[data-motion-object="s"]');
  assert.equal(await part.getAttribute('transform'),'rotate(0 50 50)');
  const ids=await page.locator('linearGradient').evaluateAll(els=>els.map(e=>e.id));assert.equal(ids.length,rotor.parts.length*2);assert.equal(new Set(ids).size,ids.length);
  assert.ok(await scene.locator('[data-object="b"] [fill^="url("]').count()>=rotor.parts.length);
  const gradient=scene.locator('linearGradient').first().locator('stop').first();
  const color=await gradient.evaluate(e=>getComputedStyle(e).stopColor);
  await page.locator('[data-state="relief"]').click();
  assert.equal(await part.getAttribute('transform'),'rotate(-70 50 50)');
  assert.equal(await part.evaluate(e=>e.style.transform),'rotate(-70deg)');
  assert.equal(await part.evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  await page.locator('[data-style-choice]').last().click();
  assert.notEqual(await gradient.evaluate(e=>getComputedStyle(e).stopColor),color);
  assert.equal(await part.getAttribute('transform'),'rotate(-70 50 50)');
  await page.locator('[data-state="normal"]').click();assert.equal(await part.getAttribute('transform'),'rotate(0 50 50)');
  assert.equal(await scene.locator('[data-edge]').count(),result.plans[0].semantic.mappings.length);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('VMI surface renderer browser: desktop/mobile materials, state and style invariance passed');
}finally{await browser.close()}
