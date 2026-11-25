import {readFile,mkdir,writeFile,access} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const read=async p=>JSON.parse(await readFile(new URL(p,import.meta.url),'utf8'));
const hash=s=>createHash('sha256').update(s).digest('hex');
export function planRuns(schedule,baseline,enhanced,{limit=1,arm='all'}={}){
 if(!Number.isInteger(limit)||limit<1||limit>24||!['all','baseline','full'].includes(arm))throw Error('invalid selection');
 const seen=new Set();return schedule.filter(s=>arm==='all'||s.arm===arm).map(s=>{
 if(!/^R[0-9]+$/.test(s.runId)||seen.has(s.runId))throw Error('invalid run id');seen.add(s.runId);
 const p=(s.arm==='baseline'?baseline:enhanced).find(p=>p.runId===s.runId&&p.task===s.task);
 if(!p||typeof p.prompt!=='string'||!p.prompt.trim())throw Error('missing prompt '+s.runId);
 return {...s,prompt:p.prompt,promptHash:hash(p.prompt)};
 }).slice(0,limit);
}
export function extractHTML(s){
 if(typeof s!=='string')throw Error('missing response text');
 const t=s.trim().replace(/^\x60\x60\x60html\s*/i,'').replace(/\s*\x60\x60\x60$/,'').trim();
 if(!/^(<!doctype html[^>]*>\s*)?<html[\s>]/i.test(t)||!/<\/html>$/i.test(t))throw Error('not a complete HTML document');
 return t;
}
export async function runOne(p,{baseUrl,key,model,out,maxTokens=8192,timeout=180000,fetcher=fetch}){
 const dir=join(out,p.runId);await mkdir(dir,{recursive:false});
 const settings={model,max_tokens:maxTokens,temperature:0.2};
 await writeFile(join(dir,'prompt.txt'),p.prompt,{flag:'wx'});
 await writeFile(join(dir,'settings.json'),JSON.stringify(settings,null,2),{flag:'wx'});
 const start=Date.now();let record={runId:p.runId,task:p.task,arm:p.arm,modelSlot:p.model,modelVersion:model,settingsRef:join(dir,'settings.json'),promptRef:join(dir,'prompt.txt'),promptHash:p.promptHash,status:'failed'};
 try{
 const response=await fetcher(baseUrl.replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({...settings,messages:[{role:'user',content:p.prompt}]}),signal:AbortSignal.timeout(timeout)});
 const raw=await response.text();await writeFile(join(dir,'response.txt'),raw,{flag:'wx'});
 if(!response.ok)throw Error('HTTP '+response.status);
 const data=JSON.parse(raw);record.modelVersion=data.model||model;record.inputTokens=data.usage?.prompt_tokens??null;record.outputTokens=data.usage?.completion_tokens??null;
 if(data.choices?.[0]?.finish_reason==='length')throw Error('truncated response');
 const html=extractHTML(data.choices?.[0]?.message?.content);await writeFile(join(dir,'artifact.html'),html,{flag:'wx'});record={...record,status:'completed',artifactRef:join(dir,'artifact.html'),artifactHash:hash(html)};
 }catch(e){record.failure=String(e.message).split(key).join('[redacted]')}
 record.elapsedSeconds=(Date.now()-start)/1000;await writeFile(join(dir,'record.json'),JSON.stringify(record,null,2),{flag:'wx'});return record;
}
async function main(){
 const args=process.argv.slice(2);const execute=args.includes('--execute');const val=(k,d)=>{const i=args.indexOf(k);return i<0?d:args[i+1]};
 const schedule=await read('./pilot-schedule.json'),base=(await read('./baseline-packets.json')).packets,enh=(await read('./enhanced-packets.json')).packets;
 const out=val('--out','benchmark-local'),limit=Number(val('--limit','1')),arm=val('--arm','all'),model=process.env.BENCH_MODEL,baseUrl=process.env.BENCH_BASE_URL,key=process.env.BENCH_API_KEY;
 const plan=planRuns(schedule,base,enh,{limit:24,arm});const pending=[];for(const p of plan){try{await access(join(out,p.runId))}catch(e){if(e.code!=='ENOENT')throw e;pending.push(p)}}
 if(!Number.isInteger(limit)||limit<1||limit>24)throw Error('invalid limit');const selected=pending.slice(0,limit);
 console.log(JSON.stringify({execute,model:model??null,selected:selected.map(({prompt,...p})=>p)},null,2));if(!execute)return;
 if(!key||!model||!baseUrl||!baseUrl.startsWith('https://'))throw Error('set BENCH_API_KEY, BENCH_MODEL, HTTPS BENCH_BASE_URL');
 await mkdir(out,{recursive:true});for(const p of selected){const result=await runOne(p,{baseUrl,key,model,out});console.log(result.runId,result.status);if(result.status==='failed')break;}
}
if(process.argv[1]&&import.meta.url===new URL('file:'+process.argv[1]).href)main().catch(e=>{console.error(e.message);process.exitCode=1});
