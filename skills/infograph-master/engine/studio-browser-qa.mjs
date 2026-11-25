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
 await page.locator(button+':enabled').waitFor({state:'visible'});
 if(error)assert.equal((await page.locator(error).innerText()).trim(),'');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'horizontal overflow');
 const [download]=await Promise.all([page.waitForEvent('download'),page.click(button)]);
 const file=await download.path();assert.ok(file);const data=JSON.parse(await readFile(file,'utf8'));assert.equal(data.kind,'infograph-studio-output');assert.equal(data.version,'1.0');assert.equal(data.studio,name);assert.equal(data.status,'generated');assert.ok(data.payload&&typeof data.payload==='object'&&!Array.isArray(data.payload));assert.equal(data.validation.browser,'not-run');
 assert.deepEqual(errors,[]);r.status='pass';
 }catch(e){r.failure=String(e)}finally{await page.screenshot({path:resolve(out,name+'-'+width+'.png'),fullPage:true}).catch(e=>{r.status='fail';r.screenshotError=String(e)});results.push(r);await page.close()}
}}finally{await browser.close();server.close();await writeFile(resolve(out,'report.json'),JSON.stringify(results,null,2))}
if(results.some(r=>r.status!=='pass'))process.exitCode=1;
