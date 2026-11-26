import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {validateBrowserPlan} from './execution-artifact.mjs';
const dir=mkdtempSync(join(tmpdir(),'ig-production-browser-')),cli=fileURLToPath(new URL('./infograph.mjs',import.meta.url));
const rules=JSON.parse(readFileSync(new URL('../skills/infograph-master/references/execution-gates.json',import.meta.url),'utf8'));
const call=(args,ok=true)=>{const r=spawnSync(process.execPath,[cli,...args],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(r.status,ok?0:1,r.stderr||r.stdout);return r.stdout?JSON.parse(r.stdout):null};
const save=(name,value)=>{const p=join(dir,name);writeFileSync(p,typeof value==='string'?value:JSON.stringify(value));return p};
const source=save('brief.txt','synthetic QA fixture'),revision=1,inventory=[{id:'s1',page:'p',ref:'fixture'},{id:'s2',page:'p',ref:'fixture'}];
const production={revision,purpose:'monitor',opportunities:{revision,inventory,slices:inventory.map(x=>({id:x.id,revision,task:'compare',relation:'rank',ref:'fixture',selectedFamily:'bar',rationale:'synthetic',rendererPlan:'SVG',candidates:['bar','dot'],mechanism:'none',expression:'none'}))},quality:{revision,purpose:'monitor',substantial:true,multiRoute:false,mixedModes:false,semanticInteraction:false,richScene:false,areas:Array.from({length:6},(_,i)=>({id:'QD0'+(i+1),applicable:i===5,reason:'synthetic',design:{revision,status:'pass',ref:'fixture'}}))},execution:{revision,purpose:'monitor',substantial:true,records:[...new Set(rules.flatMap(g=>g.requires))].map(key=>({key,revision,status:'pass',ref:'fixture'}))}};
const plan={version:1,viewports:[{id:'desktop',width:1440,height:900},{id:'mobile',width:390,height:844}],cases:[{id:'first',sliceId:'s1',kind:'baseline',steps:[],checks:[{selector:'#metric',textIncludes:'10'}]},{id:'second',sliceId:'s2',kind:'baseline',steps:[{action:'click',selector:'#nav'}],checks:[{selector:'#result',textIncludes:'20'}]},{id:'change',sliceId:'s1',kind:'interaction',steps:[{action:'click',selector:'#update'}],checks:[{selector:'#metric',textIncludes:'30'}]}]};
const html='<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><button id="nav">next</button><button id="update">change</button><p id="metric">10</p><p id="result" hidden>20</p><svg width="200" height="100" viewBox="0 0 200 100"><rect width="100" height="50"/></svg><script>nav.onclick=()=>{result.hidden=false};update.onclick=()=>{metric.textContent="30"}</script>';
try{
 assert.throws(()=>validateBrowserPlan({...plan,cases:[plan.cases[0]]},inventory),/baseline/);
 assert.throws(()=>validateBrowserPlan({...plan,viewports:[plan.viewports[0],{...plan.viewports[0],id:'wide'}]},inventory),/mobile/);
 const planFile=save('browser.json',plan),p=save('production.json',production);
 function setup(name,content){const run=join(dir,name),output=save(name+'.html',content);call(['start-workflow','create',source,run]);call(['bind-artifact',run,output,planFile],false);call(['run',run,'production-plan',p]);call(['bind-artifact',run,output,planFile]);return {run,output}}
 const good=setup('good',html);
 assert.equal(call(['artifact-status',good.run],false).status,'browser-pending');
 call(['browser-review',good.run],false);
 const pass=call(['browser-review','--trusted',good.run]);assert.equal(pass.cases.length,6);
 assert.equal(call(['artifact-status',good.run]).status,'browser-observed-pass');
 const cap=join(good.run,'artifact','browser','desktop--first.png');const png=readFileSync(cap);writeFileSync(cap,'tampered');call(['artifact-status',good.run],false);writeFileSync(cap,png);
 writeFileSync(good.output,html+'<!-- changed -->');call(['artifact-status',good.run],false);
 const bad=setup('bad',html.replace('width="100" height="50"','x="250" width="100" height="50"').replace('>30<','>30<')+'<div style="width:2000px">overflow</div>');
 const fail=call(['browser-review','--trusted',bad.run],false);assert.ok(fail.cases.some(c=>c.issues.some(x=>x.kind==='svg-viewbox-overflow')));assert.ok(fail.cases.some(c=>c.issues.some(x=>x.kind==='document-overflow-x')));
 assert.equal(call(['artifact-status',bad.run],false).status,'browser-observed-fail');
 console.log('P3a production browser, coverage, crop and hash tests passed');
}finally{rmSync(dir,{recursive:true,force:true})}
