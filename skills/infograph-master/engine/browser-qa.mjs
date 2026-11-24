import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const root=process.cwd(),out=path.join(root,'qa-output');
await mkdir(out,{recursive:true});
const manifest=JSON.parse(await readFile(path.join(root,'golden/manifest.json'),'utf8'));
const browser=await chromium.launch();const results=[];
try{
for(const item of manifest.examples)for(const [width,height] of [[1440,900],[1920,1080],[390,844]]){
const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));const r={id:item.id,width,height,errors,status:'fail'};
try{
await page.goto(pathToFileURL(path.join(root,'golden',item.html)).href);
await page.locator('#chart svg').waitFor({state:'attached'});
assert.equal(await page.locator('tbody tr').count(),6);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
await page.addScriptTag({path:path.join(root,'visual-check.js')});
r.diagnostics=await page.evaluate(()=>infographVisualCheck());
if(item.id==='cinematic'){await page.locator('#next').click();assert.equal(await page.locator('#counter').innerText(),'2 / 3');await page.locator('#next').click();assert.ok(await page.locator('#next').isDisabled());await page.locator('#prev').click();await page.locator('#prev').click();assert.ok(await page.locator('#prev').isDisabled())}
assert.deepEqual(errors,[]);r.status='pass';
}catch(e){r.failure=String(e)}
finally{await page.screenshot({path:path.join(out,item.id+'-'+width+'.png'),fullPage:true}).catch(e=>{r.status='fail';r.screenshotError=String(e)});results.push(r);await page.close()}
}
}finally{await browser.close();await writeFile(path.join(out,'report.json'),JSON.stringify(results,null,2))}
if(results.some(r=>r.status!=='pass'))process.exitCode=1;
