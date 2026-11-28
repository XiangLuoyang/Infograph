// Optional controlled visual capture, not an aesthetic gate. Synthetic data only.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {buildComparison} from './benchmark-vmi-composition.mjs';
const out=resolve(process.env.IG_COMPOSITION_CAPTURE_DIR??'composition-captures');
mkdirSync(out,{recursive:true});
const variants=buildComparison(),captures=[];
const browser=await chromium.launch();
try{
 for(const [viewportId,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]])for(const [id,r] of variants){
  const page=await browser.newPage({viewport,offline:true,reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.setContent(r.html,{waitUntil:'load'});
   await page.evaluate(()=>document.fonts.ready);
   const svg=page.locator('svg.scene.'+viewportId);
   assert.ok(await svg.isVisible());
   assert.equal(await svg.locator('[data-object]').count(),4);
   assert.equal(await svg.locator('[data-edge]').count(),3);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   for(const style of ['编辑风','工业风']){
    await page.locator('[data-style-choice='+JSON.stringify(style)+']').click();
    for(const state of ['normal','relief']){
     await page.locator('[data-state='+JSON.stringify(state)+']').click();
     assert.equal(await page.locator('[data-state='+JSON.stringify(state)+']').getAttribute('aria-pressed'),'true');
     const file=[id,viewportId,style==='编辑风'?'editorial':'industrial',state].join('--')+'.png';
     const png=await page.screenshot({fullPage:true,animations:'disabled',caret:'hide',path:join(out,file)});
     captures.push({variant:id,viewportId,style,state,file,sha256:createHash('sha256').update(png).digest('hex')});
    }
   }
   assert.deepEqual(errors,[]);
  }finally{await page.close()}
 }
 assert.equal(captures.length,24);
 writeFileSync(join(out,'capture-report.json'),JSON.stringify({captures,independentVisualReview:false,releaseAuthorized:false,scope:'matched synthetic captures and limited runtime invariants; no aesthetic score'},null,2)+'\n');
}finally{await browser.close()}
