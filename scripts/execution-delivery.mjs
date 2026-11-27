// Local handoff guard. Host must own the invocation and actual sending tool.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {artifactStatus,verifyBinding} from './execution-artifact.mjs';
import {critiqueStatus} from './execution-critique.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>readFileSync(p);
const json=p=>JSON.parse(read(p).toString('utf8'));
const write=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
export function deliveryDecision(browser,review,mode){
 ensure(['reviewed-candidate','unverified-draft'].includes(mode),'invalid handoff mode');
 const independent=['independent-human','independent-model'].includes(review?.reviewerKind);
 const complete=review?.status==='declared-design-review-complete';
 const knownFindings=review?.critique?.findings;
 // Only absent review or a verified, finding-free review may enter the draft lane.
 // Unknown/malformed states and any observed failure remain fail-closed.
 const noFindings=Array.isArray(knownFindings)&&knownFindings.length===0;
 const pending=review==null||review.status==='critique-pending';
 const incomplete=['review-incomplete','capture-review-incomplete','budget-exhausted'].includes(review?.status)&&noFindings;
 const selfComplete=complete&&review?.reviewerKind==='agent-self'&&noFindings;
 if(browser.status==='browser-observed-pass'&&complete&&independent&&noFindings&&mode==='reviewed-candidate'){
  return {eligible:true,classification:'reviewed-candidate',label:'Browser-observed and declared independent critique complete; reviewer identity and independent acceptance not authenticated.'};
 }
 if(mode==='unverified-draft'&&browser.status==='browser-blocked'&&review==null){
  return {eligible:true,classification:'unverified-draft',label:'UNVERIFIED DRAFT — browser blocked; visual and runtime QA not completed. Not a reviewed candidate.'};
 }
 if(mode==='unverified-draft'&&browser.status==='browser-observed-pass'&&(pending||incomplete||selfComplete)){
  return {eligible:true,classification:'unverified-draft',label:'UNVERIFIED DRAFT — browser checks passed; independent design review missing or incomplete. No design acceptance; not a reviewed candidate.'};
 }
 return {eligible:false,classification:'blocked',label:'Handoff blocked: required evidence missing, failed or incompatible with requested mode.'};
}
export function checkDelivery(dir,design,file,mode='reviewed-candidate'){
 const {receipt,folder}=verifyBinding(dir,design);
 const bytes=read(resolve(file));
 ensure(hash(bytes)===receipt.outputSha256,'requested delivery bytes differ from reviewed artifact');
 const browser=artifactStatus(dir,design);
 let review=null;
 if(existsSync(join(folder,'critique')))review=critiqueStatus(dir,design);
 const decision=deliveryDecision(browser,review,mode);
 return {version:1,...decision,mode,outputSha256:receipt.outputSha256,sourceSha256:receipt.sourceSha256,planSha256:receipt.planSha256,designStages:receipt.designStages,browserStatus:browser.status,browserReportSha256:browser.reportSha256??null,browserBlocker:browser.reason??null,critiqueStatus:review?.status??'not-run',reviewerKind:review?.reviewerKind??null,critiqueSha256:review?hash(read(join(folder,'critique','output.json'))):null,releaseAuthorized:false,independentAcceptanceVerified:false,scope:'local evidence guard; no signing, sandbox, host enforcement or authorization to send'};
}
export function prepareHandoff(dir,design,file,dest,mode){
 const result=checkDelivery(dir,design,file,mode);
 ensure(result.eligible,result.label);
 const bytes=read(resolve(file));
 ensure(hash(bytes)===result.outputSha256,'artifact changed during handoff');
 const target=resolve(dest);
 mkdirSync(target);
 const filename=mode==='unverified-draft'?'UNVERIFIED-DRAFT.html':'reviewed-candidate.html';
 writeFileSync(join(target,filename),bytes,{flag:'wx'});
 const manifest={...result,filename};
 write(join(target,'handoff.json'),manifest);
 return {...manifest,directory:target};
}
export function verifyHandoff(dir,design,handoffDir){
 const p=resolve(handoffDir),manifest=json(join(p,'handoff.json'));
 const expected=manifest.mode==='unverified-draft'?'UNVERIFIED-DRAFT.html':'reviewed-candidate.html';
 ensure(manifest.filename===expected,'invalid handoff filename');
 const file=join(p,expected),current=checkDelivery(dir,design,file,manifest.mode);
 ensure(current.eligible,'handoff no longer eligible');
 ensure(JSON.stringify(manifest)===JSON.stringify({...current,filename:expected}),'handoff manifest mismatch');
 return {...current,filename:expected,directory:p};
}
