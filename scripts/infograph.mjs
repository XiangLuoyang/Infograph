#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync,cpSync,realpathSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {evaluateSceneBatch,hasVmiPreview,vmiRetryStatus,prepareVmiRetry} from './execution-vmi.mjs';
import {checkDelivery,prepareHandoff,verifyHandoff} from './execution-delivery.mjs';
import {critiqueTask,submitCritique,critiqueStatus} from './execution-critique.mjs';
import {dispatchReviewer} from './execution-reviewer.mjs';
import {integrationContract,integrationTask,assembleArtifact} from './execution-integration.mjs';
import {geometryTemplate,geometryLibrary} from '../skills/infograph-master/visual-metaphor-intelligence/engine/physical-geometry.mjs';
import {proposeCompositions,compositionPreview} from '../skills/infograph-master/engine/composition-candidates.mjs';
import {compileArtDirections,selectArtDirection,artDirectionCSS,artDirectionPreview} from '../skills/infograph-master/engine/art-direction-production.mjs';
import {semanticTask,submitSemantic,semanticStatus} from './execution-semantic.mjs';
import {bindArtifact,browserReview,artifactStatus} from './execution-artifact.mjs';
import {authoringTask,hydrateInput} from './execution-authoring.mjs';
import {constructVmiPacket} from '../skills/infograph-master/engine/vmi-authoring.mjs';
import {lintVmiPacket} from '../skills/infograph-master/engine/vmi-lint.mjs';
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
const stageNames=['reconstruction-prepare','reconstruction-plan','production-plan','vmi-explore','vmi-packet','specialist-plan'];
const rules=()=>json(join(root,'skills/infograph-master/references/execution-gates.json'));
const engineNames={'vmi-explore':'exploration.mjs','vmi-packet':'pipeline.mjs',...productionEngines};
function fingerprints(){
 const paths=['skills/infograph-master/SKILL.md','skills/visual-metaphor-intelligence/SKILL.md','skills/narrative-design/SKILL.md','docs/EXECUTION-ARCHITECTURE.md','scripts/infograph.mjs','scripts/execution-controller.mjs','scripts/execution-specialists.mjs','scripts/execution-authoring.mjs','scripts/execution-vmi.mjs','scripts/execution-artifact.mjs','scripts/execution-critique.mjs','scripts/execution-delivery.mjs','scripts/execution-semantic.mjs','scripts/execution-reviewer.mjs','scripts/execution-integration.mjs','skills/manifest.json'];
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
 try{
  if(existsSync(join(root,'portable-manifest.json')))revision=json(join(root,'portable-manifest.json')).revision;
  else if(existsSync(join(root,'.git')))revision=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
 }catch(e){errors.push('revision: '+e.message)}
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
 if(run.workflow==='production')return evaluateSceneBatch(stage,input,prior['production-plan'].output.selectedMechanisms,objects,ontology,{art:prior['production-plan'].output.artDirection});
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
 let parsed=JSON.parse(input.toString('utf8'));
 if(stage==='vmi-packet'&&run.workflow!=='production'){
  const prior=await checkStage(dir,'vmi-explore',run);
  assert(same(parsed.perspectives,prior.input.perspectives)&&r.discoveryOutputSha256===prior.receipt.outputSha256,'packet/discovery mismatch');
 }
 const prior={};for(const dep of dependencies(stage,run))prior[dep]=await checkStage(dir,dep,run);
 for(const dep of additionalDependencies(stage,run,prior))prior[dep]=await checkStage(dir,dep,run);
 if(run.workflow==='production'){parsed=hydrateInput(stage,parsed,run,prior);checkDependencies(stage,parsed,run,prior);
 assert(same(r.dependencies,Object.fromEntries(Object.entries(prior).map(([k,v])=>[k,v.receipt.outputSha256]))),'dependency receipt mismatch');}
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
  let parsed=JSON.parse(input.toString('utf8'));
  if(stage==='vmi-packet'&&run.workflow!=='production'){
   const prior=await checkStage(dir,'vmi-explore',run);
   assert(same(parsed.perspectives,prior.input.perspectives),'packet must retain discovery perspectives');
   receipt.discoveryOutputSha256=prior.receipt.outputSha256;
  }
  const prior={};for(const dep of dependencies(stage,run))prior[dep]=await checkStage(dir,dep,run);
 for(const dep of additionalDependencies(stage,run,prior))prior[dep]=await checkStage(dir,dep,run);
 if(run.workflow==='production'){parsed=hydrateInput(stage,parsed,run,prior);checkDependencies(stage,parsed,run,prior);
 receipt.dependencies=Object.fromEntries(Object.entries(prior).map(([k,v])=>[k,v.receipt.outputSha256]));}
 const output=await evaluate(stage,parsed,run,prior),bytes=encode(output);
  writeFileSync(join(sd,'output.json'),bytes,{flag:'wx'});
  receipt.outputSha256=hash(bytes);receipt.status='executed';
  if(stage==='vmi-packet'){
   receipt.previewAvailable=hasVmiPreview(output);
   receipt.issues=output.issues;
   receipt.openDiscoveryRequired=output.openDiscoveryRequired;
  }
 }catch(e){receipt.error=e.message}
 write(join(sd,'receipt.json'),receipt);
 console.log(JSON.stringify(receipt,null,2));
 if(receipt.status!=='executed')process.exitCode=1;
}
async function collectPrior(dir,stage,run){
 const prior={};
 for(const dep of dependencies(stage,run))prior[dep]=await checkStage(dir,dep,run);
 for(const dep of additionalDependencies(stage,run,prior))prior[dep]=await checkStage(dir,dep,run);
 return prior;
}
async function forkRun(dir,stage,dest,{quiet=false,vmiRetry=null}={}){
 const run=await context(dir);
 assert(run.workflow==='production','retry only for production');
 assert(stageNames.includes(stage),'unknown retry stage');
 assert(existsSync(join(dir,stage)),'retry stage must already exist');
 // Copy only the dependency closure, not unrelated or downstream receipts.
 const copied=new Set();
 async function inherit(s){
  if(copied.has(s))return;
  const item=await checkStage(dir,s,run);
  const upstream=await collectPrior(dir,s,run);
  for(const dep of Object.keys(upstream))await inherit(dep);
  assert(item.receipt.status==='executed','unverified upstream');
  copied.add(s);
 }
 const prior=await collectPrior(dir,stage,run);
 for(const dep of Object.keys(prior))await inherit(dep);
 assert(!existsSync(dest),'retry destination already exists');
 mkdirSync(dest);
 const record={...run,parentRun:{path:realpathSync(dir),retryStage:stage,inherited:[...copied],sourceSha256:run.source.sha256}};
 if(stage!=='vmi-packet')delete record.vmiRetry;
 else if(vmiRetry)record.vmiRetry=vmiRetry;
 write(join(dest,'run.json'),record);
 for(const s of copied)cpSync(join(dir,s),join(dest,s),{recursive:true,errorOnExist:true,force:false});
 for(const s of copied)await checkStage(dest,s,record);
 const result={status:'forked',runDir:dest,retryStage:stage,inherited:[...copied],invalidated:stageNames.filter(s=>existsSync(join(dir,s))&&!copied.has(s)),releaseAuthorized:false};
 if(!quiet)console.log(JSON.stringify(result,null,2));
 return result;
}
async function retryContext(dir){
 const run=await context(dir);assert(run.workflow==='production','VMI retry requires production workflow');
 const plan=await checkStage(dir,'production-plan',run),packet=await checkStage(dir,'vmi-packet',run);
 const selected=plan.output.selectedMechanisms,status=vmiRetryStatus(packet.input,packet.output,selected);
 const signature=hash(Buffer.from(status.signature));
 const history=Array.isArray(run.vmiRetry?.history)?run.vmiRetry.history.slice(-8):[];
 const repeated=history.filter(h=>h.signature===signature).length;
 return {run,packet,selected,status,signature,history,repeated};
}
async function verifiedDesign(dir){
 const run=await context(dir),stages={},fingerprints={};
 assert(run.workflow==='production','artifact review requires production workflow');
 for(const stage of stageNames)if(existsSync(join(dir,stage))){const v=await checkStage(dir,stage,run);stages[stage]=v.output;fingerprints[stage]=v.receipt.outputSha256}
 const status=productionStatus(run,stages);
 assert(status.buildEligible===true,'pre-build eligibility required');
 return {status,stages:fingerprints,sourceSha256:run.source.sha256,inventory:stages['production-plan'].specialists.inventory,revision:stages['production-plan'].revision,integration:integrationContract(stages)};
}
async function forkArtifact(dir,dest){
 const design=await verifiedDesign(dir),run=await context(dir),browser=artifactStatus(dir,design);
 let review=null;
 if(existsSync(join(dir,'artifact','critique')))review=critiqueStatus(dir,design);
 assert(!existsSync(dest),'retry destination already exists');
 const attempt=(run.artifactLineage?.attempt??0)+1;
 assert(attempt<=3,'artifact revision budget exhausted; explicit new design run required');
 mkdirSync(dest);
 const inherited=Object.keys(design.stages);
 const record={...run,artifactLineage:{parent:realpathSync(dir),attempt,signatures:[...(run.artifactLineage?.signatures??[]),...(review?.critique?.signature&&review.critique.findings.length?[review.critique.signature]:[])],previousOutputSha256:browser.outputSha256,inherited}};
 write(join(dest,'run.json'),record);
 for(const stage of inherited)cpSync(join(dir,stage),join(dest,stage),{recursive:true,errorOnExist:true,force:false});
 await verifiedDesign(dest);
 console.log(JSON.stringify({status:'artifact-forked',runDir:dest,inherited,attempt,invalidated:['artifact','browser','critique','semantic','reviewer-dispatch'],releaseAuthorized:false},null,2));
}
async function main(){
 const [cmd,...args]=process.argv.slice(2);
 if(cmd==='vmi-lint'&&(args.length===1||args.length===2)){
  const result=lintVmiPacket(json(resolve(args[0])),{apply:args.length===2});
  if(args.length===2&&result.report.status==='checked'){
   const file=resolve(args[1]);assert(/\.json$/i.test(file),'vmi-lint requires a new JSON output');
   write(file,result.packet);result.report.file=file;
  }
  console.log(JSON.stringify(result.report,null,2));if(result.report.status==='blocked')process.exitCode=1;return;
 }
 if(cmd==='vmi-author'&&args.length===2){
  const file=resolve(args[1]);assert(/\.json$/i.test(file),'vmi-author requires a new JSON output');
  const packet=constructVmiPacket(json(resolve(args[0])));
  write(file,packet);
  console.log(JSON.stringify({status:'packet-constructed',file,compiled:false,releaseAuthorized:false},null,2));return;
 }
 if(cmd==='vmi-geometry'&&args.length<=1){
  console.log(JSON.stringify(args.length?geometryTemplate(args[0]):geometryLibrary(),null,2));return;
 }
 if(['art-direction-propose','art-direction-preview','art-direction-css'].includes(cmd)){
  assert(args.length===(cmd==='art-direction-propose'?1:cmd==='art-direction-preview'?2:4),'invalid art-direction command arguments');
  const plan=compileArtDirections(json(resolve(args[0])),json(join(root,'skills/infograph-master/engine/art-directions.json')),json(join(root,'skills/infograph-master/engine/styles.json')));
  if(cmd==='art-direction-propose'){console.log(JSON.stringify(plan,null,2));return}
  if(cmd==='art-direction-preview'){
   const file=resolve(args[1]);assert(/\.html?$/i.test(file),'preview requires HTML output');
   writeFileSync(file,artDirectionPreview(plan),{flag:'wx'});console.log(JSON.stringify({status:'art-direction-preview-written',file,renderedDashboard:false,releaseAuthorized:false},null,2));return;
  }
  const file=resolve(args[3]);assert(/\.css$/i.test(file),'CSS output required');
  const selected=selectArtDirection(plan,args[1],args[2]);writeFileSync(file,artDirectionCSS(selected),{flag:'wx'});
  console.log(JSON.stringify({status:'art-direction-css-written',file,selected,releaseAuthorized:false},null,2));return;
 }
 if(cmd==='composition-preview'&&args.length===2){
  const file=resolve(args[1]);assert(/\.html?$/i.test(file),'preview requires HTML output');
  writeFileSync(file,compositionPreview(json(resolve(args[0]))),{flag:'wx'});
  console.log(JSON.stringify({status:'wireframe-preview-written',file,renderedDashboard:false,releaseAuthorized:false},null,2));return;
 }
 if(cmd==='composition-propose'&&args.length===1){
  const result=proposeCompositions(json(resolve(args[0])));console.log(JSON.stringify(result,null,2));return;
 }
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
 if(cmd==='task'&&args.length===2){
  const dir=resolve(args[0]),stage=args[1],run=await context(dir);
  assert(run.workflow==='production'&&stageNames.includes(stage),'use a production stage');
  const prior=await collectPrior(dir,stage,run);
  let previous=null;try{previous=json(join(dir,stage,'input.json'))}catch{}
  const result=authoringTask(stage,run,prior,rules(),previous);
  console.log(JSON.stringify(result,null,2));return;
 }
 if(cmd==='vmi-retry-task'&&args.length===1){
  const r=await retryContext(resolve(args[0]));
  const {signature,...status}=r.status;
  console.log(JSON.stringify({...status,signature:r.signature,previousSameFailureCount:r.repeated,advisory:r.repeated>=2?'Repeated failure: change repair strategy or revisit representation; do not blindly resubmit.':null,patchTemplate:{scenes:status.repairable.map(sliceId=>({sliceId,changes:{}}))},releaseAuthorized:false},null,2));return;
 }
 if(cmd==='retry-vmi'&&args.length===3){
  const dir=resolve(args[0]),dest=resolve(args[2]),r=await retryContext(dir);
  const plan=prepareVmiRetry(r.packet.input,r.packet.output,r.selected,json(resolve(args[1])));
  const history=[...r.history,{signature:r.signature,changed:plan.changed}].slice(-8);
  const fork=await forkRun(dir,'vmi-packet',dest,{quiet:true,vmiRetry:{history,changed:plan.changed,preserved:plan.preserved}});
  const file=join(dest,'retry-input.json');write(file,plan.packet);
  console.log(JSON.stringify({...fork,packetFile:file,changed:plan.changed,preserved:plan.preserved,remaining:plan.remaining,previousSameFailureCount:r.repeated,compiled:false,releaseAuthorized:false},null,2));return;
 }
 if(cmd==='retry'&&args.length===3){await forkRun(resolve(args[0]),args[1],resolve(args[2]));return}
 if(cmd==='integration-task'&&args.length===1){
  const design=await verifiedDesign(resolve(args[0]));
  console.log(JSON.stringify(integrationTask(design.integration),null,2));return;
 }
 if(cmd==='assemble-artifact'&&args.length===3){
  const design=await verifiedDesign(resolve(args[0])),template=read(resolve(args[1])).toString('utf8'),file=resolve(args[2]);
  assert(/\.html?$/i.test(file),'assembled output must be HTML');
  writeFileSync(file,assembleArtifact(template,design.integration),{flag:'wx'});
  console.log(JSON.stringify({...integrationTask(design.integration),status:'engine-fragments-assembled',file,releaseAuthorized:false},null,2));return;
 }
 if(cmd==='bind-artifact'&&args.length===3){
  const dir=resolve(args[0]),design=await verifiedDesign(dir);
  const r=bindArtifact(dir,args[1],args[2],design);console.log(JSON.stringify(r,null,2));return;
 }
 if(cmd==='browser-review'&&args.length===2&&args[0]==='--trusted'){
  const dir=resolve(args[1]),design=await verifiedDesign(dir),r=await browserReview(dir,design);
  console.log(JSON.stringify(r,null,2));if(r.status!=='observed-pass')process.exitCode=1;return;
 }
 if(cmd==='artifact-status'&&args.length===1){
  const dir=resolve(args[0]),design=await verifiedDesign(dir),r=artifactStatus(dir,design);
  console.log(JSON.stringify(r,null,2));if(r.status!=='browser-observed-pass')process.exitCode=1;return;
 }
 if(cmd==='semantic-task'&&args.length===1){
  const dir=resolve(args[0]);console.log(JSON.stringify(semanticTask(dir,await verifiedDesign(dir)),null,2));return;
 }
 if(cmd==='semantic-submit'&&args.length===2){
  const dir=resolve(args[0]),r=submitSemantic(dir,await verifiedDesign(dir),resolve(args[1]));console.log(JSON.stringify(r,null,2));if(r.status!=='declared-semantic-checks-pass')process.exitCode=1;return;
 }
 if(cmd==='semantic-status'&&args.length===1){
  const dir=resolve(args[0]),r=semanticStatus(dir,await verifiedDesign(dir));console.log(JSON.stringify(r,null,2));if(r.status!=='declared-semantic-checks-pass')process.exitCode=1;return;
 }
 if(cmd==='reviewer-run'&&args.length===3&&args[0]==='--trusted-adapter'){
  const dir=resolve(args[1]),r=dispatchReviewer(dir,await verifiedDesign(dir),args[2],{trusted:true});
  console.log(JSON.stringify(r,null,2));if(r.status!=='review-dispatched'||r.critique.status!=='declared-design-review-complete')process.exitCode=1;return;
 }
 if(cmd==='critique-task'&&args.length===1){
  const dir=resolve(args[0]);console.log(JSON.stringify(critiqueTask(dir,await verifiedDesign(dir)),null,2));return;
 }
 if(cmd==='critique-submit'&&args.length===2){
  const dir=resolve(args[0]),r=submitCritique(dir,await verifiedDesign(dir),resolve(args[1]));console.log(JSON.stringify(r,null,2));if(r.status!=='declared-design-review-complete')process.exitCode=1;return;
 }
 if(cmd==='critique-status'&&args.length===1){
  const dir=resolve(args[0]),r=critiqueStatus(dir,await verifiedDesign(dir));console.log(JSON.stringify(r,null,2));if(r.status!=='declared-design-review-complete')process.exitCode=1;return;
 }
 if(cmd==='retry-artifact'&&args.length===2){await forkArtifact(resolve(args[0]),resolve(args[1]));return}
 if(cmd==='delivery-check'&&(args.length===2||args.length===3)){
  const dir=resolve(args[0]),r=checkDelivery(dir,await verifiedDesign(dir),args[1],args[2]);console.log(JSON.stringify(r,null,2));if(!r.eligible)process.exitCode=1;return;
 }
 if(cmd==='prepare-handoff'&&args.length===4){
  const dir=resolve(args[0]),r=prepareHandoff(dir,await verifiedDesign(dir),args[1],args[2],args[3]);console.log(JSON.stringify(r,null,2));return;
 }
 if(cmd==='verify-handoff'&&args.length===2){
  const dir=resolve(args[0]),r=verifyHandoff(dir,await verifiedDesign(dir),args[1]);console.log(JSON.stringify(r,null,2));return;
 }
 if(cmd==='run'&&args.length===3){await runStage(resolve(args[0]),args[1],args[2]);return}
 if(cmd==='status'&&args.length===1){
  const dir=resolve(args[0]),run=await context(dir),stages={};assert(run.workflow==='production','use start-workflow');
  for(const stage of stageNames){if(!existsSync(join(dir,stage)))continue;try{stages[stage]=(await checkStage(dir,stage,run)).output}catch(e){console.log(JSON.stringify({status:'blocked',stage,error:e.message,releaseAuthorized:false},null,2));process.exitCode=1;return}}
  const result=productionStatus(run,stages);console.log(JSON.stringify(result,null,2));if(result.status==='blocked')process.exitCode=1;return;
 }
 if(cmd==='verify-vmi'&&args.length===1){
  const dir=resolve(args[0]),run=await context(dir),discovery=await checkStage(dir,'vmi-explore',run),packet=await checkStage(dir,'vmi-packet',run);
  const result={status:'replayed',stages:[discovery.receipt,packet.receipt],previewAvailable:hasVmiPreview(packet.output),openDiscoveryRequired:packet.output.openDiscoveryRequired,issues:packet.output.issues,releaseAuthorized:false,scope:'Execution replay only. Not proof of quality, final artifact integration or independent approval.'};
  console.log(JSON.stringify(result,null,2));return;
 }
 throw Error('usage: vmi-retry-task <run-dir> | retry-vmi <run-dir> <patch.json> <new-run-dir> | vmi-lint <packet.json> [new-packet.json] | vmi-author <draft.json> <new-packet.json> | integration-task <run-dir> | assemble-artifact <run-dir> <template.html> <new.html> | vmi-geometry [rotor|reservoir|valve|tank|handwheel-valve|manifold-four|dial-indicator] | art-direction-propose <input.json> | art-direction-preview <input.json> <new.html> | art-direction-css <input.json> <id> <reason> <new.css> | composition-propose <input.json> | composition-preview <input.json> <new.html> | preflight | start|start-workflow <redesign|create|critique> <source> <new-run-dir> | run <run-dir> <stage> <input.json> | status <run-dir> | task <run-dir> <stage> | retry <run-dir> <stage> <new-run-dir> | bind-artifact <run-dir> <output.html> <browser-plan.json> | browser-review --trusted <run-dir> | artifact-status <run-dir> | semantic-task <run-dir> | semantic-submit <run-dir> <input.json> | semantic-status <run-dir> | reviewer-run --trusted-adapter <run-dir> <operator-config.json> | critique-task <run-dir> | critique-submit <run-dir> <review.json> | critique-status <run-dir> | retry-artifact <run-dir> <new-run-dir> | delivery-check <run-dir> <file> [reviewed-candidate|unverified-draft] | prepare-handoff <run-dir> <file> <new-dir> <mode> | verify-handoff <run-dir> <handoff-dir> | verify-vmi <run-dir>');
}
try{await main()}catch(e){console.error(e.message);process.exitCode=1}
