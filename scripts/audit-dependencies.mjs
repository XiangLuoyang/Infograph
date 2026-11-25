import {readdirSync,readFileSync,statSync,existsSync} from 'node:fs';
import {resolve,relative,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const scope=resolve(root,'skills/infograph-master');
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):e.isFile()?[resolve(dir,e.name)]:[])}
export function audit(files,read,exists,base){
 const modules=files.filter(p=>extname(p)==='.mjs'||extname(p)==='.js').sort(), set=new Set(modules),edges=[],external=[];
 for(const p of modules){const source=read(p);for(const m of source.matchAll(/(?:\bfrom\s*|\bimport\s*)['"]([^'"]+)['"]/g)){const spec=m[1];if(!spec.startsWith('.')){external.push({from:relative(base,p),specifier:spec});continue}const target=resolve(dirname(p),spec);edges.push({from:p,to:target,exists:exists(target)})}}
 const adj=new Map(modules.map(p=>[p,[]]));for(const e of edges)if(set.has(e.to))adj.get(e.from).push(e.to);
 const active=new Set(),done=new Set(),cycles=[];function visit(p,trail){if(active.has(p)){cycles.push([...trail.slice(trail.indexOf(p)),p].map(x=>relative(base,x)));return}if(done.has(p))return;active.add(p);for(const q of adj.get(p))visit(q,[...trail,p]);active.delete(p);done.add(p)}for(const p of modules)visit(p,[]);
 const mapped=edges.map(e=>({...e,from:relative(base,e.from),to:relative(base,e.to)}));
 return {modules:modules.length,tests:modules.filter(p=>/(^|[/\\])test[-_]/.test(p)).map(p=>relative(base,p)),edges:mapped,missing:mapped.filter(e=>!e.exists),cycles,external,scope:'heuristic static quoted imports; excludes dynamic imports, HTML, Python, package resolution and semantic layering'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const result=audit(walk(scope),p=>readFileSync(p,'utf8'),p=>existsSync(p)&&statSync(p).isFile(),root);console.log(JSON.stringify(result,null,2));if(result.missing.length||result.cycles.length)process.exitCode=1}
