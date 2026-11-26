import {readFile,readdir} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(process.argv[2]||'dist/portable-skill');
const m=JSON.parse(await readFile(resolve(root,'portable-manifest.json'),'utf8'));
if(m.version!==1||m.releaseAuthorized!==false||m.entry!=='skills/infograph-master/SKILL.md')throw Error('invalid manifest');
const expected=new Set();
for(const f of m.files){
 const p=resolve(root,f.path);
 if(relative(root,p).replaceAll('\\','/')!==f.path||f.path.startsWith('..')||expected.has(f.path))throw Error('invalid manifest path');
 expected.add(f.path);
 const b=await readFile(p);
 if(b.length!==f.bytes||createHash('sha256').update(b).digest('hex')!==f.sha256)throw Error('file mismatch '+f.path);
}
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name),r=relative(root,p).replaceAll('\\','/');if(e.isDirectory())await walk(p);else if(!e.isFile()||r!=='portable-manifest.json'&&!expected.has(r))throw Error('unexpected file '+r)}}
await walk(root);
if(!expected.has(m.entry))throw Error('missing entry');
const registry=JSON.parse(await readFile(resolve(root,'skills/manifest.json'),'utf8'));
const {auditDiscovery}=await import('./skill-discovery.mjs');
const sources=new Map();for(const path of expected)if(path.endsWith('/SKILL.md'))sources.set(path,await readFile(resolve(root,path),'utf8'));
const report=auditDiscovery([...expected],p=>sources.get(p),registry);
if(!report.pass||m.packageVersion!==registry.packageVersion||JSON.stringify(m.entries)!==JSON.stringify(registry.skills.map(({name,path})=>({name,path}))))throw Error('skill registry mismatch '+JSON.stringify(report.errors));
console.log(JSON.stringify({revision:m.revision,verified:expected.size,entry:m.entry,entries:m.entries,packageVersion:m.packageVersion}));
