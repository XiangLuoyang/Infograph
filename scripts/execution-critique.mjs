import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {critiquePlan} from '../skills/infograph-master/engine/critique-plan.mjs';
import {artifactStatus,verifyBinding} from './execution-artifact.mjs';
const rubric=JSON.parse(readFileSync(new URL('../skills/infograph-master/references/critique-rubric.json',import.meta.url),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>readFileSync(p);
const json=p=>JSON.parse(read(p).toString('utf8'));
const encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
const text=x=>typeof x==='string'&&x.trim().length>0;
const write=(p,v)=>writeFileSync(p,encode(v),{flag:'wx'});
const route=key=>key.startsWith('evidence:')?'reconstruction or production-plan':key.startsWith('narrative:')?'specialist-plan / narrative':key.startsWith('representation:')?'production-plan / VMI':key.startsWith('visual:')?'specialist-plan / artifact':key.startsWith('interaction:')?'specialist-plan / artifact':'artifact';
function context(dir,design){
 const browser=artifactStatus(dir,design),{folder,receipt}=verifyBinding(dir,design);
 ensure(['browser-observed-pass','browser-observed-fail'].includes(browser.status),'completed browser matrix required');
 const report=json(join(folder,'browser','report.json')),run=json(join(dir,'run.json'));
 const captures=report.cases.filter(c=>c.capture).map(c=>({id:c.viewportId+'--'+c.caseId,sliceId:c.sliceId,sha256:c.capture.sha256,path:'artifact/browser/'+c.capture.filename,status:c.status}));
 return {folder,browser,receipt,report,captures,revision:design.revision,attempt:run.artifactLineage?.attempt??0,previous:run.artifactLineage?.signatures??[]};
}
export function critiqueTask(dir,design){
 const c=context(dir,design);
 return {assignment:'Open every screenshot, inspect real HTML and business evidence. Record specific observations, not generic pass claims. Browser checks do not establish aesthetics or semantic correctness.',
 captures:c.captures,reportPath:'artifact/browser/report.json',browserStatus:c.browser.status,
 template:{outputSha256:c.receipt.outputSha256,reportSha256:c.browser.reportSha256,revision:c.revision,reviewer:'',reviewerKind:null,captureReviews:c.captures.map(x=>({id:x.id,sha256:x.sha256,observation:''})),reviews:rubric.dimensions.flatMap(d=>d.checks.map(check=>({dimension:d.id,check,revision:c.revision,status:'not-run',ref:'',observation:'',captureIds:[]})))},
 scope:'authored critique, not automated aesthetic judgment or verified independent approval'};
}
function verifyAdapterEvidence(input,c){
 const a=input.adapterEvidence;
 if(a===undefined)return null;
 ensure(a&&typeof a.attemptId==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(a.attemptId),'invalid adapter attempt');
 const folder=join(c.folder,'reviewer-dispatch',a.attemptId);
 const requestBytes=read(join(folder,'request.json')),responseBytes=read(join(folder,'response.json')),receipt=json(join(folder,'receipt.json'));
 ensure(receipt.status==='response-received'&&receipt.requestSha256===a.requestSha256&&receipt.responseSha256===a.responseSha256&&hash(requestBytes)===a.requestSha256&&hash(responseBytes)===a.responseSha256,'adapter evidence changed');
 const request=JSON.parse(requestBytes.toString('utf8')),response=JSON.parse(responseBytes.toString('utf8')),t=request.task.template;
 ensure(request.version===1&&request.attemptId===a.attemptId&&response.version===1&&response.requestSha256===a.requestSha256,'adapter request binding mismatch');
 ensure(t.outputSha256===c.receipt.outputSha256&&t.reportSha256===c.browser.reportSha256&&t.revision===c.revision&&JSON.stringify(request.task.captures)===JSON.stringify(c.captures),'adapter task binding mismatch');
 ensure(request.reviewer.id===input.reviewer&&input.reviewerKind==='independent-model'&&request.reviewer.producerId!==input.reviewer&&text(request.reviewer.independenceRef)&&text(request.reviewer.authorizationRef),'adapter reviewer declaration mismatch');
 const {adapterEvidence,...review}=input;
 ensure(JSON.stringify(response.review)===JSON.stringify(review),'adapter review differs from received response');
 return {...a,independenceDeclared:true,identityAuthenticated:false};
}
function evaluate(input,c){
 ensure(input.outputSha256===c.receipt.outputSha256&&input.reportSha256===c.browser.reportSha256&&input.revision===c.revision,'critique binding mismatch');
 ensure(text(input.reviewer)&&['agent-self','independent-human','independent-model'].includes(input.reviewerKind),'reviewer disposition required');
 ensure(Array.isArray(input.captureReviews)&&Array.isArray(input.reviews),'review arrays required');
 const adapterEvidence=verifyAdapterEvidence(input,c);
 const captures=new Map(c.captures.map(x=>[x.id,x])),seen=new Set();
 for(const r of input.captureReviews){ensure(captures.has(r.id)&&!seen.has(r.id)&&r.sha256===captures.get(r.id).sha256&&text(r.observation),'invalid capture observation');seen.add(r.id)}
 const missingCaptures=c.captures.filter(x=>!seen.has(x.id)).map(x=>x.id);
 for(const r of input.reviews){
  if(r.status==='not-run')continue;
  ensure(text(r.observation)&&Array.isArray(r.captureIds)&&new Set(r.captureIds).size===r.captureIds.length&&r.captureIds.every(id=>seen.has(id)),'review needs specific observation and valid screenshot references');
  if(['visual','interaction'].includes(r.dimension)&&r.status!=='not-applicable')ensure(r.captureIds.length>0,'visual/interaction review needs actual capture reference');
  if(r.status==='not-applicable')ensure(!['evidence','visual','engineering'].includes(r.dimension),'core dimensions cannot be waived');
 }
 const review=critiquePlan({revision:c.revision,attempt:c.attempt,maxRevisions:rubric.policy.maxRevisions,reviews:input.reviews,previous:c.previous},rubric);
 const browserPass=c.browser.status==='browser-observed-pass';
 const complete=browserPass&&missingCaptures.length===0&&review.status==='declared-review-complete';
 return {outputSha256:input.outputSha256,reportSha256:input.reportSha256,reviewer:input.reviewer,reviewerKind:input.reviewerKind,adapterEvidence,attempt:c.attempt,browserStatus:c.browser.status,missingCaptures,critique:review,repairRoutes:review.findings.map(f=>({key:f.key,target:route(f.key),repair:f.repair})),status:complete?'declared-design-review-complete':!browserPass?'browser-repair-required':missingCaptures.length?'capture-review-incomplete':review.status,deliveryEligible:false,releaseAuthorized:false,scope:'review declarations bound to observed captures and actual bytes; no independently verified reviewer identity, factual parity or aesthetic certification'};
}
export function submitCritique(dir,design,inputFile){
 const c=context(dir,design),input=read(inputFile),result=evaluate(JSON.parse(input.toString('utf8')),c),folder=join(c.folder,'critique');
 mkdirSync(folder);writeFileSync(join(folder,'input.json'),input,{flag:'wx'});write(join(folder,'output.json'),result);
 write(join(folder,'receipt.json'),{inputSha256:hash(input),outputSha256:hash(read(join(folder,'output.json'))),releaseAuthorized:false});
 return result;
}
export function critiqueStatus(dir,design){
 const c=context(dir,design),folder=join(c.folder,'critique');
 if(!existsSync(folder))return {status:'critique-pending',browserStatus:c.browser.status,deliveryEligible:false,releaseAuthorized:false};
 const r=json(join(folder,'receipt.json')),input=read(join(folder,'input.json')),output=read(join(folder,'output.json'));
 ensure(r.inputSha256===hash(input)&&r.outputSha256===hash(output),'critique bytes changed');
 ensure(hash(encode(evaluate(JSON.parse(input.toString('utf8')),c)))===r.outputSha256,'critique replay mismatch');
 return JSON.parse(output.toString('utf8'));
}
