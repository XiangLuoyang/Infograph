import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'dist/studios');
const hash=b=>createHash('sha256').update(b).digest('hex');
const names=['color','typography','composition','material','motion','representation','master'];
const manifest=JSON.parse(await readFile(resolve(out,'manifest.json'),'utf8'));
assert.equal(manifest.version,1);assert.equal(manifest.builder,'esbuild');
assert.deepEqual(manifest.studios.map(s=>s.name).sort(),[...names].sort());
assert.deepEqual((await readdir(out)).sort(),['manifest.json',...names.map(n=>n+'-studio.html')].sort());
for(const s of manifest.studios){
 assert.equal(s.file,s.name+'-studio.html');
 const bytes=await readFile(resolve(out,s.file));assert.equal(bytes.length,s.bytes);assert.equal(hash(bytes),s.sha256);
 const html=bytes.toString('utf8');assert.ok(!/<script\b[^>]*\bsrc\s*=/i.test(html));assert.ok(!/<script\b[^>]*type=["']module["']/i.test(html));
 const source='skills/infograph-master/'+(s.name==='master'?'engine/':'visual-intelligence/')+s.file;
 assert.ok(Object.hasOwn(s.inputs,source));assert.ok(Object.keys(s.inputs).length>1);
 if(s.name==='master')assert.ok(Object.hasOwn(s.inputs,'skills/infograph-master/engine/master-engine.example.json'));
 for(const [p,h] of Object.entries(s.inputs)){const full=resolve(root,p),rel=relative(root,full);assert.ok(!isAbsolute(p)&&!rel.startsWith('..')&&!isAbsolute(rel));assert.equal(hash(await readFile(full)),h,p);}
}
console.log(JSON.stringify({status:'pass',studios:names.length,manifest:'verified'}));
