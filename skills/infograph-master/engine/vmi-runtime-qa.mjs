// Runtime evidence, independent of the authoring/scene compiler. No authored JS probes.
const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
const sameKeys=(a,ids)=>obj(a)&&Object.keys(a).length===ids.length&&ids.every(k=>Object.hasOwn(a,k));
const note=x=>typeof x==='string'&&x.trim().length>=12;
const finite=Number.isFinite;
const near=(a,b)=>finite(a)&&finite(b)&&Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(b));
export function validateVmiRuntimePlan(plan,runtime){
 const scenes=runtime?.vmi??[];
 if(!scenes.length)return plan;
 ensure(sameKeys(plan.vmiLifecycle,scenes.map(s=>s.id)),'VMI lifecycle disposition required for every scene');
 for(const s of scenes){
  const life=plan.vmiLifecycle[s.id],cases=plan.cases.filter(c=>c.sliceId===s.sliceId);
  ensure(obj(life)&&['fit','scroll'].includes(life.heightMode),'explicit VMI height policy required: '+s.id);
  for(const k of ['navigation','controls']){
   const d=life[k];ensure(obj(d)&&Array.isArray(d.caseIds)&&new Set(d.caseIds).size===d.caseIds.length&&note(d.reason),'VMI '+k+' disposition required: '+s.id);
   ensure(d.caseIds.every(id=>cases.some(c=>c.id===id&&c.kind==='interaction'&&c.steps.length>=(k==='navigation'?2:1))),'VMI lifecycle case must return to scene: '+s.id);
  }
  if(s.dynamic){
   ensure(life.controls.caseIds.length>0,'dynamic VMI requires host control interaction case: '+s.id);
   const ins=s.dynamic.inputs,bindings=s.dynamic.bindings;
   ensure(Array.isArray(bindings)&&bindings.length>0,'missing dynamic binding inventory: '+s.id);
   for(const c of cases){
    const p=c.vmiRuntime?.[s.id];ensure(obj(p)&&note(p.sourceRef)&&sameKeys(p.inputs,ins.map(i=>i.id))&&sameKeys(p.outputs,bindings.map(b=>b.id)),'independent VMI snapshot and output expectations required: '+s.id+' / '+c.id);
    ensure(ins.every(i=>finite(p.inputs[i.id])&&p.inputs[i.id]>=i.min&&p.inputs[i.id]<=i.max)&&bindings.every(b=>finite(p.outputs[b.id])),'invalid VMI expectations: '+s.id+' / '+c.id);
   }
   const baseline=cases.filter(c=>c.kind==='baseline');
   ensure(life.controls.caseIds.some(id=>{const p=cases.find(c=>c.id===id).vmiRuntime[s.id];return baseline.some(c=>ins.some(i=>p.inputs[i.id]!==c.vmiRuntime[s.id].inputs[i.id])&&bindings.some(b=>p.outputs[b.id]!==c.vmiRuntime[s.id].outputs[b.id]))}),'dynamic VMI needs a changed input AND output expectation: '+s.id);
  }
 }
 return plan;
}
export function evaluateVmiRuntime(scene,life,expected,actual){
 const issues=[];
 if(!actual||!finite(actual.height)||actual.height<=0||!finite(actual.contentHeight)||actual.contentHeight<=0||!finite(actual.width)||actual.width<=0||!finite(actual.contentWidth)||actual.contentWidth>actual.width+2)issues.push('frame-layout-invalid');
 else if(actual.contentHeight>actual.height+2&&(life.heightMode==='fit'||!actual.scrollable))issues.push('frame-content-clipped');
 if(scene.dynamic){
  for(const i of scene.dynamic.inputs){
   const o=actual?.inputs?.filter(x=>x.id===i.id)??[];
   if(o.length!==1||!near(o[0].value,expected.inputs[i.id])||!o[0].disabled)issues.push('host-input-mismatch:'+i.id);
  }
  for(const b of scene.dynamic.bindings){
   const marks=actual?.outputs?.filter(x=>x.id===b.id)??[];
   if(marks.length!==2||!marks.every(m=>near(m[b.property],expected.outputs[b.id])))issues.push('binding-output-mismatch:'+b.id);
  }
 }
 return {ok:issues.length===0,issues};
}
export async function inspectVmiRuntime(frame,scene,life,expected){
 const actual=await frame.evaluate(()=>{
  const root=document.documentElement,body=document.body;
  const numeric=(s)=>s!==null&&s.trim()!==''?Number(s):null;
  const rotation=e=>{const m=/^rotate\(\s*(-?[\d.eE+]+)(?:[ ,]+[^)]+)?\)$/.exec(e.getAttribute('transform')??'');return m?Number(m[1]):null};
  return {height:innerHeight,width:innerWidth,contentHeight:Math.max(root.scrollHeight,body.scrollHeight),contentWidth:Math.max(root.scrollWidth,body.scrollWidth),scrollable:!['hidden','clip'].includes(getComputedStyle(root).overflowY)&&!['hidden','clip'].includes(getComputedStyle(body).overflowY),inputs:[...document.querySelectorAll('[data-dynamic-input]')].map(e=>({id:e.dataset.dynamicInput,value:numeric(e.value),disabled:e.disabled})),outputs:[...document.querySelectorAll('[data-binding]')].map(e=>({id:e.dataset.binding,liquidHeight:numeric(e.getAttribute('height')),opacity:numeric(e.getAttribute('opacity')),rotate:rotation(e)}))};
 });
 return {...evaluateVmiRuntime(scene,life,expected,actual),actual};
}
