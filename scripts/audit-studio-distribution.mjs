import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(),dir=resolve(root,'dist/studios');
const manifest=JSON.parse(await readFile(resolve(dir,'manifest.json'),'utf8'));
const tracked=new Set(execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean));
const studios=[];
for(const s of manifest.studios){
 const inputs=[];
 for(const [path,expected] of Object.entries(s.inputs)){
  const absolute=resolve(root,path),rel=relative(root,absolute);
  if(rel.startsWith('..')||rel!==path)throw Error('invalid input path '+path);
  const bytes=await readFile(absolute);
  if(createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('input hash mismatch '+path);
  const kind=path.split('/').includes('node_modules')?'package':tracked.has(path)?'tracked-source':'untracked-source';
  inputs.push({path,kind,sha256:expected});
 }
 const html=await readFile(resolve(dir,s.file),'utf8');
 const externalReferences=[...new Set(html.match(/(?:src|href)\s*=\s*["'](?:https?:)?\/\/[^"']+["']/gi)||[])];
 const notices=html.split('\n').filter(l=>/@license|@preserve|SPDX-License-Identifier|copyright/i.test(l)).map(l=>l.trim().slice(0,500));
 studios.push({name:s.name,file:s.file,sha256:s.sha256,inputs,externalReferences,notices,reviewRequired:inputs.some(i=>i.kind!=='tracked-source')||externalReferences.length>0});
}
console.log(JSON.stringify({version:1,revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),studios,limitations:'Tracked source does not prove original ownership; lexical references do not capture dynamic network activity or copied third-party code.'},null,2));
