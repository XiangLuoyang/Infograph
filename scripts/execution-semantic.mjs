import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {verifyBinding} from './execution-artifact.mjs';
import {auditBusinessSemantics} from '../skills/infograph-master/engine/business-semantic-qa.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
const read=p=>readFileSync(p);
const json=p=>JSON.parse(read(p).toString('utf8'));
const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
function evaluate(packet,receipt,design){
 ensure(packet.outputSha256===receipt.outputSha256&&packet.sourceSha256===receipt.sourceSha256&&packet.revision===design.revision,'semantic artifact/source/revision binding mismatch');
 return {...auditBusinessSemantics(packet),outputSha256:receipt.outputSha256,sourceSha256:receipt.sourceSha256};
}
export function semanticTask(dir,design){
 const {receipt}=verifyBinding(dir,design);
 return {assignment:'Inventory material metric, expression and mechanism claims across all slices. Extract independent source values and actual rendered observations; do not copy expected values into observed values. Use references/business-semantic-qa.md. Missing evidence stays not-run.',inventory:receipt.inventory,template:{version:1,revision:design.revision,outputSha256:receipt.outputSha256,sourceSha256:receipt.sourceSha256,coverage:['calculation','expression','mechanism'].map(category=>({category,status:'not-run',reason:'',ref:''})),checks:[]}};
}
export function submitSemantic(dir,design,file){
 const {receipt,folder}=verifyBinding(dir,design),input=read(file),result=evaluate(JSON.parse(input.toString('utf8')),receipt,design),output=encode(result);
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
 ensure(hash(encode(evaluate(JSON.parse(input.toString('utf8')),receipt,design)))===r.outputSha256,'semantic replay mismatch');
 return {...JSON.parse(output.toString('utf8')),reportSha256:r.outputSha256};
}
