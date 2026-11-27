import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const dir=process.env.INFOGRAPH_PREVIEW_DIR;
if(!dir)throw Error('preview directory required');
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
try{
 for(const mode of ['mixed','baseline'])for(const viewport of ['desktop','mobile']){
  const page=await browser.newPage({viewport:viewport==='desktop'?{width:1440,height:900}:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setContent(await readFile(join(dir,mode+'-'+viewport+'.html'),'utf8'));
  await page.waitForTimeout(500);
  const report=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].map(i=>i.complete&&i.naturalWidth>0),webgl:[...document.querySelectorAll('.gl-object')].map(e=>({state:e.dataset.glState,error:e.dataset.glError??null})),labels:[...document.querySelectorAll('.semantic-object-label')].map(e=>({text:e.textContent,visible:e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0,overflow:e.scrollWidth>e.clientWidth+1})),legacyLegend:!!document.querySelector('.legend'),contextAvailable:!!document.createElement('canvas').getContext('webgl')}));
  results.push({mode,viewport,...report,errors});
  await page.screenshot({path:join(dir,mode+'-'+viewport+'.png'),fullPage:true});
  await page.close();
 }
 await writeFile(join(dir,'browser-report.json'),JSON.stringify(results,null,2));
 for(const r of results){
  assert.equal(r.overflow,false);assert.deepEqual(r.errors,[]);assert.ok(r.images.every(Boolean));assert.equal(r.labels.length,4);assert.ok(r.labels.every(l=>l.text.trim()&&l.visible&&!l.overflow),'semantic labels: '+JSON.stringify(r.labels));assert.equal(r.legacyLegend,false);
  if(r.mode==='mixed'){assert.ok(r.images.length>0);assert.ok(r.webgl.length>0);assert.ok(r.webgl.every(g=>g.state==='ready'),'WebGL not ready: '+JSON.stringify(r));}
 }
}finally{await browser.close()}
