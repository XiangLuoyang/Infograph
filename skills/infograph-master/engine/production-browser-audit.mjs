// Trusted standalone HTML only; offline browser is not a hostile-code sandbox.
import {chromium} from 'playwright';
import {evaluateSemanticProbe} from './runtime-semantic-probes.mjs';
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
async function inspectIntegration(page,viewport,c,rt){
 const results=[];
 const check=async(id,fn)=>{try{const observed=await fn();results.push({id,status:observed.ok?'pass':'fail',observed})}catch(e){results.push({id,status:'fail',observed:{reason:String(e.message??e).slice(0,300)}})}};
 const activeCSS=async(id,css)=>{const s=page.locator('style[data-ig-engine='+JSON.stringify(id)+']');return await s.count()===1&&await s.evaluate((e,css)=>e.textContent===css&&Boolean(e.sheet)&&!e.sheet.disabled,css)};
 const rgb=s=>'rgb('+[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)).join(', ')+')';
 if(rt?.art)await check('ART',async()=>{
  const loc=page.locator('[data-ig-art='+JSON.stringify(rt.art.id)+']');
  if(await loc.count()!==1)return {ok:false,reason:'unique art root required'};
  const actual=await loc.evaluate(e=>({background:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color,visible:e.getClientRects().length>0&&getComputedStyle(e).visibility==='visible'}));
  let scoped=true;
  for(const k of c.checks){const target=page.locator(k.selector);if(await target.count()!==1||!await target.evaluate((e,id)=>Boolean(e.closest('[data-ig-art='+JSON.stringify(id)+']')),rt.art.id)){scoped=false;break}}
  const stylesheet=await activeCSS('ART',rt.art.css);
  return {ok:stylesheet&&actual.visible&&scoped&&actual.background===rgb(rt.art.palette.canvas)&&actual.color===rgb(rt.art.palette.text),...actual,scoped,stylesheet};
 });
 const tier=rt?.spatial?.tiers.find(t=>viewport.width>=t.minWidth&&viewport.height>=t.minHeight);
 const layout=rt?.spatial?.layouts.find(l=>l.tierId===tier?.id&&l.sliceId===c.sliceId&&l.generated);
 if(layout)await check('SPATIAL',async()=>{
  const root=page.locator('[data-ig-workspace][data-ig-tier='+JSON.stringify(tier.id)+']');
  if(await root.count()!==1)return {ok:false,reason:'unique selected workspace required'};
  const slice=root.locator(':scope > [data-ig-shell="work"] > [data-ig-slice='+JSON.stringify(c.sliceId)+']');
  if(await slice.count()!==1)return {ok:false,reason:'unique slice required'};
  const actual=await slice.evaluate(e=>({display:getComputedStyle(e).display,grid:getComputedStyle(e).gridTemplateAreas,visible:e.getClientRects().length>0,regions:[...e.children].filter(x=>x.hasAttribute('data-ig-region')).map(x=>({id:x.dataset.igRegion,area:getComputedStyle(x).gridArea,visible:x.getClientRects().length>0}))}));
  const stylesheet=await activeCSS('SPATIAL',rt.spatial.css);
  const expectedGrid=layout.rows.map(row=>'"'+row.map(id=>'ig_'+id).join(' ')+'"').join(' ');
  const ok=stylesheet&&actual.grid===expectedGrid&&actual.display==='grid'&&actual.visible&&JSON.stringify(actual.regions.map(x=>x.id))===JSON.stringify(layout.regions)&&actual.regions.every(x=>x.visible&&x.area==='ig_'+x.id);
  return {ok,...actual,stylesheet,expectedGrid,tierId:tier.id};
 });
 for(const scene of rt?.vmi??[])if(scene.sliceId===c.sliceId)await check(scene.id,async()=>{
  const loc=page.locator('iframe[data-ig-engine='+JSON.stringify(scene.id)+']');
  if(await loc.count()!==1||!await loc.isVisible())return {ok:false,reason:'visible unique VMI frame required'};
  const handle=await loc.elementHandle(),frame=await handle.contentFrame();
  if(!frame)return {ok:false,reason:'frame unavailable'};
  const actual=await frame.evaluate(()=>{const s=[...document.querySelectorAll('svg.scene')].find(e=>getComputedStyle(e).display!=='none');return s?{objects:[...s.querySelectorAll('[data-object]')].map(e=>e.dataset.object),edges:[...s.querySelectorAll('[data-edge]')].map(e=>e.dataset.edge),visible:s.getBoundingClientRect().width>0&&s.getBoundingClientRect().height>0,controls:[...document.querySelectorAll('[data-state]')].every(e=>!e.disabled),design:(()=>{const body=getComputedStyle(document.body),h=getComputedStyle(document.querySelector('h1')),panel=getComputedStyle(document.querySelector('.panel')),style=document.querySelector('style[data-ig-inherited]');return {id:style?.dataset.igInherited??null,css:style?.textContent??null,active:Boolean(style?.sheet&&!style.sheet.disabled),background:body.backgroundColor,color:body.color,fontSize:body.fontSize,headingSize:h.fontSize,radius:panel.borderTopLeftRadius,bodyFont:body.fontFamily,headingFont:h.fontFamily}})()}:null});
  const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
  const d=scene.design,observed=actual?.design;
  const fonts=s=>s.replace(/["'\s]/g,'').toLowerCase();
  const inherited=!d||Boolean(observed?.active&&observed.id===d.id&&observed.css===d.css&&observed.background===rgb(d.colors.background)&&observed.color===rgb(d.colors.ink)&&observed.fontSize===d.bodyPx+'px'&&observed.headingSize===d.headingPx+'px'&&observed.radius===d.radius+'px'&&fonts(observed.bodyFont)===fonts(d.bodyFont)&&fonts(observed.headingFont)===fonts(d.headingFont));
  return {ok:Boolean(actual?.visible&&actual.controls&&same(actual.objects,scene.objects)&&same(actual.edges,scene.edges)&&inherited),actual,inherited};
 });
 return results;
}
export async function auditProductionHTML(file,plan,dir,{trusted=false,integration=null}={}){
 if(!trusted)throw Error('explicit trusted standalone HTML required');
 const bytes=await readFile(file);if(bytes.length>8*1024*1024)throw Error('HTML too large');
 let browser;try{browser=await chromium.launch()}catch(e){throw Object.assign(new Error('Chromium launch failed: '+String(e.message??e)),{code:'BROWSER_LAUNCH_FAILED'})}
 const cases=[];
 try{
  for(const viewport of plan.viewports)for(const c of plan.cases){
   const context=await browser.newContext({offline:true,serviceWorkers:'block',acceptDownloads:false,viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
   const page=await context.newPage(),issues=[],observations=[],errors=[],blocked=[];
   const r={viewportId:viewport.id,caseId:c.id,sliceId:c.sliceId,status:'fail',issues,observations,semanticProbes:[],integration:[]};
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
    // Read actual DOM in the same state as the screenshot, never execute authored JS.
    for(const p of c.semanticProbes??[]){
     let observation;
     try{
      observation=await page.locator(p.selector).evaluateAll(els=>{
       const visible=els.filter(e=>{
        const rect=e.getBoundingClientRect();
        if(!e.getClientRects().length||rect.width<=0||rect.height<=0)return false;
        for(let a=e;a;a=a.parentElement){
         const s=getComputedStyle(a);
         if(s.display==='none'||s.visibility!=='visible'||Number(s.opacity)===0)return false;
        }
        return true;
       });
       return {matchCount:els.length,visibleCount:visible.length,text:visible.length===1?String(visible[0].innerText??visible[0].textContent??'').slice(0,201):null};
      });
     }catch(e){observation={error:'probe observation unavailable: '+String(e.message??e).slice(0,300)}}
     const result=evaluateSemanticProbe(p,observation);
     r.semanticProbes.push({observation,result});
     if(result.status!=='pass')issues.push({kind:'semantic-probe-failed',probeId:p.id,selector:p.selector,reason:result.reason});
    }
    r.integration=await inspectIntegration(page,viewport,c,integration);
    for(const item of r.integration)if(item.status!=='pass')issues.push({kind:'engine-application-failed',id:item.id,observation:item.observed});
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
  return {version:1,status:cases.every(c=>c.status==='pass')?'observed-pass':'observed-fail',browser:browser.version(),platform:process.platform,sourceSha256:hash(bytes),cases,scope:'bounded authored standalone HTML cases, reduced-motion; optional bounded DOM semantic probes; no automatic aesthetics, comprehensive semantic parity, general accessibility or full animation review',releaseAuthorized:false};
 }finally{await browser.close()}
}
