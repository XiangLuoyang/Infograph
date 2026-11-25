import {auditDesignGraph} from './design-graph.mjs';
const mapping={color:['Color'],typography:['Typography'],composition:['Layout'],material:['Material'],motion:['Motion','Interaction'],representation:['Representation']};
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
export function validateIR(d,model){
 const errors=[];if(!plain(d)||d.version!=='3.0'||typeof d.id!=='string'||!d.id.trim()||!Number.isSafeInteger(d.revision)||d.revision<0)return {errors:['invalid IR envelope']};
 const a=auditDesignGraph(d.graph,model);errors.push(...a.errors);if(a.errors.length)return {errors};
 const objects=new Map(d.graph.objects.map(o=>[o.id,o])),seen=new Set();
 if(!Array.isArray(d.outputs))errors.push('outputs required');else for(const o of d.outputs){const c=o?.contract,t=objects.get(o?.targetId),key=JSON.stringify([o?.targetId,c?.studio]);if(!t||!plain(c)||!Object.hasOwn(mapping,c.studio)||!mapping[c.studio].includes(t.type)||c.version!=='1.0'||c.kind!=='infograph-studio-output'||!plain(c.payload)||!['generated','blocked','unsupported','invalid-data','choose'].includes(c.status)||!Array.isArray(c.limitations)||c.limitations.some(x=>typeof x!=='string')||!Array.isArray(c.evidence)||c.evidence.some(id=>objects.get(id)?.type!=='Evidence')||!['browser','semantic','audience'].every(k=>c.validation?.[k]==='not-run')||seen.has(key))errors.push('invalid output '+key);seen.add(key)}
 const req=d.validation?.required,res=d.validation?.results,checks=new Set();
 if(!Array.isArray(req)||req.some(x=>typeof x!=='string'||!x.trim())||new Set(req).size!==req.length||!Array.isArray(res))errors.push('invalid validation envelope');else for(const r of res){if(!req.includes(r?.check)||checks.has(r?.check)||r?.revision!==d.revision||!['pass','fail','not-run'].includes(r?.status)||(r.status==='pass'&&objects.get(r.evidenceId)?.type!=='Evidence'))errors.push('invalid validation result '+r?.check);checks.add(r?.check)}
 if(d.migration!==null&&!plain(d.migration))errors.push('invalid migration');
 return {errors,scope:'semantic references only; run JSON Schema separately; no release authorization'};
}
export function reviseIR(d,model,edit){const before=validateIR(d,model);if(before.errors.length)throw Error(before.errors.join('; '));const next=JSON.parse(JSON.stringify(d));edit(next);next.id=d.id;next.version=d.version;next.revision=d.revision+1;next.validation.results=[];next.outputs=[];for(const o of next.graph.objects)if(o.type==='Validation'){o.status='not-run';delete o.evidenceId}const after=validateIR(next,model);if(after.errors.length)throw Error(after.errors.join('; '));return next}
