import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const config=JSON.parse(readFileSync(new URL('arms.json',import.meta.url)));
const sha=b=>createHash('sha256').update(b).digest('hex');
export function allowed(path,policy=config.policy){
 return !path.split('/').some(s=>policy.denySegments.includes(s)||s==='..'||s==='')&&!policy.denyPrefixes.some(p=>path.startsWith(p))&&(policy.allowRoot.includes(path)||policy.allowPrefixes.some(p=>path.startsWith(p)));
}
export function buildArm(id,out,gitRoot){
 const arm=config.arms.find(a=>a.id===id);if(!arm)throw Error('unknown arm');
 const files=[];const payload=resolve(out,'payload');mkdirSync(out,{recursive:false});mkdirSync(payload);
 if(arm.revision){
 const git=(args)=>execFileSync('git',args,{cwd:gitRoot,maxBuffer:128*1024*1024});
 if(git(['rev-parse',arm.revision+'^{commit}']).toString().trim()!==arm.revision)throw Error('revision mismatch');
 for(const row of git(['ls-tree','-r','-z',arm.revision]).toString().split('\0').filter(Boolean)){
 const [meta,path]=row.split('\t');if(!allowed(path))continue;
 const [mode,type,oid]=meta.split(' ');if(type!=='blob'||!['100644','100755'].includes(mode))throw Error('unsupported asset '+path);
 const b=git(['cat-file','blob',oid]);const dest=resolve(payload,path);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,b,{flag:'wx'});files.push({path,bytes:b.length,sha256:sha(b)});
 }
 if(!files.some(f=>f.path===arm.entry))throw Error('entry missing');
 }
 const manifest={version:1,arm:id,revision:arm.revision,entry:arm.entry,activation:arm.activation??null,files,closure:'not-run',sandbox:'not-run'};
 writeFileSync(resolve(out,'PRIVATE-manifest.json'),JSON.stringify(manifest,null,2),{flag:'wx'});return manifest;
}
if(process.argv[2])buildArm(process.argv[2],resolve(process.argv[3]),resolve(process.argv[4]??'.'));
