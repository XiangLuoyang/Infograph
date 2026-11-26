// Parse inert markup in a blank, offline browser; never navigate to input file.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {buildArtifactIR} from './artifact-semantic-ir.mjs';
function extractStaticDOM(html,limits={maxRecords:1500,maxText:4000,maxCells:4000}){
 const doc=new DOMParser().parseFromString(html,"text/html"),records=[];let truncated=false;
 const clip=(v)=>{const s=String(v??"");if(s.length>limits.maxText){truncated=true;return s.slice(0,limits.maxText)}return s};
 const loc=e=>{const parts=[];for(let x=e;x&&x.nodeType===1;x=x.parentElement){let k=1;for(let s=x.previousElementSibling;s;s=s.previousElementSibling)if(s.localName===x.localName)k++;parts.unshift(x.localName+":nth-of-type("+k+")")}return parts.join(">")};
 const text=e=>clip(e?.textContent?.trim()||"");
 const name=e=>{const explicit=e.getAttribute("aria-label")||e.getAttribute("title");if(explicit)return clip(explicit);const id=e.id;const label=Array.from(doc.querySelectorAll("label[for]")).find(l=>l.htmlFor===id&&id);return text(label||e.closest("label")||e)};
 const isPrivate=e=>e.matches('input[type="password"],input[type="hidden"]');
 const key=e=>{let v=e.getAttribute("data-semantic-id")||e.id;return v?clip(v):null};
 const push=(e,kind,label,value,partial=false)=>{if(records.length>=limits.maxRecords){truncated=true;return}records.push({kind,locator:loc(e),key:key(e),label:clip(label),value,truncated:partial});if(partial)truncated=true};
 for(const e of doc.querySelectorAll("h1,h2,h3,h4,h5,h6,main,section,article,[role=region],p,li,dt,dd,table,button,input,select,textarea,[role=button],[role=tab],[role=slider],canvas,svg,[role=img],script,a[href]")){
  if(records.length>=limits.maxRecords){truncated=true;break}
  const tag=e.localName;
  if(/^h[1-6]$/.test(tag))push(e,"heading",text(e),{level:Number(tag[1])});
  else if(e.matches("main,section,article,[role=region]"))push(e,"region",clip(e.getAttribute("aria-label")||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||""),{tag});
  else if(e.matches("p,li,dt,dd"))push(e,"text",text(e),{tag});
  else if(tag==="table"){let cells=0,partial=false;const rows=[];for(const row of e.rows){if(cells>=limits.maxCells){partial=true;break}const data=[];for(const c of row.cells){if(cells++>=limits.maxCells){partial=true;break}data.push({text:text(c),header:c.localName==="th",rowSpan:c.rowSpan,colSpan:c.colSpan})}rows.push(data)}push(e,"table",text(e.caption)||clip(e.getAttribute("aria-label")||""),{rows},partial)}
  else if(e.matches("button,input,select,textarea,[role=button],[role=tab],[role=slider]")){
   if(isPrivate(e))continue;
   const options=tag==="select"?Array.from(e.options).slice(0,200).map(o=>({label:clip(o.label),value:clip(o.value),selected:o.defaultSelected})):null;
   push(e,"control",name(e),{tag,type:e.getAttribute("type"),role:e.getAttribute("role"),disabled:e.hasAttribute("disabled")||e.getAttribute("aria-disabled")==="true",min:e.getAttribute("min"),max:e.getAttribute("max"),step:e.getAttribute("step"),options},tag==="select"&&e.options.length>200);
  }else if(e.matches("canvas,svg,[role=img]"))push(e,"chart",clip(e.getAttribute("aria-label")||e.querySelector("title")?.textContent||""),{tag,role:e.getAttribute("role"),description:clip(e.querySelector("desc")?.textContent||"")});
  else if(tag==="script"){const type=(e.getAttribute("type")||"").toLowerCase();if(["application/json","application/ld+json"].includes(type)&&!e.hasAttribute("src")){const raw=e.textContent||"";let value={parse:"not-run"};let partial=raw.length>limits.maxText;if(!partial){try{value={parse:"ok",data:JSON.parse(raw)}}catch{value={parse:"invalid"}}}push(e,"json",type,value,partial)}else push(e,"script",type,{external:e.hasAttribute("src"),inlineLength:e.textContent?.length||0,executed:false})}
  else if(tag==="a")push(e,"link",name(e),{hrefKind:e.getAttribute("href")?.startsWith("#")?"fragment":"other",fragment:e.getAttribute("href")?.startsWith("#")?clip(e.getAttribute("href")):null});
 }
 return {records,truncated};
}
export async function inspectArtifact(file){
 const bytes=await readFile(file);if(bytes.length>8*1024*1024)throw Error('input exceeds 8 MiB static limit');
 const sourceRef='sha256:'+createHash('sha256').update(bytes).digest('hex');
 const browser=await chromium.launch();try{const context=await browser.newContext({offline:true,serviceWorkers:'block'});await context.route('**/*',r=>r.abort());const page=await context.newPage();const snapshot=await page.evaluate(extractStaticDOM,bytes.toString('utf8'));return buildArtifactIR({...snapshot,sourceRef});}finally{await browser.close()}
}
