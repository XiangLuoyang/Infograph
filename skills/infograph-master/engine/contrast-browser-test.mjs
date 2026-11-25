import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {auditContrast} from './studio-contrast.mjs';
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 await page.setContent('<html><body style="background:white;color:black"><p id="black">Black</p><p id="low" style="color:#aaa">Low</p><p id="large" style="color:#777;font-size:24px">Large</p><div style="background:black"><p id="alpha" style="background:rgba(255,255,255,.5);color:black">Alpha</p></div><p id="gradient" style="background:linear-gradient(white,black)">Gradient</p></body></html>');
 const report=await auditContrast(page),get=id=>report.results.find(r=>r.id===id);
 assert.equal(get('black').ratio,21);assert.equal(get('black').status,'pass');
 assert.equal(get('low').status,'review-low-contrast');assert.equal(get('large').threshold,3);assert.equal(get('large').status,'pass');
 assert.ok(Math.abs(get('alpha').ratio-5.28)<.02);assert.equal(get('gradient').status,'manual-review');
 console.log(JSON.stringify(report,null,2));
}finally{await browser.close()}
