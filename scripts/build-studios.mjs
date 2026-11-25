import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=resolve(root,'skills/infograph-master/visual-intelligence');
const out=resolve(root,'dist/studios');
const names=['color','typography','composition','material','motion','representation','master'];
const hash=x=>createHash('sha256').update(x).digest('hex');
await mkdir(out,{recursive:true});
const manifest={version:1,builder:'esbuild',studios:[]};
for(const name of names){
 const dir=name==='master'?resolve(root,'skills/infograph-master/engine'):source;
 const path=resolve(dir,name+'-studio.html'),html=await readFile(path,'utf8');
 const matches=[...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
 if(matches.length!==1)throw Error(name+': expected one inline module');
 let entry=matches[0][1];
 if(name==='master'){const fixture=await readFile(resolve(dir,'master-engine.example.json'),'utf8');const anchor="const res=await fetch('./master-engine.example.json');if(!res.ok)throw Error('fixture unavailable');const initial=await res.json();";if(!entry.includes(anchor))throw Error('master fixture anchor missing');entry=entry.replace(anchor,'const initial='+JSON.stringify(JSON.parse(fixture))+';');}
 const result=await build({stdin:{contents:entry,resolveDir:dir,sourcefile:name+'-studio-entry.mjs',loader:'js'},bundle:true,write:false,format:'iife',platform:'browser',target:'es2022',metafile:true,legalComments:'inline',absWorkingDir:root});
 if(result.outputFiles.length!==1||Object.values(result.metafile.outputs).some(o=>o.imports.length))throw Error(name+': external bundle dependencies');
 const js=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
 const output=html.slice(0,matches[0].index)+'<script>'+js+'</script>'+html.slice(matches[0].index+matches[0][0].length);
 const inputs={};for(const key of Object.keys(result.metafile.inputs).sort()){if(key===name+'-studio-entry.mjs'||key.endsWith('/'+name+'-studio-entry.mjs'))continue;inputs[key]=hash(await readFile(resolve(root,key)))}
 inputs[relative(root,path)]=hash(html);
 if(name==='master')inputs[relative(root,resolve(dir,'master-engine.example.json'))]=hash(await readFile(resolve(dir,'master-engine.example.json')));
 const file=name+'-studio.html';await writeFile(resolve(out,file),output);
 manifest.studios.push({name,file,bytes:Buffer.byteLength(output),sha256:hash(output),inputs});
}
await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
