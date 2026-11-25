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
 const svgIssues=[];let svgLabels=0;
 for(const svg of document.querySelectorAll('svg')){
 if(!visible(svg)||svg.ownerSVGElement)continue;
 const bounds=svg.getBoundingClientRect(),labels=[];
 for(const e of svg.querySelectorAll('text')){
 if(!visible(e)||!e.textContent.trim())continue;
 const r=e.getBoundingClientRect();if(r.width<=0||r.height<=0)continue;
 const label={text:e.textContent.trim().slice(0,120),id:e.id||null,left:r.left,right:r.right,top:r.top,bottom:r.bottom};labels.push(label);svgLabels++;
 if(r.left<bounds.left-2||r.right>bounds.right+2||r.top<bounds.top-2||r.bottom>bounds.bottom+2)svgIssues.push({kind:'svg-label-outside-viewport',svg:svg.id||null,label});
 }
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
 const a=labels[i],b=labels[j],w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
 if(w>2&&h>2&&w*h/Math.min((a.right-a.left)*(a.bottom-a.top),(b.right-b.left)*(b.bottom-b.top))>.1)svgIssues.push({kind:'svg-label-overlap-candidate',svg:svg.id||null,labels:[a,b],intersection:w*h});
 }
 }
 return {svgLabels,svgIssues,width:innerWidth,height:innerHeight,documentWidth:root.scrollWidth,overflow:root.scrollWidth>innerWidth+2,issues,scope:'DOM geometry diagnostic; includes SVG text bounding-box candidates; excludes occlusion, intentional overlap adjudication and pixel-level checks'};
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
