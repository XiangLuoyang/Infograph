import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {inspectRuntime} from './artifact-runtime-inspector.mjs';
import {buildContactSheet} from './cross-page-review.mjs';
const dir=await mkdtemp(join(tmpdir(),'ig-sheet-'));try{
 const f=join(dir,'before.html'),g=join(dir,'after.html');const html='<button id="next" onclick="document.querySelector(\'#page\').textContent=\'Products\'">Next</button><h1 id="page">Overview</h1>';
 await writeFile(f,html);await writeFile(g,html+'<style>h1{color:teal}</style>');
 const plan={version:1,viewport:{width:800,height:600},probes:[{id:'page',kind:'text',selector:'#page'}],scenarios:[{id:'products',steps:[{action:'click',selector:'#next'}]}]};
 const b=await inspectRuntime(f,plan,{trusted:true,captureDir:join(dir,'b')}),a=await inspectRuntime(g,plan,{trusted:true,captureDir:join(dir,'a')});
 assert.ok(b.states.every(s=>s.capture&&s.status==='observed'));
 const out=join(dir,'review.html'),r=await buildContactSheet([{before:{report:b,dir:join(dir,'b')},after:{report:a,dir:join(dir,'a')}}],out);
 assert.equal(r.pairs,2);assert.equal(r.incomplete,0);assert.equal((await readFile(out,'utf8')).match(/data:image\/png;base64,/g).length,4);
 const bad=structuredClone(a);bad.states[1].capture.sha256='0'.repeat(64);await assert.rejects(buildContactSheet([{before:{report:b,dir:join(dir,'b')},after:{report:bad,dir:join(dir,'a')}}],join(dir,'bad.html')),/hash mismatch/);
 console.log('cross page review fixture passed');
}finally{await rm(dir,{recursive:true,force:true})}
