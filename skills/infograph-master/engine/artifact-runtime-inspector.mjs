// Trusted local standalone HTML only. Not a sandbox for hostile code.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {validateRuntimePlan} from './reconstruction-runtime-core.mjs';
function collectProbe(el,kind){
 const limit=4000;let partial=false;
 const clip=s=>{s=String(s??"");if(s.length>limit){partial=true;return s.slice(0,limit)}return s};
 const text=e=>clip(e?.innerText??e?.textContent??"");
 const visible=!!(el.getClientRects().length&&getComputedStyle(el).visibility==="visible"&&getComputedStyle(el).display!=="none");
 let value=null,status="observed";
 if(!visible)return {status:"hidden",partial:false,value:null};
 if(kind==="text")value=text(el);
 else if(kind==="table"){
 if(el.localName!=="table")return {status:"unsupported",partial:false,value:null};
 const rows=[];let count=0;for(const row of el.rows){if(count>=1000){partial=true;break}const cells=[];for(const c of row.cells){if(count++>=1000){partial=true;break}cells.push({text:text(c),colSpan:c.colSpan,rowSpan:c.rowSpan})}rows.push(cells)}value=rows;
 }else if(kind==="control"){
 if(el.matches('input[type=password],input[type=hidden],input[type=file]'))return {status:"unsupported",partial:false,value:null};
 value={tag:el.localName,disabled:!!el.disabled||el.getAttribute('aria-disabled')==='true',selected:el.localName==="select"?clip(el.value):null,checked:el.matches('input[type=checkbox],input[type=radio]')?el.checked:null,pressed:el.getAttribute('aria-pressed'),expanded:el.getAttribute('aria-expanded')};
 }else if(kind==="chart"){
 const chart=globalThis.Chart?.getChart?.(el);const ech=globalThis.echarts?.getInstanceByDom?.(el);
 // Restricted adapters: only serializable configured labels and series values, not actual drawn pixels.
 const data=v=>{if(!Array.isArray(v)){partial=true;return null}if(v.length>500)partial=true;return v.slice(0,500).map(x=>typeof x==="number"&&Number.isFinite(x)||x===null?x:typeof x==="string"?clip(x):(partial=true,null))};
 const series=xs=>{if(!Array.isArray(xs)){partial=true;return []}if(xs.length>30)partial=true;return xs.slice(0,30).map(s=>({label:clip(s.label??s.name),values:data(s.data)}))};
 if(chart)value={adapter:"chartjs",labels:data(chart.data?.labels??[]),series:series(chart.data?.datasets)};
 else if(ech){const o=ech.getOption();value={adapter:"echarts",labels:data(o.xAxis?.[0]?.data??[]),series:series(o.series)};}
 else status="unsupported";
 }
 return {status,partial,value};
}
export async function inspectRuntime(file,plan,{trusted=false}={}){
 if(!trusted)throw Error('explicit trusted standalone HTML authorization required');
 validateRuntimePlan(plan);
 const bytes=await readFile(file);if(bytes.length>8*1024*1024)throw Error('input exceeds 8 MiB');
 const sourceRef='sha256:'+createHash('sha256').update(bytes).digest('hex');
 const browser=await chromium.launch();const states=[];
 try{for(const scenario of [{id:"baseline",steps:[]},...plan.scenarios]){
 const context=await browser.newContext({offline:true,serviceWorkers:'block',acceptDownloads:false,viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const blocked=[];await context.route('**/*',async r=>{if(blocked.length<50)blocked.push(r.request().resourceType());await r.abort()});
 const page=await context.newPage();page.setDefaultTimeout(2500);const errors=[];page.on('pageerror',e=>{if(errors.length<20)errors.push(String(e).slice(0,500))});page.on('dialog',d=>d.dismiss().catch(()=>{}));context.on('page',p=>{if(p!==page)p.close().catch(()=>{})});
 const state={id:scenario.id,status:"observed",probes:[],errors,blocked};
 try{
 await page.setContent(bytes.toString('utf8'),{waitUntil:'load',timeout:5000});
 for(const step of scenario.steps){const target=page.locator(step.selector);if(await target.count()!==1)throw Error("action target not unique");if(step.action==="click")await target.click();else await target.selectOption({value:step.value});if(step.waitFor)await page.locator(step.waitFor).waitFor({state:'visible',timeout:2500})}
 for(const p of plan.probes){let result;try{const loc=page.locator(p.selector),count=await loc.count();result=count!==1?{status:count===0?"missing":"ambiguous",partial:false,value:null}:await loc.evaluate(collectProbe,p.kind,{timeout:2500})}catch{result={status:"error",partial:false,value:null}}state.probes.push({...result,id:p.id,kind:p.kind,ref:sourceRef+"#"+scenario.id+"/"+p.id,selector:p.selector})}
 }catch(e){state.status="failed";state.failure=String(e).slice(0,500)}
 finally{if(errors.length||blocked.length)state.status=state.status==="failed"?"failed":"limited";await context.close();states.push(state)}
 }}finally{await browser.close()}
 return {version:1,sourceRef,states,scope:"bounded trusted offline scenarios; no general runtime coverage, no security sandbox guarantee",releaseAuthorized:false};
}
