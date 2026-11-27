import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
import {compileArtDirections,artDirectionPreview} from './art-direction-production.mjs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const plan=compileArtDirections({purpose:'explain',theme:'Synthetic resource constraint',readerTask:'Compare capacity with demand',density:'normal',evidenceRef:'fixture',families:['editorial','technical','analytical','architectural','swiss']},load('./art-directions.json'),load('./styles.json'));
const browser=await chromium.launch();
const rgb=s=>'rgb('+[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)).join(', ')+')';
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport,offline:true});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.setContent(artDirectionPreview(plan));
  assert.equal(await page.locator('article[data-ig-art]').count(),5);
  for(const d of plan.candidates){
   const loc=page.locator('article[data-ig-art="'+d.id+'"]');
   const actual=await loc.evaluate(e=>{const p=e.querySelector('.ig-art-panel'),m=e.querySelector('.ig-art-metric'),button=e.querySelector('.ig-art-primary'),title=e.querySelector('.ig-art-title'),field=e.querySelector('.ig-art-material-field');return {canvas:getComputedStyle(e).backgroundColor,surface:getComputedStyle(p).backgroundColor,metric:getComputedStyle(m).color,buttonBackground:getComputedStyle(button).backgroundColor,buttonText:getComputedStyle(button).color,titleFont:getComputedStyle(title).fontFamily,fieldBackground:getComputedStyle(field).backgroundImage,text:m.textContent}});
   assert.equal(actual.canvas,rgb(d.palette.canvas));assert.equal(actual.surface,rgb(d.palette.surface));assert.equal(actual.metric,rgb(d.palette.accent));
   assert.equal(actual.buttonBackground,rgb(d.palette.accent));assert.equal(actual.buttonText,rgb(d.palette.onAccent));
   assert.equal(actual.text,'120 / 100');
   if(d.typography.heading==='serif')assert.match(actual.titleFont,/Georgia/);else assert.match(actual.titleFont,/system-ui/);
   if(['metal','clay'].includes(d.material.family))assert.match(actual.fieldBackground,/linear-gradient/);
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'document overflow');
  assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('Art direction specimen: 5 directions x 2 viewport computed-style checks passed');
}finally{await browser.close()}
