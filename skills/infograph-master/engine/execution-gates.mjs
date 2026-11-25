export function auditExecution({revision,purpose,substantial=false,records=[]},rules){
 if(!Number.isInteger(revision)||revision<0||!['report','decision','monitor','explore','explain'].includes(purpose)||typeof substantial!=='boolean'||!Array.isArray(records))throw Error('invalid execution context');
 const seen=new Set();for(const r of records){if(typeof r.key!=='string'||!r.key.trim()||seen.has(r.key)||!['pass','fail','not-run'].includes(r.status)||!Number.isInteger(r.revision)||r.revision<0)throw Error('invalid record');seen.add(r.key)}
 const applicable=a=>a==='all'||a==='authored'&&['report','decision'].includes(purpose)||a==='monitor'&&purpose==='monitor'||a==='substantial'&&substantial;
 const gates=rules.filter(g=>applicable(g.applies)).map(g=>{const checks=g.requires.map(key=>{const r=records.find(x=>x.key===key);const status=!r?'missing':r.revision!==revision?'stale':r.status==='pass'&&(typeof r.ref!=='string'||!r.ref.trim())?'missing-reference':r.status;return {key,status,ref:r?.ref??null}});return {id:g.id,stage:g.stage,checks,status:checks.every(c=>c.status==='pass')?'declared-pass':'blocked'}});
 const pre=gates.filter(g=>!['build','review'].includes(g.stage)),blockers=gates.filter(g=>g.status==='blocked');
 return {revision,gates,blockers:blockers.map(g=>g.id),buildEligible:pre.every(g=>g.status==='declared-pass'),reviewComplete:blockers.length===0,releaseAuthorized:false,scope:'declared records only; references and claims not independently verified'};
}
