import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {buildReferenceHTML} from './reference-renderer.mjs';
import {assemblyDemo} from './reference-assembly-fixture.mjs';
import {studioEnvironment} from './reference-lighting3d.mjs';
const dir=resolve('qa-output/reference-lighting');await mkdir(dir,{recursive:true});
const {manifest,options}=assemblyDemo();const variants={baseline:{keyElevation:58},environment:{keyElevation:58,environment:studioEnvironment({strength:2})},cool:{keyElevation:58,environment:studioEnvironment({variant:'cool',strength:2})},shadow:{keyElevation:58,shadow:{opacity:.45}},combined:{keyElevation:58,environment:studioEnvironment({strength:2}),shadow:{opacity:.45}}};
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results={};
try{
 for(const [id,lighting3d] of Object.entries(variants)){
  const file=resolve(dir,id+'.html');await writeFile(file,buildReferenceHTML(manifest,{...options,lighting3d}).html);
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'reduce',offline:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(file).href);const obj=page.locator('#obj-hub');assert.equal(await obj.getAttribute('data-gl-state'),'ready');await page.locator('#ref-all').click();
  const sample=await obj.locator('canvas').evaluate(c=>{const gl=c.getContext('webgl'),b=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,b);return {w:c.width,h:c.height,rgba:Array.from(b)}});
  assert.deepEqual(errors,[]);assert.equal(await page.locator('.link:visible').count(),14);await page.screenshot({path:resolve(dir,id+'.png'),fullPage:true});results[id]=sample;await page.close();
 }
 const a=results.baseline;
 function compare(b){assert.equal(a.w,b.w);assert.equal(a.h,b.h);let changed=0,opaque=0,shadow=0,objectMaskChanges=0;for(let i=0;i<a.rgba.length;i+=4){const aa=a.rgba[i+3],ba=b.rgba[i+3];if((aa>230)!==(ba>230))objectMaskChanges++;if(aa===255&&ba===255){opaque++;if(Math.abs(a.rgba[i]-b.rgba[i])+Math.abs(a.rgba[i+1]-b.rgba[i+1])+Math.abs(a.rgba[i+2]-b.rgba[i+2])>6)changed++;}if(aa===0&&ba>20&&ba<220)shadow++;}return {changed,opaque,shadow,objectMaskChanges}}
 const env=compare(results.environment),shadow=compare(results.shadow),combined=compare(results.combined),cool=compare(results.cool);
 assert.ok(env.opaque>100&&env.changed>env.opaque*.02,JSON.stringify(env));assert.equal(env.shadow,0);assert.equal(env.objectMaskChanges,0);
 assert.ok(shadow.shadow>15,JSON.stringify(shadow));assert.ok(shadow.objectMaskChanges<Math.max(20,shadow.opaque*.02),JSON.stringify(shadow));assert.ok(shadow.changed<Math.max(5,shadow.opaque*.005),JSON.stringify(shadow));
 assert.ok(combined.shadow>15&&combined.changed>combined.opaque*.02,JSON.stringify(combined));assert.ok(combined.objectMaskChanges<Math.max(20,combined.opaque*.02),JSON.stringify(combined));
 let warmCool=0;for(let i=0;i<a.rgba.length;i+=4)if(a.rgba[i+3]>230&&Math.abs(results.environment.rgba[i]-results.cool.rgba[i])+Math.abs(results.environment.rgba[i+1]-results.cool.rgba[i+1])+Math.abs(results.environment.rgba[i+2]-results.cool.rgba[i+2])>6)warmCool++;
 assert.ok(warmCool>20);await writeFile(resolve(dir,'report.json'),JSON.stringify({status:'passed',environment:env,shadow,combined,cool,warmCool,scope:'observed pixel differences at matched viewport; not human aesthetic or physical accuracy validation'},null,2));
}finally{await browser.close()}
