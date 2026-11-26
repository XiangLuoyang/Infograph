import {readFileSync} from 'node:fs';
import {auditSystemPlan,auditSystemProgress} from './system-refactor.mjs';
function test(auditPlan,auditProgress,p,l){
 let n=0;const ok=(v,m)=>{if(!v)throw Error(m);n++};const clone=x=>JSON.parse(JSON.stringify(x));
 ok(auditPlan(p).eligible,"valid full plan");
 ok(auditPlan(p).counts.slices===12,"all twelve");
 const bad=f=>{const x=clone(p);f(x);return !auditPlan(x).eligible};
 ok(bad(x=>x.decisions.pop()),"omitted slice");
 ok(bad(x=>x.atlas.slices.pop()),"omitted discovered slice");
 ok(bad(x=>x.targetSliceIds.pop()),"misrepresented full scope");
 ok(bad(x=>x.contract.roles[0].target="new color"),"inherit drift");
 ok(bad(x=>{x.contract.strategy="evolve";x.contract.roles[0].target="new color"}),"retained slice missed migration");
 ok(bad(x=>x.decisions[0].contractRevision="old"),"stale contract");
 ok(bad(x=>x.atlas.slices[0].executionDeps=[x.atlas.slices[1].id]),"dependency cycle");
 const r=auditProgress(p,l);ok(!r.scopeComplete&&r.ready.length===3&&r.counts.unfinished===6,"batch readiness");
 const done=clone(l);done.records=done.records.map(x=>x.status==="pending"?{...x,status:"implemented",outputRef:"fixture:batch"}:x);done.integration={outputRef:"fixture:integrated",contractRevision:p.contract.revision,reviews:[...p.atlas.pages.map(x=>"page:"+x.id),...p.atlas.slices.map(x=>"slice:"+x.id),...p.atlas.shared.map(x=>"shared:"+x.id),"global-navigation","global-coherence","global-data-parity"].map(key=>({key,status:"pass",ref:"fixture:synthetic declaration",outputRef:"fixture:integrated"})),styleObservations:p.decisions.flatMap(d=>d.roleIds.map(roleId=>({sliceId:d.sliceId,roleId,status:"observed",value:p.contract.roles.find(r=>r.id===roleId).target,ref:"fixture:synthetic declaration",outputRef:"fixture:integrated"})))};
 ok(auditProgress(p,done).fullDashboardComplete,"all declared checks");
 const drift=clone(done);drift.integration.styleObservations[0].value="other";ok(!auditProgress(p,drift).scopeComplete,"local style mismatch");
 const stale=clone(done);stale.integration.reviews[0].outputRef="old";ok(!auditProgress(p,stale).scopeComplete,"stale page QA");
 const partial=clone(p);partial.atlas.coverage="partial";ok(!auditProgress(partial,done).fullDashboardComplete,"partial coverage");
 const target=clone(p);target.scope="targeted";target.scopeReason="user requested one slice";target.targetSliceIds=[target.decisions[0].sliceId];target.decisions=target.decisions.map((d,i)=>i?{...d,action:"out-of-scope"}:d);const tl=clone(done);tl.records=tl.records.map((r,i)=>i?{...r,status:"out-of-scope"}:r);ok(auditProgress(target,tl).scopeComplete&&!auditProgress(target,tl).fullDashboardComplete,"targeted not full");
 return n;
}
const {plan,ledger}=JSON.parse(readFileSync(new URL('./system-refactor.example.json',import.meta.url),'utf8'));console.log('system refactor assertions:',test(auditSystemPlan,auditSystemProgress,plan,ledger));
