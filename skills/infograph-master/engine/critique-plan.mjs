export function critiquePlan({revision,attempt=0,maxRevisions=3,reviews=[],previous=[]},rubric){
 if(!Number.isInteger(revision)||revision<0||!Number.isInteger(attempt)||attempt<0||!Number.isInteger(maxRevisions)||maxRevisions<0||maxRevisions>10)throw Error('invalid revision budget');
 const allowed=new Map(rubric.dimensions.flatMap(d=>d.checks.map(c=>[d.id+':'+c,d.id]))),seen=new Set(),findings=[],unknown=[];
 for(const r of reviews){const key=r.dimension+':'+r.check;if(!allowed.has(key)||seen.has(key)||!['pass','fail','not-run','not-applicable'].includes(r.status))throw Error('invalid review');seen.add(key);
 if(r.revision!==revision||typeof r.ref!=='string'||!r.ref.trim()||r.status==='not-run'){unknown.push(key);continue}
 if(r.status==='not-applicable'){if(typeof r.rationale!=='string'||!r.rationale.trim()||r.dimension==='evidence')unknown.push(key);continue}
 if(r.status==='fail'){if(!rubric.severity.includes(r.severity)||typeof r.issue!=='string'||!r.issue.trim()||typeof r.repair!=='string'||!r.repair.trim())throw Error('invalid finding');findings.push({key,severity:r.severity,issue:r.issue,repair:r.repair,ref:r.ref})}}
 for(const k of allowed.keys())if(!seen.has(k))unknown.push(k);
 findings.sort((a,b)=>rubric.severity.indexOf(a.severity)-rubric.severity.indexOf(b.severity)||a.key.localeCompare(b.key));
 const signature=JSON.stringify(findings.map(f=>[f.key,f.severity]));const repeated=findings.length>0&&previous.includes(signature);
 const status=!findings.length&&!unknown.length?'declared-review-complete':attempt>=maxRevisions?'budget-exhausted':repeated?'no-progress':findings.length?'repair-required':'review-incomplete';
 return {revision,attempt,status,findings,unknown,signature,next:status==='repair-required'?findings[0]:null,releaseAuthorized:false,scope:'declared critique only; inspect actual evidence and artifacts'};
}
