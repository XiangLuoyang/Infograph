import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {registerBaseline} from './visual-baseline.mjs';
import {compareScreenshots} from './visual-compare.mjs';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:100,height:100},deviceScaleFactor:1});
 await page.setContent('<body style="margin:0;background:white"><div style="width:20px;height:20px;background:black"></div></body>');
 const baseline=await page.screenshot();
 const capture={caseId:'fixture',browser:'chromium',browserVersion:browser.version(),platform:process.platform,fontFingerprint:'a'.repeat(64),fixtureHash:'b'.repeat(64),stateHash:'c'.repeat(64),viewportWidth:100,viewportHeight:100,deviceScaleFactor:1,reducedMotion:'no-preference',captureMode:'http',revision:'d'.repeat(40)};
 const registry=registerBaseline({version:1,entries:[]},capture,baseline,{reviewer:'synthetic-fixture',reason:'algorithm test only',timestamp:'2026-01-01T00:00:00Z'});
 const entry=registry.entries[0],run=(candidate,c=capture)=>compareScreenshots({entry,baseline,candidate,capture:c});
 assert.equal(run(await page.screenshot()).report.changed,0);
 await page.locator('div').evaluate(e=>e.style.background='red');
 const changed=run(await page.screenshot());assert.equal(changed.report.status,'review-required');assert.equal(changed.report.changed,400);assert.ok(changed.mask.length>8);
 assert.equal(run(baseline,{...capture,viewportWidth:101}).report.status,'incompatible');
 assert.throws(()=>compareScreenshots({entry,baseline:Buffer.from('bad'),candidate:baseline,capture}));
 console.log('browser PNG comparison fixtures passed');
}finally{await browser.close()}
