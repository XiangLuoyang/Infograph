import {chromium} from 'playwright';
import {readFile,mkdir,writeFile,readdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
const root=resolve(process.argv[2]||'benchmark-local'),out=resolve(process.argv[3]||'benchmark-review');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
try{
for(const name of (await readdir(root)).filter(n=>/^R\d+$/.test(n)).sort()){
 const dir=join(root,name);let record,html;
 try{record=JSON.parse(await readFile(join(dir,'record.json'),'utf8'));if(record.status!=='completed'){results.push({runId:name,status:'generation-failed'});continue}html=await readFile(join(dir,'artifact.html'),'utf8');if(record.artifactHash!==hash(html))throw Error('artifact hash mismatch')}catch(e){results.push({runId:name,status:'input-error',error:e.message});continue}
 const cases=[];
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 const context=await browser.newContext({viewport,serviceWorkers:'block',acceptDownloads:false});
 const page=await context.newPage();const errors=[],requests=[];
 await context.route('**/*',route=>{requests.push(route.request().url().split(':')[0]);return route.abort()});
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
 const c={viewport,errors,requests,status:'not-run'};
 try{
 await page.setContent(html,{waitUntil:'domcontentloaded',timeout:10000});
 await page.waitForTimeout(300);
 c.geometry=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,textLength:document.body?.innerText.trim().length||0,controls:document.querySelectorAll('button,input,select,textarea,[role=button]').length,svg:document.querySelectorAll('svg').length,canvas:document.querySelectorAll('canvas').length}));
 c.status=errors.length||requests.length||c.geometry.width>viewport.width+2||!c.geometry.textLength?'flagged':'observed-pass';
 await page.screenshot({path:join(out,name+'-'+viewport.width+'.png'),timeout:10000,animations:'disabled'});
 }catch(e){c.status='error';c.error=e.message}finally{await context.close()}
 cases.push(c);
 }
 results.push({runId:name,status:cases.every(c=>c.status==='observed-pass')?'observed-pass':'flagged',cases,semantic:'not-run',interaction:'not-run',audience:'not-run'});
}
}finally{await browser.close()}
await writeFile(join(out,'engineering-report.json'),JSON.stringify({scope:'initial render only; flags are heuristic, not quality scores',results},null,2));
