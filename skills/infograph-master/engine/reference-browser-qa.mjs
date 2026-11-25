import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {buildReferenceHTML} from './reference-renderer.mjs';
import {referenceDemo} from './reference-renderer-fixture.mjs';
const out=resolve('qa-output/reference-scene');await mkdir(out,{recursive:true});const {manifest,options}=referenceDemo(),{html,report}=buildReferenceHTML(manifest,options);
const file=resolve(out,'demo.html');await writeFile(file,html);const url=pathToFileURL(file).href;
const browser=await chromium.launch({headless:true}),checks=[];
try{
 for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce',offline:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
  const stage=page.locator('#ref-stage');assert.equal(await stage.getAttribute('data-scene'),'initial');
  assert.equal(await page.locator('.link:visible').count(),0);
  assert.equal(await page.locator('#obj-env img').evaluate(e=>e.complete&&e.naturalWidth>0),true);
  await page.locator('#ref-next').click();assert.equal(await page.locator('.link:visible').count(),1);
  await page.locator('#ref-all').click();assert.equal(await page.locator('.link:visible').count(),14);
  assert.equal(await page.locator('[data-role=anchor]:visible').count(),14);
  await page.screenshot({path:resolve(out,viewport.width+'-all.png'),fullPage:true});
  const geometry=await page.evaluate(()=>{const l=document.querySelector('#link-l0 .core'),hub=document.querySelector('#obj-hub'),stage=document.querySelector('#ref-stage'),r=stage.getBoundingClientRect(),m=new DOMMatrix(getComputedStyle(hub).transform),w=hub.offsetWidth,h=hub.offsetHeight;
   const x=hub.offsetLeft+w/2+(m.a*0+m.c*(-.48*h)),y=hub.offsetTop+h/2+(m.b*0+m.d*(-.48*h));
   return {dx:Math.abs(+l.getAttribute('x2')/1200*r.width-x),dy:Math.abs(+l.getAttribute('y2')/800*r.height-y),overflow:document.documentElement.scrollWidth>innerWidth};
  });assert.ok(geometry.dx<3&&geometry.dy<3,JSON.stringify(geometry));assert.equal(geometry.overflow,false);
  await stage.focus();await page.keyboard.press('ArrowRight');assert.equal(await stage.getAttribute('data-scene'),'focus');assert.equal(await page.locator('.link.emphasis:visible').count(),1);
  await page.locator('#ref-reset').click();assert.equal(await stage.getAttribute('data-scene'),'initial');assert.deepEqual(errors,[]);
  checks.push({viewport,geometry,passed:true});await page.close();
 }
 const staticPage=await browser.newPage({javaScriptEnabled:false,offline:true,viewport:{width:1440,height:900}});await staticPage.goto(url);assert.equal(await staticPage.locator('.link:visible').count(),14);assert.equal(await staticPage.locator('#ref-controls').isVisible(),false);await staticPage.close();
 const motion=await browser.newPage({viewport:{width:1200,height:800},offline:true});await motion.goto(url);
 await motion.locator('#ref-next').click();await motion.waitForTimeout(400);const a=await motion.locator('#link-l0 .core').getAttribute('x2');await motion.locator('#ref-next').click();await motion.waitForTimeout(400);assert.notEqual(await motion.locator('#link-l0 .core').getAttribute('x2'),a);
 await motion.locator('#ref-play').click();await motion.waitForTimeout(1100);await motion.locator('#ref-play').click();const state=await motion.locator('#ref-stage').getAttribute('data-scene');await motion.waitForTimeout(1100);assert.equal(await motion.locator('#ref-stage').getAttribute('data-scene'),state);await motion.close();
 await writeFile(resolve(out,'report.json'),JSON.stringify({...report,browserVerified:true,checks,staticFallback:true,motionAndPause:true,scope:'functional checks only; screenshot aesthetic review not performed'},null,2));
 console.log('Reference renderer browser checks passed');
}finally{await browser.close()}
