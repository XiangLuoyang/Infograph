#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {productionStages,productionEngines,dependencies,additionalDependencies,checkDependencies,evaluateProduction,productionStatus} from './execution-controller.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const vmi=join(root,'skills/infograph-master/visual-metaphor-intelligence');
const read=p=>readFileSync(p);
const json=p=>JSON.parse(read(p).toString('utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
const write=(p,v)=>writeFileSync(p,encode(v),{flag:'wx'});
const manifest=()=>json(join(root,'skills/manifest.json'));
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const stageNames=['vmi-explore','vmi-packet',...productionStages];
const engineNames={'vmi-explore':'exploration.mjs','vmi-packet':'pipeline.mjs',...productionEngines};
function fingerprints(){
 const paths=['scripts/infograph.mjs','scripts/execution-controller.mjs','scripts/execution-specialists.mjs','skills/manifest.json'];
 for(const sub of ['engine','references'])for(const name of readdirSync(join(root,'skills/infograph-master',sub)).sort())if(/\.(mjs|json|md)$/.test(name))paths.push('skills/infograph-master/'+sub+'/'+name);
 for(const sub of ['engine','ontology']){
  for(const name of readdirSync(join(vmi,sub)).sort()){
   if(/\.(mjs|json)$/.test(name))paths.push('skills/infograph-master/visual-metaphor-intelligence/'+sub+'/'+name);
  }
 }
 return Object.fromEntries(paths.map(p=>[p,hash(read(join(root,p)))]));
}
async function preflight(){
 const errors=[];let version=null,revision=null,files=null;
 try{version=manifest().packageVersion;assert(typeof version==='string','package version missing')}catch(e){errors.push('manifest: '+e.message)}
 try{revision=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()}catch{try{revision=json(join(root,'portable-manifest.json')).revision}catch{}}
 if(Number(process.versions.node.split('.')[0])<22)errors.push('Node.js 22+ required');
 try{
  files=fingerprints();
  const e=await import('../skills/infograph-master/visual-metaphor-intelligence/engine/exploration.mjs');
  const p=await import('../skills/infograph-master/visual-metaphor-intelligence/engine/pipeline.mjs');
  assert(typeof e.explorePerspectives==='function'&&typeof p.evaluatePacket==='function','missing VMI exports');
  assert(Array.isArray(json(join(vmi,'ontology/objects.json'))),'invalid objects ontology');
  assert(Array.isArray(json(join(vmi,'ontology/mechanisms.json')).predicates),'invalid mechanism ontology');
 }catch(e){errors.push('VMI: '+e.message)}
 return {schema:1,packageVersion:version,revision,node:process.version,platform:process.platform,files,status:errors.length?'blocked':'available',errors,releaseAuthorized:false};
}
async function evaluate(stage,input,run,prior){
 if(productionStages.includes(stage))return evaluateProduction(stage,input,run,prior);
 const objects=json(join(vmi,'ontology/objects.json')),ontology=json(join(vmi,'ontology/mechanisms.json'));
 if(stage==='vmi-explore'){
  assert(Array.isArray(input.perspectives)&&input.perspectives.length>0&&input.perspectives.length<=8,'supply 1–8 authored perspectives');
  const {explorePerspectives}=await import('../skills/infograph-master/visual-metaphor-intelligence/engine/exploration.mjs');
  return explorePerspectives(input.perspectives,objects,ontology,{shortlist:8,budget:4000});
 }
 if(stage==='vmi-packet'){
  const {evaluatePacket}=await import('../skills/infograph-master/visual-metaphor-intelligence/engine/pipeline.mjs');
  return evaluatePacket(input,objects,ontology);
 }
 throw Error('unknown stage');
}
async function context(dir){
 const run=json(join(dir,'run.json')),env=await preflight();
 assert(run.schema===1&&run.preflight.status==='available','run preflight blocked');
 assert(env.status==='available'&&same(env.files,run.preflight.files),'engine/package changed; start a new run');
 assert(hash(read(run.source.path))===run.source.sha256,'source changed; start a new run');
 return run;
}
async function checkStage(dir,stage,run){
 assert(stageNames.includes(stage),'unknown stage');
 const sd=join(dir,stage),r=json(join(sd,'receipt.json')),input=read(join(sd,'input.json')),output=read(join(sd,'output.json'));
 assert(r.schema===1&&r.stage===stage&&r.engine===engineNames[stage]&&r.status==='executed'&&r.sourceSha256===run.source.sha256,'invalid stage receipt');
 assert(hash(input)===r.inputSha256&&hash(output)===r.outputSha256,'stage bytes changed');
 const parsed=JSON.parse(input.toString('utf8'));
 if(stage==='vmi-packet'){
  const prior=await checkStage(dir,'vmi-explore',run);
  assert(same(parsed.perspectives,prior.input.perspectives)&&r.discoveryOutputSha256===prior.receipt.outputSha256,'packet/discovery mismatch');
 }
 const prior={};for(const dep of dependencies(stage,run))prior[dep]=await checkStage(dir,dep,run);
 for(const dep of additionalDependencies(stage,run,prior))prior[dep]=await checkStage(dir,dep,run);
 if(run.workflow==='production'){checkDependencies(stage,parsed,run,prior);assert(same(r.dependencies,Object.fromEntries(Object.entries(prior).map(([k,v])=>[k,v.receipt.outputSha256]))),'dependency receipt mismatch');}
 const replay=encode(await evaluate(stage,parsed,run,prior));
 assert(hash(replay)===r.outputSha256,'engine replay differs');
 return {input:parsed,receipt:r,output:JSON.parse(output.toString('utf8'))};
}
async function runStage(dir,stage,inputPath){
 assert(stageNames.includes(stage),'unknown stage');
 const run=await context(dir);
 const input=read(resolve(inputPath));
 assert(run.workflow==='production'||!productionStages.includes(stage),'use start-workflow for production stages');
 const sd=join(dir,stage);
 mkdirSync(sd); // No overwrite. New run required for retry in P0.
 writeFileSync(join(sd,'input.json'),input,{flag:'wx'});
 const receipt={schema:1,stage,engine:engineNames[stage],sourceSha256:run.source.sha256,inputSha256:hash(input),status:'blocked',releaseAuthorized:false};
 try{
  const parsed=JSON.parse(input.toString('utf8'));
  if(stage==='vmi-packet'){
   const prior=await checkStage(dir,'vmi-explore',run);
   assert(same(parsed.perspectives,prior.input.perspectives),'packet must retain discovery perspectives');
   receipt.discoveryOutputSha256=prior.receipt.outputSha256;
  }
  const prior={};for(const dep of dependencies(stage,run))prior[dep]=await checkStage(dir,dep,run);
 for(const dep of additionalDependencies(stage,run,prior))prior[dep]=await checkStage(dir,dep,run);
 if(run.workflow==='production'){checkDependencies(stage,parsed,run,prior);receipt.dependencies=Object.fromEntries(Object.entries(prior).map(([k,v])=>[k,v.receipt.outputSha256]));}
 const output=await evaluate(stage,parsed,run,prior),bytes=encode(output);
  writeFileSync(join(sd,'output.json'),bytes,{flag:'wx'});
  receipt.outputSha256=hash(bytes);receipt.status='executed';
  if(stage==='vmi-packet'){
   receipt.previewAvailable=Boolean(output.html);
   receipt.issues=output.issues;
   receipt.openDiscoveryRequired=output.openDiscoveryRequired;
  }
 }catch(e){receipt.error=e.message}
 write(join(sd,'receipt.json'),receipt);
 console.log(JSON.stringify(receipt,null,2));
 if(receipt.status!=='executed')process.exitCode=1;
}
async function main(){
 const [cmd,...args]=process.argv.slice(2);
 if(cmd==='preflight'&&!args.length){
  const result=await preflight();console.log(JSON.stringify(result,null,2));if(result.status!=='available')process.exitCode=1;return;
 }
 if((cmd==='start'||cmd==='start-workflow')&&args.length===3){
  const [task,sourcePath,runPath]=args;
  assert(['redesign','create','critique'].includes(task),'task must be redesign, create or critique');
  const source=resolve(sourcePath),dir=resolve(runPath),bytes=read(source),env=await preflight();
  mkdirSync(dir); // parent must exist; never overwrite prior evidence
  const record={schema:1,task,workflow:cmd==='start-workflow'?'production':'vmi-only',source:{path:source,sha256:hash(bytes),bytes:bytes.length},preflight:env,releaseAuthorized:false,scope:'P0 execution evidence, not design acceptance'};
  write(join(dir,'run.json'),record);console.log(JSON.stringify(record,null,2));if(env.status!=='available')process.exitCode=1;return;
 }
 if(cmd==='run'&&args.length===3){await runStage(resolve(args[0]),args[1],args[2]);return}
 if(cmd==='status'&&args.length===1){
  const dir=resolve(args[0]),run=await context(dir),stages={};assert(run.workflow==='production','use start-workflow');
  for(const stage of stageNames){if(!existsSync(join(dir,stage)))continue;try{stages[stage]=(await checkStage(dir,stage,run)).output}catch(e){console.log(JSON.stringify({status:'blocked',stage,error:e.message,releaseAuthorized:false},null,2));process.exitCode=1;return}}
  const result=productionStatus(run,stages);console.log(JSON.stringify(result,null,2));if(result.status==='blocked')process.exitCode=1;return;
 }
 if(cmd==='verify-vmi'&&args.length===1){
  const dir=resolve(args[0]),run=await context(dir),discovery=await checkStage(dir,'vmi-explore',run),packet=await checkStage(dir,'vmi-packet',run);
  const result={status:'replayed',stages:[discovery.receipt,packet.receipt],previewAvailable:Boolean(packet.output.html),openDiscoveryRequired:packet.output.openDiscoveryRequired,issues:packet.output.issues,releaseAuthorized:false,scope:'Execution replay only. Not proof of quality, final artifact integration or independent approval.'};
  console.log(JSON.stringify(result,null,2));return;
 }
 throw Error('usage: preflight | start|start-workflow <redesign|create|critique> <source> <new-run-dir> | run <run-dir> <stage> <input.json> | status <run-dir> | verify-vmi <run-dir>');
}
try{await main()}catch(e){console.error(e.message);process.exitCode=1}
