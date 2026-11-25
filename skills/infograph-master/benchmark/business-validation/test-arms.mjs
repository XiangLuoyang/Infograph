import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {buildArm,allowed} from './build-arm.mjs';
import {auditArm} from './audit-arm.mjs';
const root=mkdtempSync(join(tmpdir(),'infograph-arms-'));
const walk=(dir,p='')=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name),p+e.name+'/'):[p+e.name]);
try{
 for(const id of ['baseline','v1.1','v1.2']){
 const out=join(root,id),m=buildArm(id,out,resolve('.')),payload=join(out,'payload');
 assert.deepEqual(walk(payload).sort(),m.files.map(f=>f.path).sort());
 for(const f of m.files){assert(allowed(f.path));const b=readFileSync(join(payload,f.path));assert.equal(b.length,f.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256);}
 if(id==='baseline')assert.equal(m.files.length,0);else assert(m.files.some(f=>f.path===m.entry));
 const audit=auditArm(out);assert.equal(audit.arm,id);assert.equal(audit.revision,m.revision);if(id==='baseline')assert.equal(audit.referenceCount,0);
 console.log(id,m.revision,m.files.length,'files verified');console.log(JSON.stringify(audit));
 }
}finally{rmSync(root,{recursive:true,force:true});}
