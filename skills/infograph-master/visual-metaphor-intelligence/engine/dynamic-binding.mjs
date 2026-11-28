// Bounded numeric expression interpreter; no executable author code.
export function evaluateBindings(spec,values={}){
 const env=Object.create(null);
 const finite=x=>{if(typeof x!=='number'||!Number.isFinite(x))throw Error('nonfinite binding value');return x};
 for(const i of spec.inputs){const v=finite(Object.hasOwn(values,i.id)?values[i.id]:i.initial);if(v<i.min||v>i.max)throw Error('input outside domain: '+i.id);env[i.id]=v}
 function expr(x,depth=0){
  if(depth>12)throw Error('expression depth');
  if(typeof x==='number')return finite(x);
  if(!x||typeof x!=='object'||Array.isArray(x))throw Error('invalid expression');
  if(Object.hasOwn(x,'ref')){if(Object.keys(x).length!==1||!Object.hasOwn(env,x.ref))throw Error('unknown or forward reference');return env[x.ref]}
  if(Object.keys(x).length!==2||!Array.isArray(x.args)||x.args.length!==2)throw Error('binary expression required');
  const [a,b]=x.args.map(v=>expr(v,depth+1));
  switch(x.op){case 'add':return finite(a+b);case 'sub':return finite(a-b);case 'mul':return finite(a*b);case 'div':return finite(a/b);case 'min':return Math.min(a,b);case 'max':return Math.max(a,b);default:throw Error('unsupported operation')}
 }
 for(const d of spec.derived)env[d.id]=expr(d.expr);
 const outputs=spec.bindings.map(b=>{const v=env[b.source];if(!Number.isFinite(v)||v<b.domain[0]||v>b.domain[1])throw Error('binding outside domain: '+b.id);return {id:b.id,value:finite(b.range[0]+(v-b.domain[0])/(b.domain[1]-b.domain[0])*(b.range[1]-b.range[0]))}});
 return {values:{...env},outputs};
}
export function compileDynamicBindings(spec,scene){
 if(spec===undefined)return null;
 const txt=x=>typeof x==='string'&&x.trim().length>0, num=x=>typeof x==='number'&&Number.isFinite(x),id=x=>typeof x==='string'&&/^[a-zA-Z][a-zA-Z0-9_-]{0,47}$/.test(x)&&!['constructor','prototype','__proto__'].includes(x);
 const check=(v,m)=>{if(!v)throw Error(m)};
 check(spec?.version===1&&txt(spec.ref)&&txt(spec.boundary),'dynamic provenance required');
 check(Array.isArray(spec.inputs)&&spec.inputs.length>0&&spec.inputs.length<=8&&Array.isArray(spec.derived)&&spec.derived.length<=24&&Array.isArray(spec.bindings)&&spec.bindings.length>0&&spec.bindings.length<=32,'dynamic inventory');
 const ids=new Set(),targets=new Set(),bindingIds=new Set();
 for(const i of spec.inputs){check(id(i.id)&&!ids.has(i.id)&&txt(i.label)&&txt(i.unit)&&[i.min,i.max,i.initial,i.step].every(num)&&i.min<i.max&&i.initial>=i.min&&i.initial<=i.max&&i.step>0&&i.step<=i.max-i.min,'invalid input');ids.add(i.id)}
 for(const d of spec.derived){check(id(d.id)&&!ids.has(d.id)&&txt(d.ref)&&txt(d.unit),'invalid derived variable');ids.add(d.id)}
 for(const b of spec.bindings){
  const o=scene.objects.find(o=>o.id===b.objectId),s=o?.shapes?.[b.shapeIndex],key=b.objectId+':'+b.shapeIndex+':'+b.property;
  check(id(b.id)&&!bindingIds.has(b.id)&&!targets.has(key)&&ids.has(b.source)&&txt(b.ref)&&s&&Number.isInteger(b.shapeIndex),'invalid binding target');
  check(Array.isArray(b.domain)&&b.domain.length===2&&b.domain.every(num)&&b.domain[0]<b.domain[1]&&Array.isArray(b.range)&&b.range.length===2&&b.range.every(num),'invalid mapping');
  check(b.property==='opacity'&&b.range.every(v=>v>=0&&v<=1)||b.property==='rotate'&&b.range.every(v=>v>=-180&&v<=180)&&Array.isArray(b.pivot)&&b.pivot.length===2&&b.pivot.every(v=>num(v)&&v>=0&&v<=100)||b.property==='liquidHeight'&&s.type==='rect'&&b.range.every(v=>v>=0&&v<=s.h),'unsupported visual mapping');
  check(!(scene.surfaceRendering?.motions??[]).some(m=>m.objectId===b.objectId&&m.shapeIndex===b.shapeIndex),'conflicting motion binding');
  bindingIds.add(b.id);targets.add(key)
 }
 const initial=evaluateBindings(spec);
 return {spec,initial,scope:'bounded numeric illustration; no physical simulation or formula correctness certification'};
}
