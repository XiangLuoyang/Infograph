import {readFileSync} from 'node:fs';
import {auditReconstruction} from './reconstruction.mjs';
function testCases(audit,fixture){
 const clone=x=>JSON.parse(JSON.stringify(x)), assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 let n=0;const check=(ok,msg)=>{assert(ok,msg);n++};
 check(audit(fixture).planEligible,"fixture valid");check(!audit(fixture).reviewComplete,"no fake review");
 const variants=[
  ["missing data mapping",p=>p.preservation.shift()],
  ["lost essential interaction",p=>p.preservation.find(x=>x.assetId==="a5").action="remove"],
  ["locked data changed",p=>p.preservation[0].action="replace-equivalent"],
  ["unknown blocking intent",p=>{p.intents[0].status="unknown";p.intents[0].blocking=true}],
  ["missing inference validation",p=>delete p.intents[0].validation],
  ["only polish diagnosed",p=>p.findings=p.findings.filter(x=>x.level<3)],
  ["missing reset options",p=>p.options.pop()],
  ["cosmetic default despite high defect",p=>p.selected="refine"],
  ["out of scope",p=>p.scope="refine"],
  ["untraced route",p=>p.routes[0].intentIds=["absent"]],
  ["missing coverage",p=>p.coverage.pop()],
  ["limited evidence hidden",p=>p.inspection="source-only"]
 ];
 for(const [name,mutate] of variants){const p=clone(fixture);mutate(p);check(!audit(p).planEligible,name)}
 const p=clone(fixture);p.review=[...p.assets.filter(a=>a.essential||a.locked).map(a=>"asset:"+a.id),...p.tasks.map(t=>"task:"+t.id),"render","data-parity","interaction-parity"].map(key=>({key,status:"pass",ref:"synthetic test record only"}));
 check(audit(p).reviewComplete,"complete declared records");p.review[0].status="not-run";check(!audit(p).reviewComplete,"not run not pass");return n;
}
const f=JSON.parse(readFileSync(new URL('./reconstruction.example.json',import.meta.url),'utf8'));
console.log('reconstruction assertions:',testCases(auditReconstruction,f));
