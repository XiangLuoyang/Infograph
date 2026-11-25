import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {auditLayout,stressLayout} from './studio-layout-audit.mjs';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.setContent('<body style="margin:0"><div id="clip" style="width:40px;overflow:hidden"><div style="width:120px">Clipped</div></div><svg id="bad" width="200" height="100"><text x="10" y="30">Thailand</text><text x="12" y="30">Vietnam</text><text x="190" y="80">Outside</text></svg><svg id="good" width="180" height="100"><text x="10" y="20">0</text><text x="10" y="60">−1,000,000</text></svg></body>');
 const r=await auditLayout(page);
 assert.ok(r.issues.some(x=>x.kind==='horizontal-clipping'&&x.id==='clip'));
 assert.ok(r.svgIssues.some(x=>x.kind==='svg-label-overlap-candidate'&&x.svg==='bad'));
 assert.ok(r.svgIssues.some(x=>x.kind==='svg-label-outside-viewport'&&x.svg==='bad'));
 assert.ok(!r.svgIssues.some(x=>x.svg==='good'));
 assert.equal(r.svgLabels,5);
 const reports=await stressLayout(page);assert.deepEqual(reports.map(x=>x.width),[320,768,1920,3840]);assert.deepEqual(page.viewportSize(),{width:390,height:844});
 await page.setContent('<body style="margin:0"><div style="width:100%;overflow-wrap:anywhere">LongUnbrokenText'.concat('X'.repeat(500),'</div></body>'));
 const clean=await auditLayout(page);assert.equal(clean.overflow,false);assert.deepEqual(clean.issues,[]);assert.deepEqual(clean.svgIssues,[]);
 console.log(JSON.stringify({status:'pass',scope:'synthetic geometry fixtures',diagnostic:r,clean},null,2));
}finally{await browser.close()}
