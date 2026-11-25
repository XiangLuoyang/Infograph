import {auditContrast} from './studio-contrast.mjs';
import {auditAccessibility} from './studio-accessibility.mjs';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../../',import.meta.url)),offline=process.argv.includes('--offline');
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root))throw Error('path');res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.json':'application/json'})[extname(p)]??'application/octet-stream');res.end(await readFile(p))}catch{res.statusCode=404;res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true}),report=[];
try{for(const width of [1440,390]){const page=await browser.newPage({viewport:{width,height:900},acceptDownloads:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));try{
 if(offline)await page.route(/^https?:/,r=>r.abort());
 await page.goto(offline?pathToFileURL(resolve(root,'dist/studios/master-studio.html')).href:'http://127.0.0.1:'+server.address().port+'/skills/infograph-master/engine/master-studio.html');
 await page.locator('#run').waitFor();await page.locator('#confirm').check();await page.locator('#run').click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent==='rendered-unverified');
 const originalHTML=await page.locator('#preview').getAttribute('srcdoc');const originalWidth=Number(await page.locator('#width').inputValue());
 await page.locator('#save').click();await page.locator('#width').fill('1000');
 await page.waitForFunction(()=>document.querySelector('#status').textContent==='rendered-unverified'&&document.querySelector('#preview').srcdoc.includes('max-width:968px'));
 await page.locator('#save').click();await page.locator('#history').selectOption('1');await page.locator('#compare').click();assert.ok((await page.locator('#diff').textContent()).includes('width'));
 for(const id of ['htmlExport','configExport','reportExport']){const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#'+id).click()]);assert.ok(download.suggestedFilename().startsWith('infograph-1'));assert.equal(await download.failure(),null);const content=await readFile(await download.path(),'utf8');if(id==='htmlExport')assert.equal(content,originalHTML);else{const data=JSON.parse(content);assert.equal(data.snapshotId,1);assert.equal(data.releaseAuthorized,false);assert.equal(data.validation,'not-run');if(id==='configExport')assert.equal(data.payload.width,originalWidth);else assert.ok(data.payload&&typeof data.payload==='object')}}
 await page.locator('#restore').click();assert.equal(await page.locator('#confirm').isChecked(),false);assert.equal(await page.locator('#preview').getAttribute('srcdoc'),'');
 assert.equal(await page.locator('#save').isDisabled(),true);assert.equal(Number(await page.locator('#width').inputValue()),originalWidth);
 await page.locator('#confirm').check();await page.locator('#run').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='rendered-unverified');assert.equal(await page.locator('#preview').getAttribute('srcdoc'),originalHTML);
 await page.locator('#claim').fill('');assert.equal(await page.locator('#confirm').isChecked(),false);assert.equal(await page.locator('#save').isDisabled(),true);assert.equal(await page.locator('#preview').getAttribute('srcdoc'),'');assert.deepEqual(errors,[]);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
 await mkdir('qa-output',{recursive:true});await page.screenshot({path:'qa-output/master-'+(offline?'offline':'http')+'-'+width+'.png',fullPage:true});report.push({width,status:'pass',contrast:await auditContrast(page),accessibility:await auditAccessibility(page)});
 }catch(e){report.push({width,status:'fail',error:String(e),pageErrors:errors})}finally{await page.close()}}
}finally{await browser.close();server.close();await mkdir('qa-output',{recursive:true});await writeFile('qa-output/master-'+(offline?'offline':'http')+'.json',JSON.stringify(report,null,2))}
if(report.some(x=>x.status!=='pass'))process.exitCode=1;
