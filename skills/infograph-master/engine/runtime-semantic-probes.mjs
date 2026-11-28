// Read-only DOM probe contracts; strict normalized visible-text comparison.
export function validateSemanticProbes(probes){
 const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
 const text=x=>typeof x==='string'&&x.trim().length>0&&x.length<=1000;
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 ensure(Array.isArray(probes)&&probes.length<=30,'invalid semantic probe count');
 const ids=new Set();
 for(const p of probes){
  ensure(p&&typeof p.id==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(p.id)&&!ids.has(p.id)&&text(p.selector)&&text(p.sourceRef)&&text(p.unit),'invalid semantic probe identity/evidence');
  ids.add(p.id);
  ensure(['number','count','missing'].includes(p.kind),'invalid semantic probe kind');
  if(p.kind==='number'){
   ensure(finite(p.expected)&&finite(p.tolerance??0)&&(p.tolerance??0)>=0&&finite(p.scale??1)&&(p.scale??1)>0,'invalid numeric expectation');
   ensure(p.prefix===undefined||typeof p.prefix==='string'&&p.prefix.length<=32,'invalid prefix');
   ensure(p.suffix===undefined||typeof p.suffix==='string'&&p.suffix.length<=32,'invalid suffix');
  }else if(p.kind==='count'){
   ensure(Number.isSafeInteger(p.expected)&&p.expected>=0,'invalid count expectation');
  }else{
   ensure(Array.isArray(p.tokens)&&p.tokens.length>0&&p.tokens.length<=10&&p.tokens.every(text),'missing probe requires explicit display tokens');
   ensure(p.expected===undefined,'missing probe has no numeric expectation');
  }
 }
 return probes;
}
export function parseSemanticNumber(raw,p){
 if(typeof raw!=='string'||raw.length>200)return null;
 let s=raw.trim().replace(/\u2212/g,'-');
 const prefix=p.prefix??'',suffix=p.suffix??'';
 if(!s.startsWith(prefix)||!s.endsWith(suffix)||s.length<prefix.length+suffix.length)return null;
 s=s.slice(prefix.length,s.length-suffix.length).trim();
 // Strict full-token decimal; no guessing units, locale, multiple values or embedded prose.
 if(!/^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))return null;
 const v=Number(s.replace(/,/g,''))*(p.scale??1);
 return Number.isFinite(v)?v:null;
}
export function evaluateSemanticProbe(p,observation){
 const base={id:p.id,kind:p.kind,selector:p.selector,sourceRef:p.sourceRef,unit:p.unit,expected:p.kind==='missing'?null:p.expected,observed:null,raw:null,status:'fail',reason:''};
 if(!observation||observation.error)return {...base,reason:observation?.error??'missing observation'};
 if(p.kind==='count'){
  if(!Number.isSafeInteger(observation.visibleCount)||observation.visibleCount<0)return {...base,reason:'invalid visible count'};
  const v=observation.visibleCount;
  return {...base,observed:v,status:v===p.expected?'pass':'fail',reason:v===p.expected?'':'visible count mismatch'};
 }
 if(observation.visibleCount!==1||observation.matchCount!==1||typeof observation.text!=='string')return {...base,reason:'probe requires one unique visible target'};
 const raw=observation.text.slice(0,200);
 if(p.kind==='missing'){
  const ok=p.tokens.includes(raw.trim())&&observation.text.length<=200;
  return {...base,raw,status:ok?'pass':'fail',reason:ok?'':'expected missing-value marker'};
 }
 const v=parseSemanticNumber(observation.text,p);
 const ok=v!==null&&Math.abs(v-p.expected)<=(p.tolerance??0);
 return {...base,raw,observed:v,status:ok?'pass':'fail',reason:ok?'':v===null?'unparseable numeric text':'numeric expectation mismatch'};
}
