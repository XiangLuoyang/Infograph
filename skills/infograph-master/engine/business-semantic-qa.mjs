// Deterministic semantic checks on authored evidence. No source execution or extraction.
export function auditBusinessSemantics(packet){
 const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
 const text=x=>typeof x==='string'&&x.trim().length>0;
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const categories=['calculation','expression','mechanism'];
 const kinds={'period-growth':'calculation','budget-cap':'calculation','value-parity':'expression','count-parity':'expression','relation-fidelity':'mechanism'};
 ensure(packet?.version===1&&Number.isInteger(packet.revision)&&packet.revision>=1,'invalid semantic packet');
 ensure(Array.isArray(packet.coverage)&&packet.coverage.length===3&&categories.every(c=>packet.coverage.filter(x=>x.category===c).length===1),'exact category coverage required');
 ensure(Array.isArray(packet.checks)&&packet.checks.length<=200,'invalid checks');
 const ids=new Set(),results=[];
 const month=s=>{ensure(typeof s==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(s),'invalid month');return Number(s.slice(0,4))*12+Number(s.slice(5))-1};
 const tolerance=x=>{const t=x??0;ensure(finite(t)&&t>=0,'invalid tolerance');return t};
 for(const c of packet.checks){
  ensure(text(c.id)&&!ids.has(c.id)&&Object.hasOwn(kinds,c.kind)&&text(c.claim)&&text(c.sourceRef)&&text(c.observationRef),'invalid semantic check identity/evidence');
  ids.add(c.id);
  const category=kinds[c.kind];let status='pass',expected=null,observed=null,reason='';
  const fail=why=>{status='fail';reason=why};
  if(c.kind==='period-growth'){
   const {mode,current,baseline,observedValue}=c;
   ensure(['yoy','previous-period'].includes(mode)&&Array.isArray(current)&&current.length>0&&current.length<=24&&Array.isArray(baseline)&&baseline.length<=24,'invalid growth periods');
   const readPeriod=arr=>arr.map((r,i)=>{const m=month(r.month);ensure(i===0||m===month(arr[i-1].month)+1,'period must be contiguous and ordered');ensure(r.value===null||finite(r.value),'period value must be numeric or null');return m});
   const cm=readPeriod(current),bm=readPeriod(baseline),shift=mode==='yoy'?12:current.length;
   ensure(observedValue===null||finite(observedValue),'growth observation must be numeric or null');
   observed=observedValue;
   const aligned=bm.length===cm.length&&cm.every((m,i)=>bm[i]===m-shift);
   const available=aligned&&[...current,...baseline].every(x=>finite(x.value));
   const sum=a=>a.reduce((n,r)=>n+r.value,0);
   if(available){const b=sum(baseline);if(b!==0)expected=sum(current)/b-1}
   if(bm.length&&!aligned)fail('baseline does not match declared comparison window');
   else if(expected===null&&observed!==null)fail('missing or zero baseline must not be presented as numeric growth');
   else if(expected!==null&&(observed===null||Math.abs(expected-observed)>tolerance(c.tolerance)))fail('growth differs from independent calculation');
  }else if(c.kind==='budget-cap'){
   ensure(finite(c.budget)&&c.budget>=0&&Array.isArray(c.commitments)&&c.commitments.length>0&&c.commitments.every(x=>text(x.id)&&finite(x.cost)&&x.cost>=0)&&new Set(c.commitments.map(x=>x.id)).size===c.commitments.length,'invalid resource commitments');
   expected=c.budget;observed=c.commitments.reduce((n,x)=>n+x.cost,0);
   if(observed>expected+tolerance(c.tolerance))fail('realized commitments exceed resource ceiling');
  }else if(c.kind==='value-parity'||c.kind==='count-parity'){
   ensure(text(c.unit)&&finite(c.expectedValue)&&finite(c.observedValue),'invalid normalized values or unit');
   if(c.kind==='count-parity')ensure(Number.isSafeInteger(c.expectedValue)&&Number.isSafeInteger(c.observedValue)&&c.expectedValue>=0&&c.observedValue>=0,'invalid count');
   expected=c.expectedValue;observed=c.observedValue;
   if(Math.abs(expected-observed)>(c.kind==='count-parity'?0:tolerance(c.tolerance)))fail('rendered value differs from source expectation');
  }else{
   const relation=r=>{ensure(r&&[r.from,r.predicate,r.to].every(text),'invalid relation');return JSON.stringify([r.from,r.predicate,r.to])};
   ensure(Array.isArray(c.modelRelations)&&Array.isArray(c.visualRelations)&&c.visualRelations.length>0,'invalid relation sets');
   const model=new Set(c.modelRelations.map(relation)),visual=c.visualRelations.map(relation);
   expected=[...model];observed=visual;const unsupported=visual.filter(x=>!model.has(x));
   if(unsupported.length)fail('visual claims unsupported model relations: '+unsupported.join(', '));
  }
  results.push({id:c.id,category,kind:c.kind,claim:c.claim,sourceRef:c.sourceRef,observationRef:c.observationRef,status,expected,observed,reason});
 }
 const unknown=[];
 for(const c of packet.coverage){
  ensure(['applicable','not-applicable','not-run'].includes(c.status)&&text(c.reason)&&text(c.ref),'invalid coverage disposition');
  const count=results.filter(r=>r.category===c.category).length;
  ensure(c.status!=='not-applicable'||count===0,'not-applicable category has checks');
  if(c.status==='not-run'||(c.status==='applicable'&&count===0))unknown.push(c.category);
 }
 const failures=results.filter(r=>r.status==='fail');
 return {version:1,revision:packet.revision,status:failures.length?'semantic-check-failed':unknown.length?'semantic-check-incomplete':'declared-semantic-checks-pass',results,failures,unknown,releaseAuthorized:false,scope:'deterministic checks on authored evidence; no automatic extraction, evidence authentication, exhaustive correctness or visual approval'};
}
