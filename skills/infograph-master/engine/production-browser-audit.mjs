// Trusted standalone HTML only; offline browser is not a hostile-code sandbox.
import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
function layoutAudit(){
 const issues=[],root=document.documentElement;
 if(root.scrollWidth>innerWidth+2)issues.push({kind:'document-overflow-x',width:root.scrollWidth,viewport:innerWidth});
 if(root.scrollHeight>16000)issues.push({kind:'capture-height-limit',height:root.scrollHeight});
 const svgs=[...document.querySelectorAll('svg')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility==='visible'&&e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0);
 for(const [index,svg] of svgs.entries()){
  const vb=svg.viewBox?.baseVal;
  if(!vb||vb.width<=0||vb.height<=0)continue;
  if(getComputedStyle(svg).overflow==='visible')continue;
  try{
   const b=svg.getBBox(),tol=2;
   if(b.x<vb.x-tol||b.y<vb.y-tol||b.x+b.width>vb.x+vb.width+tol||b.y+b.height>vb.y+vb.height+tol)issues.push({kind:'svg-viewbox-overflow',id:svg.id||'svg-'+index,bbox:[b.x,b.y,b.width,b.height],viewBox:[vb.x,vb.y,vb.width,vb.height]});
  }catch{issues.push({kind:'svg-bounds-unavailable',id:svg.id||'svg-'+index})}
 }
 return issues;
}
function inspectEssential(el){
 const r=el.getBoundingClientRect(),cs=getComputedStyle(el),issues=[];
 if(!el.getClientRects().length||r.width<=0||r.height<=0||cs.visibility!=='visible'||Number(cs.opacity)===0)issues.push('not-visible');
 if(r.left< -2||r.right>innerWidth+2)issues.push('outside-horizontal-viewport');
 for(let p=el.parentElement;p&&p!==document.body&&p!==document.documentElement;p=p.parentElement){
  const s=getComputedStyle(p),b=p.getBoundingClientRect();
  if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)issues.push('hidden-ancestor');
  if(['hidden','clip'].includes(s.overflowX)&&(r.left<b.left-2||r.right>b.right+2))issues.push('clipped-x');
  if(['hidden','clip'].includes(s.overflowY)&&(r.top<b.top-2||r.bottom>b.bottom+2))issues.push('clipped-y');
 }
 return {issues:[...new Set(issues)],text:String(el.innerText??el.textContent??'').slice(0,4000),bounds:[r.x,r.y,r.width,r.height]};
}
export async function auditProductionHTML(file,plan,dir,{trusted=false}={}){
 if(!trusted)throw Error('explicit trusted standalone HTML required');
 const bytes=await readFile(file);if(bytes.length>8*1024*1024)throw Error('HTML too large');
 let browser;try{browser=await chromium.launch()}catch(e){throw Object.assign(new Error('Chromium launch failed: '+String(e.message??e)),{code:'BROWSER_LAUNCH_FAILED'})}
 const cases=[];
 try{
  for(const viewport of plan.viewports)for(const c of plan.cases){
   const context=await browser.newContext({offline:true,serviceWorkers:'block',acceptDownloads:false,viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
   const page=await context.newPage(),issues=[],observations=[],errors=[],blocked=[];
   const r={viewportId:viewport.id,caseId:c.id,sliceId:c.sliceId,status:'fail',issues,observations};
   try{
    await context.route('**/*',async route=>{if(blocked.length<30)blocked.push(route.request().resourceType());await route.abort()});
    page.setDefaultTimeout(2500);page.on('pageerror',e=>{if(errors.length<20)errors.push(String(e).slice(0,500))});page.on('dialog',d=>d.dismiss().catch(()=>{}));context.on('page',p=>{if(p!==page)p.close().catch(()=>{})});
    await page.setContent(bytes.toString('utf8'),{waitUntil:'load',timeout:5000});
    for(const a of c.steps){const loc=page.locator(a.selector);if(await loc.count()!==1)throw Error('action target not unique: '+a.selector);
     if(a.action==='click')await loc.click();else if(a.action==='select')await loc.selectOption({value:a.value});else await loc.fill(a.value);
    }
    for(const k of c.checks){
     const loc=page.locator(k.selector);
     if(await loc.count()!==1){issues.push({kind:'essential-target-not-unique',selector:k.selector});continue}
     await loc.waitFor({state:'visible',timeout:2500}).catch(()=>{});
     const observed=await loc.evaluate(inspectEssential);observations.push({selector:k.selector,...observed});
     for(const kind of observed.issues)issues.push({kind,selector:k.selector});
     if(k.textIncludes!==undefined&&!observed.text.includes(k.textIncludes))issues.push({kind:'outcome-mismatch',selector:k.selector});
    }
    await page.evaluate(()=>document.fonts.ready);
    issues.push(...await page.evaluate(layoutAudit));
    const filename=viewport.id+'--'+c.id+'.png';
    if(!issues.some(x=>x.kind==='capture-height-limit')){
     const png=await page.screenshot({fullPage:true,animations:'disabled',caret:'hide',timeout:5000});
     await writeFile(join(dir,filename),png,{flag:'wx'});r.capture={filename,sha256:hash(png)};
    }
   }catch(e){issues.push({kind:'browser-operation-failed',message:String(e.message??e).slice(0,500)})}
   finally{
    if(errors.length)issues.push({kind:'page-errors',errors});
    if(blocked.length)issues.push({kind:'blocked-resources',resourceTypes:blocked});
    r.status=issues.length===0&&r.capture?'pass':'fail';cases.push(r);await context.close();
   }
  }
  return {version:1,status:cases.every(c=>c.status==='pass')?'observed-pass':'observed-fail',browser:browser.version(),platform:process.platform,sourceSha256:hash(bytes),cases,scope:'bounded authored standalone HTML cases, reduced-motion; no automatic aesthetics, semantic parity, general accessibility or full animation review',releaseAuthorized:false};
 }finally{await browser.close()}
}
