import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync,cpSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const root=resolve(process.argv[2]??'dist/portable-skill'),temp=mkdtempSync(join(tmpdir(),'infograph-portable-'));
const run=(cwd,args)=>{const r=spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(r.status,0,r.stderr||r.stdout);return r.stdout};
try{
 const copied=join(temp,'installed');cpSync(root,copied,{recursive:true});
 const manifest=JSON.parse(readFileSync(join(copied,'portable-manifest.json'),'utf8'));
 run(copied,['scripts/verify-portable-skill.mjs','.']);
 run(copied,['scripts/audit-skill-discovery.mjs','.']);
 const env=JSON.parse(run(copied,['scripts/infograph.mjs','preflight']));
 assert.equal(env.status,'available');assert.equal(env.revision,manifest.revision);
 for(const test of ['execution','production','specialists','authoring','vmi-batch','delivery']){
  console.log(run(copied,['scripts/test-infograph-'+test+'.mjs']).trim());
 }
 console.log(run(copied,['skills/infograph-master/engine/business-semantic-qa.test.mjs']).trim());
 console.log(run(copied,['skills/infograph-master/engine/runtime-semantic-probes.test.mjs']).trim());
 run(copied,['scripts/verify-portable-skill.mjs','.']);
 console.log('Portable execution candidate verified after relocation; browser dependency not installed or tested here');
}finally{rmSync(temp,{recursive:true,force:true})}
