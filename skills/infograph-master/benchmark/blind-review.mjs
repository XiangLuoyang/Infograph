import {randomBytes,randomInt,createHash} from 'node:crypto';
import {readFile,mkdir,writeFile,readdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
export function blindPlan(records,id=()=>randomBytes(12).toString('hex'),rand=randomInt){
 const seen=new Set(),ids=new Set();const rows=records.map(r=>{if(!/^R\d+$/.test(r.runId)||seen.has(r.runId)||!['B02','B03','B07','B10'].includes(r.task))throw Error('invalid record');seen.add(r.runId);const blindId=id();if(!/^[a-f0-9]{24}$/.test(blindId)||ids.has(blindId))throw Error('invalid blind id');ids.add(blindId);return {blindId,runId:r.runId,task:r.task}});
 for(let i=rows.length-1;i>0;i--){const j=rand(i+1);[rows[i],rows[j]]=[rows[j],rows[i]]}return rows;
}
export async function buildReview(source,screens,destination){
 const root=resolve(destination);await mkdir(root,{recursive:false});const publicDir=join(root,'review');await mkdir(publicDir);
 const records=[];for(const n of (await readdir(source)).filter(n=>/^R\d+$/.test(n))){const r=JSON.parse(await readFile(join(source,n,'record.json'),'utf8'));if(r.runId!==n)throw Error('identity mismatch');if(r.status==='completed')records.push(r)}
 const rows=blindPlan(records);await writeFile(join(root,'PRIVATE-key.json'),JSON.stringify(rows,null,2),{mode:0o600,flag:'wx'});
 const items=[];for(const row of rows){const images=[];for(const width of [1440,390]){const bytes=await readFile(join(screens,row.runId+'-'+width+'.png'));const name=row.blindId+'-'+width+'.png';await writeFile(join(publicDir,name),bytes,{flag:'wx'});images.push({width,path:name,sha256:createHash('sha256').update(bytes).digest('hex')})}items.push({id:row.blindId,task:row.task,images})}
 await writeFile(join(publicDir,'manifest.json'),JSON.stringify({version:'0.1',items},null,2),{flag:'wx'});return items.length;
}
if(process.argv[1]&&import.meta.url===new URL('file:'+resolve(process.argv[1])).href){if(process.argv.length!==5)throw Error('usage: node blind-review.mjs runs screenshots new-output-dir');console.log(await buildReview(...process.argv.slice(2)))}
