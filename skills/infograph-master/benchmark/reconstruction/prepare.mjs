import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
if(process.argv.length!==3)throw Error('usage: node prepare.mjs new-output-directory');
const out=resolve(process.argv[2]);await mkdir(out,{recursive:false});
const ids=['R01','R02','R03'],arms=['A','B','C'],schedule=[];
const prompt='Optimize the supplied existing HTML for its intended business use. Recover the likely reader task from the artifact itself, improve the design as appropriate, preserve essential facts and functionality, and return a working revised HTML plus a brief rationale and limitations.';
for(const id of ids)for(const arm of arms){
 const token=randomBytes(12).toString('hex'),dir=join(out,token);await mkdir(dir);
 await writeFile(join(dir,'input.html'),await readFile(join(root,'fixtures',id,'input.html')),{flag:'wx'});
 await writeFile(join(dir,'prompt.txt'),prompt,{flag:'wx'});schedule.push({token,case:id,arm});
}
await writeFile(join(out,'COORDINATOR-ONLY.json'),JSON.stringify({schedule,warning:'Never provide this directory or schedule to models. Copy only one individual packet; skill bundles separately pinned and filtered.'},null,2),{flag:'wx'});
console.log('Prepared '+schedule.length+' individual packets; no runs executed.');
