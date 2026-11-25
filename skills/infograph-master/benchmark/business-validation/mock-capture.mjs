import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {prepare} from './prepare.mjs';
const read=n=>JSON.parse(readFileSync(new URL(n,import.meta.url),'utf8'));
const schedule=prepare(read('tasks.json'),read('fixtures.json'));
const root=mkdtempSync(join(tmpdir(),'infograph-capture-')),pub=join(root,'review');mkdirSync(pub);
const browser=await chromium.launch({headless:true});
try{
 const key=[],manifest=[];
 for(const r of schedule){
 const id=randomUUID(),context=await browser.newContext({offline:true});const page=await context.newPage();
 try{
 await page.setContent('<html lang="en"><body><h1>Mock artifact</h1><p>Not a model result</p></body></html>');
 for(const [name,width,height] of [['desktop',1280,800],['mobile',390,844]]){
 await page.setViewportSize({width,height});await page.screenshot({path:join(pub,id+'-'+name+'.png'),animations:'disabled'});
 }
 key.push({id,runId:r.id});manifest.push({id,task:r.task,desktop:id+'-desktop.png',mobile:id+'-mobile.png'});
 }finally{await context.close();}
 }
 writeFileSync(join(root,'PRIVATE-key.json'),JSON.stringify(key));writeFileSync(join(pub,'manifest.json'),JSON.stringify(manifest));
 assert.equal(readdirSync(pub).length,37);assert.equal(new Set(key.map(x=>x.id)).size,18);
 for(const m of manifest){assert.deepEqual(Object.keys(m),['id','task','desktop','mobile']);for(const p of [m.desktop,m.mobile])assert.equal(readFileSync(join(pub,p)).subarray(0,8).toString('hex'),'89504e470d0a1a0a');}
 console.log('18 mock packets, 36 PNG screenshots; no model execution or sandbox certification');
}finally{await browser.close();rmSync(root,{recursive:true,force:true});}
