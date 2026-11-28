import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {verifyBinding,artifactStatus} from './execution-artifact.mjs';
import {auditBusinessSemantics} from '../skills/infograph-master/engine/business-semantic-qa.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
const read=p=>readFileSync(p);
const json=p=>JSON.parse(read(p).toString('utf8'));
const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
function probeEvidence(dir,design,folder){
 const browser=artifactStatus(dir,design);
 if(browser.status!=='browser-observed-pass'&&browser.status!=='browser-observed-fail')return [];
 const report=json(join(folder,'browser','report.json'));
 return report.cases.flatMap(c=>(c.semanticProbes??[]).map(p=>({viewportId:c.viewportId,caseId:c.caseId,sliceId:c.sliceId,probeId:p.result.id,browserStatus:c.status,reportSha256:browser.reportSha256,...p.result})));
}
function evaluate(packet,receipt,design,dir,folder){
 ensure(packet.outputSha256===receipt.outputSha256&&packet.sourceSha256===receipt.sourceSha256&&packet.revision===design.revision,'semantic artifact/source/revision binding mismatch');
 ensure(Array.isArray(packet.checks),'semantic checks required');
 const linked=packet.checks.some(c=>c.observationProbe!==undefined);
 const records=linked?probeEvidence(dir,design,folder):[];
 const bindings=[];
 const checks=packet.checks.map(c=>{
  if(c.observationProbe===undefined)return c;
  const key=c.observationProbe;
  ensure(key&&typeof key==='object'&&typeof key.reportSha256==='string','invalid observation probe reference');
  const observed=records.find(r=>r.viewportId===key.viewportId&&r.caseId===key.caseId&&r.probeId===key.probeId&&r.reportSha256===key.reportSha256);
  ensure(observed&&observed.status==='pass'&&observed.browserStatus==='pass','referenced runtime probe is missing or failed');
  ensure((c.kind==='value-parity'&&observed.kind==='number')||(c.kind==='count-parity'&&observed.kind==='count')||(c.kind==='period-growth'&&['number','missing'].includes(observed.kind)),'runtime probe incompatible with check');
  if(c.kind!=='period-growth')ensure(c.unit===observed.unit&&c.expectedValue===observed.expected,'runtime probe source expectation mismatch');
  ensure(c.sourceRef===observed.sourceRef,'runtime probe source reference mismatch');
  ensure(c.observedValue===undefined||c.observedValue===observed.observed,'authored value conflicts with runtime observation');
  const observationRef='browser:'+key.reportSha256+':'+key.viewportId+'--'+key.caseId+'#'+key.probeId;
  bindings.push({checkId:c.id,...key,observationRef});
  return {...c,observedValue:observed.observed,observationRef};
 });
 return {...auditBusinessSemantics({...packet,checks}),outputSha256:receipt.outputSha256,sourceSha256:receipt.sourceSha256,runtimeBindings:bindings};
}
export function semanticTask(dir,design){
 const {receipt,folder}=verifyBinding(dir,design);
 return {assignment:'Inventory material metric, expression and mechanism claims across all slices. Extract independent source values; use runtime probe references for observed values where available. Do not copy expected values into observed values. Missing evidence stays not-run. See references/business-semantic-qa.md.',...(design.fallbacks?.length?{fallbacks:design.fallbacks,fallbackReviewInstruction:'Verify actual source claims and evidence preservation in each replacement. Record missing or contradictory claims as failures; authored fallback is not semantic proof.'}:{}),inventory:receipt.inventory,runtimeProbes:probeEvidence(dir,design,folder),template:{version:1,revision:design.revision,outputSha256:receipt.outputSha256,sourceSha256:receipt.sourceSha256,coverage:['calculation','expression','mechanism'].map(category=>({category,status:'not-run',reason:'',ref:''})),checks:[]}};
}
export function submitSemantic(dir,design,file){
 const {receipt,folder}=verifyBinding(dir,design),input=read(file),result=evaluate(JSON.parse(input.toString('utf8')),receipt,design,dir,folder),output=encode(result);
 const target=join(folder,'semantic');mkdirSync(target);
 writeFileSync(join(target,'input.json'),input,{flag:'wx'});writeFileSync(join(target,'output.json'),output,{flag:'wx'});
 writeFileSync(join(target,'receipt.json'),encode({inputSha256:hash(input),outputSha256:hash(output),releaseAuthorized:false}),{flag:'wx'});
 return result;
}
export function semanticStatus(dir,design){
 const {receipt,folder}=verifyBinding(dir,design),target=join(folder,'semantic');
 if(!existsSync(target))return {status:'semantic-pending',outputSha256:receipt.outputSha256,releaseAuthorized:false};
 const input=read(join(target,'input.json')),output=read(join(target,'output.json')),r=json(join(target,'receipt.json'));
 ensure(r.inputSha256===hash(input)&&r.outputSha256===hash(output),'semantic receipt bytes changed');
 ensure(hash(encode(evaluate(JSON.parse(input.toString('utf8')),receipt,design,dir,folder)))===r.outputSha256,'semantic replay mismatch');
 return {...JSON.parse(output.toString('utf8')),reportSha256:r.outputSha256};
}
