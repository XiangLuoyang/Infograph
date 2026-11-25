import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {buildReferenceHTML} from './reference-renderer.mjs';
import {referenceDemo} from './reference-renderer-fixture.mjs';
import {assemblyDemo} from './reference-assembly-fixture.mjs';
import {projectedObjectPorts} from './reference-geometry.mjs';
import {resolveAnchor} from './reference-scene.mjs';
const {manifest,options}=referenceDemo(),hub=manifest.objects.find(o=>o.id==='hub');hub.fidelity='spatial';hub.geometry={preset:'mechanical-hub'};hub.material.metalness=.75;
const out=resolve('qa-output/reference-webgl');await mkdir(out,{recursive:true});const file=resolve(out,'demo.html');await writeFile(file,buildReferenceHTML(manifest,{...options,webgl:true}).html);
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce',offline:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(file).href);
 const el=page.locator('#obj-hub');assert.equal(await el.getAttribute('data-gl-state'),'ready');await page.locator('#ref-all').click();assert.equal(await page.locator('.link:visible').count(),14);
 const pixels=await el.locator('canvas').evaluate(c=>{const gl=c.getContext('webgl'),b=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,b);let opaque=0;const colors=new Set();for(let i=0;i<b.length;i+=4)if(b[i+3]>200){opaque++;colors.add((b[i]>>3)+','+(b[i+1]>>3)+','+(b[i+2]>>3))}return {opaque,colors:colors.size,total:c.width*c.height}});
 assert.ok(pixels.opaque>pixels.total*.05&&pixels.colors>8,JSON.stringify(pixels));await page.screenshot({path:resolve(out,'webgl-desktop.png'),fullPage:true});
 await page.locator('#ref-reset').click();assert.equal(await page.locator('.link:visible').count(),0);
 await el.locator('canvas').evaluate(c=>{const e=c.getContext('webgl').getExtension('WEBGL_lose_context');if(!e)throw Error('context loss extension unavailable');e.loseContext()});await page.waitForFunction(()=>document.querySelector('#obj-hub').dataset.glState==='fallback');assert.equal(await el.locator('.gl-fallback').isVisible(),true);assert.deepEqual(errors,[]);
 const fallback=await browser.newPage({offline:true});await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return t==='webgl'?null:get.call(this,t,...a)}});await fallback.goto(pathToFileURL(file).href);assert.equal(await fallback.locator('#obj-hub').getAttribute('data-gl-state'),'fallback');
 const assembly=assemblyDemo(),assemblyFile=resolve(out,'assembly.html');await writeFile(assemblyFile,buildReferenceHTML(assembly.manifest,assembly.options).html);
 const ap=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce',offline:true});const ae=[];ap.on('pageerror',e=>ae.push(e.message));await ap.goto(pathToFileURL(assemblyFile).href);assert.equal(await ap.locator('#obj-hub').getAttribute('data-gl-state'),'ready');await ap.locator('#ref-all').click();
 const obj=assembly.manifest.objects.find(o=>o.id==='hub'),expected=resolveAnchor(projectedObjectPorts(obj,1.5),'p0',assembly.options.transforms.reveal14.hub,1.5);
 const actual=await ap.locator('#link-l0 .core').evaluate(e=>[+e.getAttribute('x2')/1200,+e.getAttribute('y2')/800]);assert.ok(actual.every((v,i)=>Math.abs(v-expected[i])<1e-7));await ap.screenshot({path:resolve(out,'assembly-desktop.png'),fullPage:true});
 await ap.locator('#obj-hub canvas').evaluate(c=>c.getContext('webgl').getExtension('WEBGL_lose_context').loseContext());await ap.waitForFunction(()=>document.querySelector('#obj-hub').dataset.glState==='fallback');
 const fb=resolveAnchor(obj,'p0',assembly.options.transforms.reveal14.hub,1.5),actualFallback=await ap.locator('#link-l0 .core').evaluate(e=>[+e.getAttribute('x2')/1200,+e.getAttribute('y2')/800]);assert.ok(actualFallback.every((v,i)=>Math.abs(v-fb[i])<1e-7));assert.deepEqual(ae,[]);
 await writeFile(resolve(out,'report.json'),JSON.stringify({status:'passed',pixels,contextLoss:true,unavailableFallback:true,assemblyProjection:true,assemblyFallbackProjection:true,scope:'software WebGL functional pixel evidence; not hardware performance or human aesthetic judgment'},null,2));
}finally{await browser.close()}
