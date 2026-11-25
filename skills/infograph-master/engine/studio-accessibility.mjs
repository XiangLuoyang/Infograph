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
 await page.evaluate(()=>document.activeElement?.blur());
 await page.keyboard.press('Tab');
 const focus=await page.evaluate(()=>{const e=document.activeElement,s=getComputedStyle(e);return {tag:e.tagName,visible:e.matches(':focus-visible'),outline:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0,shadow:s.boxShadow!=='none'}});
 assert.notEqual(focus.tag,'BODY','keyboard focus missing');assert.ok(focus.visible&&(focus.outline||focus.shadow),'keyboard focus indicator missing');
 return {...report,focus,scope:'basic structural and first keyboard focus smoke; not WCAG certification'};
}
