// Diagnostic only: flat sRGB HTML text, not pixel sampling or WCAG certification.
export async function auditContrast(page){
 return page.evaluate(()=>{
 const parse=s=>{const m=s.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);return m?[+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]]:null};
 const over=(a,b)=>[0,1,2].map(i=>a[i]*a[3]+b[i]*(1-a[3])).concat(1);
 const lum=c=>c.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
 const results=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
 const n=walker.currentNode,e=n.parentElement,t=n.textContent.trim();if(!t||!e||e.closest('script,style,svg,canvas,template,noscript'))continue;
 const range=document.createRange();range.selectNodeContents(n);if(!range.getClientRects().length)continue;
 const style=getComputedStyle(e);if(style.visibility!=='visible')continue;
 const chain=[];let reason=null;
 for(let a=e;a;a=a.parentElement){const s=getComputedStyle(a);if(s.opacity!=='1'||s.backgroundImage!=='none'||s.mixBlendMode!=='normal'||s.filter!=='none'||s.backdropFilter!=='none'||s.textShadow!=='none'){reason='complex compositing';break}const bg=parse(s.backgroundColor);if(!bg){reason='unsupported color';break}chain.push(bg);if(bg[3]===1)break;}
 const fg=parse(style.color);if(!fg||fg[3]===0||style.webkitTextFillColor==='rgba(0, 0, 0, 0)'||parseFloat(style.webkitTextStrokeWidth)>0)reason='unsupported text paint';
 const row={tag:e.tagName,id:e.id||null,text:t.slice(0,100)};
 if(reason||!chain.some(c=>c[3]===1)){results.push({...row,status:'manual-review',reason:reason||'unknown backdrop'});continue}
 const bg=chain.reverse().reduce((b,a)=>over(a,b),[255,255,255,1]),f=over(fg,bg),l=[lum(bg),lum(f)].sort((a,b)=>b-a),ratio=(l[0]+.05)/(l[1]+.05),size=parseFloat(style.fontSize),weight=parseFloat(style.fontWeight),threshold=size>=24||(size>=18.6667&&weight>=700)?3:4.5;
 results.push({...row,status:ratio>=threshold?'pass':'review-low-contrast',ratio,threshold,fontSize:size,fontWeight:weight});
 }
 return {scope:'computed flat HTML text; excludes SVG, canvas, form values and complex backgrounds; not pixel verification',results,counts:Object.fromEntries(['pass','review-low-contrast','manual-review'].map(s=>[s,results.filter(r=>r.status===s).length]))};
 });
}
