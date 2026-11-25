import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const read=n=>JSON.parse(readFileSync(new URL(n,import.meta.url),'utf8'));
const hash=s=>createHash('sha256').update(s).digest('hex');
export function prepare(tasks,fixtures,seed='business-pilot-v1'){
 if(tasks.length!==6||new Set(tasks.map(t=>t.id)).size!==6||fixtures.synthetic!==true) throw Error('invalid fixture set');
 const runs=[];
 for(const t of tasks){
  if(!Object.hasOwn(fixtures,t.fixture)||!t.brief||!t.rules||Object.keys(t).some(k=>!['id','fixture','brief','rules'].includes(k))) throw Error('invalid model-facing task');
  const prompt=['Create a self-contained offline HTML artifact in English for a business audience. Use only the synthetic data supplied. Preserve facts, units and required interactions. Support keyboard operation and desktop/mobile layouts. Return complete HTML only. Do not access external resources.',t.brief,t.rules,JSON.stringify(fixtures[t.fixture],null,2)].join('\n\n');
  for(const arm of ['baseline','v1.1','v1.2']){
   const id=hash(seed+':'+t.id+':'+arm).slice(0,20);
   runs.push({id,task:t.id,arm,prompt,promptHash:hash(prompt),order:hash(seed+':order:'+id)});
  }
 }
 return runs.sort((a,b)=>a.order.localeCompare(b.order));
}
if(process.argv[2]){
 const out=resolve(process.argv[2]);mkdirSync(out,{recursive:false});
 const runs=prepare(read('tasks.json'),read('fixtures.json'));
 for(const r of runs)writeFileSync(resolve(out,r.id+'.txt'),r.prompt,{flag:'wx'});
 writeFileSync(resolve(out,'PRIVATE-schedule.json'),JSON.stringify(runs.map(({prompt,...r})=>r),null,2),{flag:'wx'});
}
