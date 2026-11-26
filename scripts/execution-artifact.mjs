import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>readFileSync(p);
const json=p=>JSON.parse(read(p).toString('utf8'));
const write=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
const text=x=>typeof x==='string'&&x.trim().length>0;
const id=x=>text(x)&&/^[A-Za-z0-9_-]{1,64}$/.test(x);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function validateBrowserPlan(plan,inventory){
 ensure(plan?.version===1&&Array.isArray(plan.viewports)&&plan.viewports.length>=2&&plan.viewports.length<=6,'2–6 viewports required');
 const vp=new Set();
 for(const v of plan.viewports){ensure(id(v.id)&&!vp.has(v.id)&&Number.isInteger(v.width)&&v.width>=320&&v.width<=2560&&Number.isInteger(v.height)&&v.height>=320&&v.height<=1600,'invalid viewport');vp.add(v.id)}
 ensure(plan.viewports.some(v=>v.width>=1024)&&plan.viewports.some(v=>v.width<=480),'desktop and mobile required');
 ensure(Array.isArray(plan.cases)&&plan.cases.length>=1&&plan.cases.length*plan.viewports.length<=100,'invalid browser case count (max 100 captures)');
 const ids=new Set(),coverage=new Set(),expected=new Set(inventory.map(s=>s.id));
 for(const c of plan.cases){
  ensure(id(c.id)&&!ids.has(c.id)&&expected.has(c.sliceId)&&['baseline','interaction'].includes(c.kind),'invalid case identity');
  ids.add(c.id);if(c.kind==='baseline')coverage.add(c.sliceId);
  ensure(Array.isArray(c.steps)&&c.steps.length<=10&&(c.kind!=='interaction'||c.steps.length>0),'invalid actions');
  for(const a of c.steps)ensure(['click','select','fill'].includes(a.action)&&text(a.selector)&&(a.action==='click'||typeof a.value==='string'),'invalid action');
  ensure(Array.isArray(c.checks)&&c.checks.length>0&&c.checks.length<=40,'essential checks required');
  for(const k of c.checks)ensure(text(k.selector)&&(k.textIncludes===undefined||text(k.textIncludes)),'invalid essential check');
  ensure(c.kind!=='interaction'||c.checks.some(k=>text(k.textIncludes)),'interaction needs a textual outcome assertion');
 }
 ensure([...expected].every(s=>coverage.has(s)),'each inventory slice needs a baseline case');
 return plan;
}
export function bindArtifact(dir,file,planFile,design){
 ensure(design.status.buildEligible===true,'pre-build eligibility required');
 const bytes=read(resolve(file)),planBytes=read(resolve(planFile)),plan=JSON.parse(planBytes.toString('utf8'));
 ensure(bytes.length>0&&bytes.length<=8*1024*1024,'HTML size limit');
 ensure(/\.html?$/i.test(file),'standalone HTML required');
 validateBrowserPlan(plan,design.inventory);
 const folder=join(dir,'artifact');mkdirSync(folder);
 const receipt={version:1,sourceSha256:design.sourceSha256,designStages:design.stages,outputPath:resolve(file),outputSha256:hash(bytes),planSha256:hash(planBytes),inventory:design.inventory,releaseAuthorized:false};
 writeFileSync(join(folder,'output.html'),bytes,{flag:'wx'});writeFileSync(join(folder,'plan.json'),planBytes,{flag:'wx'});write(join(folder,'receipt.json'),receipt);
 return {status:'artifact-bound',...receipt};
}
export function verifyBinding(dir,design){
 const folder=join(dir,'artifact'),r=json(join(folder,'receipt.json'));
 ensure(design.status.buildEligible===true&&r.sourceSha256===design.sourceSha256&&eq(r.designStages,design.stages)&&eq(r.inventory,design.inventory),'design evidence mismatch');
 ensure(hash(read(join(folder,'output.html')))===r.outputSha256&&hash(read(r.outputPath))===r.outputSha256,'artifact bytes changed');
 const planBytes=read(join(folder,'plan.json'));ensure(hash(planBytes)===r.planSha256,'browser plan changed');
 const plan=validateBrowserPlan(JSON.parse(planBytes.toString('utf8')),design.inventory);
 return {folder,receipt:r,plan};
}
export async function browserReview(dir,design){
 const {folder,receipt,plan}=verifyBinding(dir,design);
 const qa=join(folder,'browser');mkdirSync(qa);
 let report;
 try{
  const {auditProductionHTML}=await import('../skills/infograph-master/engine/production-browser-audit.mjs');
  report=await auditProductionHTML(join(folder,'output.html'),plan,qa,{trusted:true});
 }catch(e){report={version:1,status:'blocked',reason:String(e.message??e),cases:[],scope:'browser not completed'}}
 const output={...report,outputSha256:receipt.outputSha256,planSha256:receipt.planSha256,releaseAuthorized:false};
 write(join(qa,'report.json'),output);
 write(join(qa,'receipt.json'),{version:1,reportSha256:hash(read(join(qa,'report.json'))),outputSha256:receipt.outputSha256,planSha256:receipt.planSha256,releaseAuthorized:false});
 return output;
}
export function artifactStatus(dir,design){
 const {folder,receipt,plan}=verifyBinding(dir,design),qa=join(folder,'browser');
 const result={outputSha256:receipt.outputSha256,releaseAuthorized:false,deliveryEligible:false,scope:'local evidence integrity only, not signed attestation or visual approval'};
 if(!existsSync(qa))return {...result,status:'browser-pending'};
 const qr=json(join(qa,'receipt.json')),bytes=read(join(qa,'report.json')),report=JSON.parse(bytes.toString('utf8'));
 ensure(qr.reportSha256===hash(bytes)&&qr.outputSha256===receipt.outputSha256&&qr.planSha256===receipt.planSha256&&report.outputSha256===receipt.outputSha256&&report.planSha256===receipt.planSha256,'browser evidence mismatch');
 if(report.status==='blocked')return {...result,status:'browser-blocked',reason:report.reason};
 const expected=new Set(plan.viewports.flatMap(v=>plan.cases.map(c=>v.id+'--'+c.id))),seen=new Set();
 for(const c of report.cases){
  const key=c.viewportId+'--'+c.caseId;ensure(expected.has(key)&&!seen.has(key),'unknown or duplicate browser case');seen.add(key);
  if(c.capture){ensure(c.capture.filename===key+'.png'&&hash(read(join(qa,c.capture.filename)))===c.capture.sha256,'screenshot bytes changed')}
  else ensure(c.status!=='pass','passing case lacks screenshot');
 }
 ensure(seen.size===expected.size,'incomplete browser matrix');
 const passed=report.cases.every(c=>c.status==='pass');
 return {...result,status:passed?'browser-observed-pass':'browser-observed-fail',cases:report.cases.length,failures:report.cases.filter(c=>c.status!=='pass').map(c=>({caseId:c.caseId,viewportId:c.viewportId,issues:c.issues})),reportSha256:qr.reportSha256};
}
