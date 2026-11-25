import assert from 'node:assert/strict';
export async function auditAccessibility(page){
 const report=await page.evaluate(()=>{
 const visible=e=>!!(e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
 const controls=[...document.querySelectorAll('button,input:not([type=hidden]),select,textarea')].filter(e=>visible(e)&&!e.disabled);
 const name=e=>[e.getAttribute('aria-label'),...(e.getAttribute('aria-labelledby')||'').split(/\s+/).filter(Boolean).map(id=>document.getElementById(id)?.textContent),...Array.from(e.labels||[]).map(l=>l.textContent),e.tagName==='BUTTON'?e.textContent:'',e.getAttribute('title')].filter(Boolean).join(' ').trim();
 return {lang:document.documentElement.lang,controls:controls.length,unnamed:controls.filter(e=>!name(e)).map(e=>e.id||e.outerHTML.slice(0,150)),positiveTabIndex:controls.filter(e=>e.tabIndex>0).map(e=>e.id),overflow:document.documentElement.scrollWidth>innerWidth+2};
 });
 assert.ok(report.lang,'missing document language');assert.ok(report.controls>0,'no interactive controls');
 assert.deepEqual(report.unnamed,[],'unnamed controls');assert.deepEqual(report.positiveTabIndex,[],'positive tabindex');assert.equal(report.overflow,false);
 const expected=await page.evaluate(()=>[...document.querySelectorAll('button,input:not([type=hidden]),select,textarea')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&!e.disabled&&e.tabIndex>=0).map(e=>{e.dataset.qaFocus=String([...document.querySelectorAll('*')].indexOf(e));return e.dataset.qaFocus}));
 await page.evaluate(()=>{document.activeElement?.blur();const a=document.createElement('button');a.id='qa-focus-start';a.style.position='fixed';a.style.opacity='0';a.textContent='QA start';document.body.prepend(a);a.focus()});
 const visited=new Set(),focus=[];
 try{
 for(let i=0;i<expected.length+80;i++){
 await page.keyboard.press('Tab');
 const f=await page.evaluate(()=>{const e=document.activeElement,s=getComputedStyle(e),r=e.getBoundingClientRect();return {id:e.dataset.qaFocus??null,tag:e.tagName,visible:e.matches(':focus-visible'),outline:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0,shadow:s.boxShadow!=='none',inViewport:r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth}});
 if(f.id!==null){if(visited.has(f.id))break;visited.add(f.id);focus.push(f);assert.ok(f.visible&&(f.outline||f.shadow),'keyboard focus indicator missing: '+f.id);assert.ok(f.inViewport,'focused control outside viewport: '+f.id)}
 if(visited.size===expected.length)break;
 }
 assert.deepEqual([...visited].sort(),expected.sort(),'keyboard traversal incomplete');
 }finally{await page.evaluate(()=>{document.getElementById('qa-focus-start')?.remove();document.querySelectorAll('[data-qa-focus]').forEach(e=>delete e.dataset.qaFocus);window.scrollTo(0,0)})}
 return {...report,focus,scope:'structural and native control keyboard traversal; not WCAG certification'};
}
