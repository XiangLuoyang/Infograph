import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {inspectRuntime} from './artifact-runtime-inspector.mjs';
import {compareRuntime} from './reconstruction-runtime-core.mjs';
const dir=await mkdtemp(join(tmpdir(),'ig-runtime-'));try{
const file=join(dir,'fixture.html');await writeFile(file,`<!doctype html><h1>Inventory</h1><select id="f"><option>A</option><option>B</option></select><p id="metric">10</p><table id="t"><tr><td>A</td><td>10</td></tr></table><script>document.querySelector('#f').onchange=e=>{document.querySelector('#metric').textContent=e.target.value==='B'?'20':'10';document.querySelector('#t td').textContent=e.target.value;}</script>`);
const plan={version:1,probes:[{id:'metric',kind:'text',selector:'#metric'},{id:'table',kind:'table',selector:'#t'},{id:'filter',kind:'control',selector:'#f'}],scenarios:[{id:'filtered',steps:[{action:'select',selector:'#f',value:'B'}]}]};
await assert.rejects(inspectRuntime(file,plan),/authorization/);
const report=await inspectRuntime(file,plan,{trusted:true});assert.deepEqual(report.states.map(s=>s.status),['observed','observed']);assert.equal(report.states[0].probes[0].value,'10');assert.equal(report.states[1].probes[0].value,'20');assert.equal(report.states[1].probes[1].value[0][0].text,'B');assert.equal(report.states[1].probes[2].value.selected,'B');assert.equal(compareRuntime(report,report,['metric','table','filter']).status,'observed-match');
const failed=await inspectRuntime(file,{...plan,scenarios:[{id:'bad',steps:[{action:'click',selector:'#missing'}]}]},{trusted:true});assert.equal(failed.states[1].status,'failed');console.log('runtime fixture passed');
}finally{await rm(dir,{recursive:true,force:true})}
