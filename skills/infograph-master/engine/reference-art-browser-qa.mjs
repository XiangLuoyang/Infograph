import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {referenceDirectionIds,directionContrast} from './reference-art-direction.mjs';
import {artDirectionDemo} from './reference-art-fixture.mjs';
import {buildReferenceHTML} from './reference-renderer.mjs';
const out=resolve('qa-output/reference-art');await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const evidence=[];
try{
 for(const id of referenceDirectionIds){
  const a=artDirectionDemo(id),file=resolve(out,id+'.html');await writeFile(file,buildReferenceHTML(a.manifest,a.options).html);
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport,offline:true,reducedMotion:'reduce',deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(file).href);
   assert.equal(await page.locator('#obj-hub').getAttribute('data-gl-state'),'ready');await page.locator('#ref-all').click();
   assert.equal(await page.locator('.link:visible').count(),14);assert.equal(await page.locator('[data-role=anchor]:visible').count(),14);
   const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,body:getComputedStyle(document.body).backgroundColor,clipped:[...document.querySelectorAll('[data-role=anchor]')].filter(e=>e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2).length}));
   assert.equal(layout.overflow,false);assert.deepEqual(errors,[]);
   const bytes=await page.screenshot({path:resolve(out,id+'-'+viewport.width+'.png'),fullPage:true});
   const opaque=await page.locator('#obj-hub canvas').evaluate(c=>{const gl=c.getContext('webgl'),b=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,b);let n=0;for(let i=3;i<b.length;i+=4)if(b[i]===255)n++;return n;});assert.ok(opaque>10);
   evidence.push({id,viewport,layout,screenshotSha256:createHash('sha256').update(bytes).digest('hex'),opaquePixels:opaque,contrast:directionContrast(id),review:'human aesthetics and text clipping review pending'});
   await page.locator('#ref-reset').click();assert.equal(await page.locator('.link:visible').count(),0);await page.close();
  }
 }
 assert.equal(new Set(evidence.filter(e=>e.viewport.width===1440).map(e=>e.screenshotSha256)).size,3);
 await writeFile(resolve(out,'report.json'),JSON.stringify({functionalStatus:'passed',evidence,releaseReady:false,scope:'software WebGL and declared palette contrast; not aesthetic approval or mobile legibility certification'},null,2));
}finally{await browser.close()}
