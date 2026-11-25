import {auditContrast} from './studio-contrast.mjs';
import {auditAccessibility} from './studio-accessibility.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve,extname,sep} from 'node:path';
const offline=process.argv.includes('--offline');
const root=resolve('../visual-intelligence'),out=resolve(offline?'qa-output/studios-offline':'qa-output/studios');
await mkdir(out,{recursive:true});
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!p.startsWith(root+sep)){res.writeHead(403).end();return}const bytes=await readFile(p);res.writeHead(200,{'Content-Type':mime[extname(p)]||'application/octet-stream'}).end(bytes)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch(),results=[];
const cases=[['color','#export','#error'],['typography','#download','#error'],['composition','#export',null],['material','#export',null],['motion','#export','#error'],['representation','#json',null]];
try{for(const [name,button,error] of cases)for(const [width,height] of [[1440,900],[390,844]]){
 const page=await browser.newPage({viewport:{width,height},acceptDownloads:true,reducedMotion:'reduce'}),errors=[],r={name,width,height,status:'fail',errors};
 page.on('pageerror',e=>errors.push(e.message));
 try{if(offline){await page.context().setOffline(true);await page.goto(pathToFileURL(resolve('../../../dist/studios',name+'-studio.html')).href)}else await page.goto('http://127.0.0.1:'+server.address().port+'/'+name+'-studio.html');
 if(name==='representation'){await page.locator('#candidate option[value="VIZ-0002"]').waitFor({state:'attached'});await page.selectOption('#candidate','VIZ-0002');await page.click('#run');assert.equal(await page.locator('#status').innerText(),'rendered')}
 if(name==='color'){await page.selectOption('#relation','magnitude');await page.selectOption('#vision','deutan');await page.selectOption('#intent','monitor')}
 if(name==='typography'){await page.selectOption('#base','20');await page.selectOption('#precision','2')}
 if(name==='composition'){await page.selectOption('#device','mobile');await page.selectOption('#layout','column')}
 if(name==='material'){await page.locator('#controls input[type=checkbox]').uncheck();assert.equal(await page.locator('#overlay').isHidden(),true)}
 if(name==='motion'){
 assert.equal(await page.locator('#reduce').isChecked(),true);
 await page.evaluate(()=>{window.qaAnimationCalls=0;const original=Element.prototype.animate;Element.prototype.animate=function(...args){window.qaAnimationCalls++;return original.apply(this,args)}});
 await page.click('[data-scene="gap"]');assert.equal(await page.locator('#scene').innerText(),'gap');assert.ok((await page.locator('#evidence').innerText()).includes('stock'));assert.ok((await page.locator('#evidence').innerText()).includes('gap'));
 await page.click('.market[data-id="TH"]');assert.equal(await page.locator('.market[data-id="TH"]').getAttribute('aria-pressed'),'true');
 await page.locator('#filters input[value="VN"]').uncheck();assert.equal(await page.locator('.market[data-id="VN"]').isHidden(),true);assert.equal(await page.locator('#stock').innerText(),'36K');
 await page.locator('#parameter').fill('30');assert.equal(await page.locator('#scenario').innerText(),'48K');assert.equal(await page.evaluate(()=>window.qaAnimationCalls),0);assert.equal(await page.locator('#parameterValue').innerText(),'30K');await page.click('#undo');assert.equal(await page.locator('#parameterValue').innerText(),'18K');await page.locator('#parameter').fill('24')}
 if(name==='representation'){const data=JSON.parse(await page.locator('#data').inputValue());data.rows[0].value=22;await page.locator('#data').fill(JSON.stringify(data));assert.equal(await page.locator('#json').isDisabled(),true);assert.equal(await page.locator('#svg').isDisabled(),true);await page.click('#run');assert.equal(await page.locator('#status').innerText(),'rendered')}
 await page.locator(button+':enabled').waitFor({state:'visible'});
 if(error)assert.equal((await page.locator(error).innerText()).trim(),'');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'horizontal overflow');
 const [download]=await Promise.all([page.waitForEvent('download'),page.click(button)]);
 const file=await download.path();assert.ok(file);const data=JSON.parse(await readFile(file,'utf8'));assert.equal(data.kind,'infograph-studio-output');assert.equal(data.version,'1.0');assert.equal(data.studio,name);assert.equal(data.status,'generated');assert.ok(data.payload&&typeof data.payload==='object'&&!Array.isArray(data.payload));assert.equal(data.validation.browser,'not-run');
 const p=data.payload;
 if(name==='color'){assert.equal(p.parameters.relation,'magnitude');assert.equal(p.parameters.vision,'deutan');assert.equal(p.parameters.intent,'monitor');assert.deepEqual(p,JSON.parse(await page.locator('#contract').textContent()))}
 if(name==='typography'){assert.equal(p.input.base,20);assert.equal(p.input.precision,2);assert.deepEqual(p,JSON.parse(await page.locator('#contract').textContent()))}
 if(name==='composition'){assert.equal(p.geometryInput.width,420);assert.equal(p.geometryInput.root.children[1].axis,'column')}
 if(name==='material')assert.equal(p.profile.showOverlay,false);
 if(name==='motion'){assert.equal(p.view.reduced,true);assert.equal(p.view.state.parameters.supply,24);assert.equal(p.view.simulation.end,42);await page.click('#reset');assert.equal(await page.locator('#parameterValue').innerText(),'18K');assert.equal(await page.locator('#stock').innerText(),'56K');assert.equal(await page.evaluate(()=>window.qaAnimationCalls),0);r.reducedMotion='verified-no-animation-calls';
 const normal=await browser.newPage({viewport:{width,height},acceptDownloads:true,reducedMotion:'no-preference'});
 try{
 if(offline)await normal.context().setOffline(true);
 await normal.goto(page.url());
 assert.equal(await normal.locator('#reduce').isChecked(),false);
 await normal.evaluate(()=>{window.qaAnimationCalls=0;const original=Element.prototype.animate;Element.prototype.animate=function(...args){window.qaAnimationCalls++;return original.apply(this,args)}});
 await normal.click('[data-scene="gap"]');await normal.click('.market[data-id="TH"]');
 await normal.locator('#filters input[value="VN"]').uncheck();
 await normal.locator('#parameter').fill('30');await normal.click('#undo');await normal.locator('#parameter').fill('24');
 const [normalDownload]=await Promise.all([normal.waitForEvent('download'),normal.click('#export')]);
 const v=JSON.parse(await readFile(await normalDownload.path(),'utf8')).payload.view;
 for(const k of ['state','projection','simulation','visible','visited','staticOrder','canUndo'])assert.deepEqual(v[k],p.view[k],'motion parity: '+k);
 assert.equal(v.reduced,false);assert.ok(await normal.evaluate(()=>window.qaAnimationCalls)>0,'normal mode never animated');
 await normal.locator('#reduce').check();
 const count=await normal.evaluate(()=>window.qaAnimationCalls);
 await normal.click('#reset');assert.equal(await normal.evaluate(()=>window.qaAnimationCalls),count);
 r.motionParity='verified';
 }finally{await normal.close()}
 }
 if(name==='representation'){assert.equal(p.data.rows[0].value,22);assert.equal(p.result.status,'rendered');const [svg]=await Promise.all([page.waitForEvent('download'),page.click('#svg')]);assert.equal(await readFile(await svg.path(),'utf8'),p.result.svg)}
 r.contrast=await auditContrast(page);r.accessibility=await auditAccessibility(page);assert.deepEqual(errors,[]);r.status='pass';
 }catch(e){r.failure=String(e)}finally{await page.screenshot({path:resolve(out,name+'-'+width+'.png'),fullPage:true}).catch(e=>{r.status='fail';r.screenshotError=String(e)});results.push(r);await page.close()}
}}finally{await browser.close();server.close();await writeFile(resolve(out,'report.json'),JSON.stringify(results,null,2))}
console.log(JSON.stringify({offline,passed:results.filter(r=>r.status==='pass').length,total:results.length,failures:results.filter(r=>r.status!=='pass')},null,2));
if(results.some(r=>r.status!=='pass'))process.exitCode=1;
