import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {buildReferenceHTML} from './reference-renderer.mjs';
import {artDirectionDemo} from './reference-art-fixture.mjs';
import {imageHash,reviewReferencePair} from './reference-pair-review.mjs';
const dir=resolve('qa-output/reference-pair');await mkdir(dir,{recursive:true});
const {manifest,options}=artDirectionDemo('industrial');
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const captures=[];
 // This is an injected-defect browser fixture, not a concept-image fidelity benchmark.
 for(const defective of [false,true]){
  const name=defective?'shifted':'reference',file=resolve(dir,name+'.html');await writeFile(file,buildReferenceHTML(manifest,options).html);
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce',offline:true});await page.goto(pathToFileURL(file).href);assert.equal(await page.locator('#obj-hub').getAttribute('data-gl-state'),'ready');await page.locator('#ref-all').click();
  if(defective)await page.locator('#obj-hub').evaluate(e=>{e.style.left='10%';e.style.top='10%'});
  const stage=page.locator('#ref-stage'),bytes=await stage.screenshot({path:resolve(dir,name+'.png')});
  const anno=await stage.evaluate(e=>{const s=e.getBoundingClientRect(),bounds=n=>{const b=n.getBoundingClientRect();const x=Math.max(s.left,b.left),y=Math.max(s.top,b.top),r=Math.min(s.right,b.right),t=Math.min(s.bottom,b.bottom);return [(x-s.left)/s.width,(y-s.top)/s.height,(r-x)/s.width,(t-y)/s.height]};
   return {sceneId:e.dataset.scene,objects:[...e.querySelectorAll('.object:not([hidden])')].map(n=>({id:n.id.slice(4),bounds:bounds(n),basis:'container',visibility:'visible',note:'DOM bounding region; no ink segmentation or occlusion detection'})),linkIds:[...e.querySelectorAll('.link:not([hidden])')].map(n=>n.dataset.id)};
  });
  const annotation={imageSha256:imageHash(bytes),sceneId:anno.sceneId,annotator:'browser fixture collector',method:'stage crop and DOM container bounds; endpoints from known fixture, not pixel inference',objects:anno.objects,links:manifest.links.filter(l=>anno.linkIds.includes(l.id)).map(l=>({id:l.id,from:l.from.object,to:l.to.object,note:'declared fixture endpoints'}))};
  await writeFile(resolve(dir,name+'.json'),JSON.stringify(annotation,null,2));captures.push({annotation,bytes});await page.close();
 }
 const [r,c]=captures,report=reviewReferencePair({manifest,reference:r.annotation,candidate:c.annotation,referenceBytes:r.bytes,candidateBytes:c.bytes});
 assert.equal(report.status,'repair-required');assert.ok(report.issues.some(x=>x.objectId==='hub'&&x.dimension==='geometry'));assert.ok(report.issues.some(x=>x.objectId==='@scene'&&x.dimension==='aesthetics'&&x.severity==='unverified'));
 await writeFile(resolve(dir,'report.json'),JSON.stringify(report,null,2));await writeFile(resolve(dir,'manifest.json'),JSON.stringify(manifest,null,2));
 console.log('Reference pair injected-defect browser QA passed');
}finally{await browser.close()}
