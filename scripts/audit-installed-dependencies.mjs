import {readdir,readFile,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(process.argv[2]||'node_modules'),rows=[];
async function scan(dir){
 for(const e of await readdir(dir,{withFileTypes:true})){
 if(!e.isDirectory()||e.name.startsWith('.'))continue;
 const p=join(dir,e.name);
 if(e.name.startsWith('@')){await scan(p);continue}
 const m=JSON.parse(await readFile(join(p,'package.json'),'utf8'));
 const notices=[];
 for(const f of await readdir(p)){if(!/^(licen[cs]e|copying|notice)([._-].*)?$/i.test(f))continue;const q=join(p,f);if(!(await stat(q)).isFile())continue;const b=await readFile(q);notices.push({file:f,sha256:createHash('sha256').update(b).digest('hex'),text:b.toString('utf8')})}
 rows.push({name:m.name,version:m.version,license:m.license??null,dependencies:m.dependencies??{},optionalDependencies:m.optionalDependencies??{},notices});
 const nested=join(p,'node_modules');try{await stat(nested)}catch(e){if(e.code==='ENOENT')continue;throw e}await scan(nested);
 }}
await scan(root);
console.log(JSON.stringify({version:1,scope:process.argv[3]||'unspecified',packages:rows,limitations:'Installed npm package metadata and notice files only; not a legal conclusion or complete browser/system SBOM.'},null,2));
