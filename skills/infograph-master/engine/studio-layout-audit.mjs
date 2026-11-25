export async function auditLayout(page){
 return page.evaluate(()=>{
 const root=document.documentElement,issues=[];
 const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility==='visible';
 for(const e of document.querySelectorAll('body *')){
 if(!visible(e)||e.closest('svg,canvas,script,style'))continue;
 const s=getComputedStyle(e),r=e.getBoundingClientRect();
 if(e.clientWidth>0&&e.scrollWidth>e.clientWidth+2&&['hidden','clip'].includes(s.overflowX))issues.push({kind:'horizontal-clipping',tag:e.tagName,id:e.id||null,excess:e.scrollWidth-e.clientWidth});
 if(e.clientHeight>0&&e.scrollHeight>e.clientHeight+2&&['hidden','clip'].includes(s.overflowY))issues.push({kind:'vertical-clipping',tag:e.tagName,id:e.id||null,excess:e.scrollHeight-e.clientHeight});
 if(e.matches('button,input:not([type=hidden]),select,textarea')&&!e.disabled&&(r.left< -2||r.right>innerWidth+2)){
 let scrollable=false;for(let a=e.parentElement;a;a=a.parentElement)if(['auto','scroll'].includes(getComputedStyle(a).overflowX)&&a.scrollWidth>a.clientWidth){scrollable=true;break}
 if(!scrollable)issues.push({kind:'control-outside-viewport',tag:e.tagName,id:e.id||null,left:r.left,right:r.right});
 }
 }
 return {width:innerWidth,height:innerHeight,documentWidth:root.scrollWidth,overflow:root.scrollWidth>innerWidth+2,issues,scope:'DOM geometry diagnostic; excludes SVG text, occlusion, intentional truncation adjudication and pixel-level checks'};
 });
}
export async function stressLayout(page){
 const original=page.viewportSize(),reports=[];
 try{for(const [width,height] of [[320,568],[768,1024],[1920,1080],[3840,2160]]){
 await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 reports.push(await auditLayout(page));
 }}finally{if(original)await page.setViewportSize(original)}
 return reports;
}
