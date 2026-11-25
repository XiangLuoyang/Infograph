import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {buildReferenceHTML} from './reference-renderer.mjs';
import {referenceDemo} from './reference-renderer-fixture.mjs';
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
 await writeFile(resolve(out,'report.json'),JSON.stringify({status:'passed',pixels,contextLoss:true,unavailableFallback:true,scope:'software WebGL functional pixel evidence; not hardware performance or human aesthetic judgment'},null,2));
}finally{await browser.close()}
