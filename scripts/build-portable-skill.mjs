import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(),out=resolve(root,'dist/portable-skill');
const paths=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const selected=paths.filter(p=>/^(skills\/|catalog\/|research\/|assets\/|examples\/|docs\/|scripts\/)/.test(p)||p==='README.md'||/^(LICENSE|NOTICE)(\..*)?$/.test(p));
const files=[];
for(const path of selected){
 const dest=resolve(out,path);if(relative(out,dest).startsWith('..'))throw Error('invalid path');
 const b=await readFile(resolve(root,path));await mkdir(dirname(dest),{recursive:true});await writeFile(dest,b,{flag:'wx'});files.push({path,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});
}
await writeFile(resolve(out,'portable-manifest.json'),JSON.stringify({version:1,revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),entry:'skills/infograph-master/SKILL.md',layout:'repository-relative',releaseAuthorized:false,files},null,2),{flag:'wx'});
