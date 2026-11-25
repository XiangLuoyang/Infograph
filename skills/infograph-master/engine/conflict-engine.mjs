import {validateIR} from './design-v3.mjs';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const str=x=>typeof x==='string'&&x.trim().length>0;
const strings=x=>Array.isArray(x)&&x.every(str);
export function detectConflicts(d,model,rules,facts={}){
 const a=validateIR(d,model);if(a.errors.length)throw Error(a.errors.join('; '));
 const results=[],objects=new Map(d.graph.objects.map(o=>[o.id,o]));
 const blocks=d.graph.objects.filter(o=>o.type==='Block');
 for(const b of blocks){
 const targets=d.graph.links.filter(l=>l.from===b.id&&l.type==='uses').map(l=>l.to);
 const outputs=d.outputs.filter(o=>targets.includes(o.targetId));
 const f=Object.hasOwn(facts,b.id)?facts[b.id]:{},emit=(id,status,detail)=>{const r=rules.find(r=>r.id===id);if(!r)throw Error('missing rule '+id);results.push({ruleId:id,domain:r.domain,severity:r.severity,blockId:b.id,targetIds:targets,status,detail})};
 const bool=(id,value,detail)=>emit(id,typeof value!=='boolean'?'unknown':value?'satisfied':'conflict',detail);
 const ratio=f?.normalTextContrast;
 emit('C01',finite(ratio)&&ratio>=1&&ratio<=21?(ratio>=4.5?'satisfied':'conflict'):'unknown','declared effective contrast; no browser measurement');
 const w=f?.availableWidth,r=f?.requiredWidth;
 emit('C02',finite(w)&&finite(r)&&w>0&&r>0?(w>=r?'satisfied':'conflict'):'unknown','declared comparable widths in CSS px');
 const req=f?.requiredFields,have=f?.availableFields;
 emit('C03',strings(req)&&req.length&&strings(have)?(req.every(k=>have.includes(k))?'satisfied':'conflict'):'unknown','declared field presence only');
 bool('C04',f?.essentialVisibleInitially,'declared initial visibility');
 bool('C05',f?.reducedMotionAlternative,'declared reduced-motion alternative');
 emit('C06',outputs.some(o=>o.contract.status!=='generated')?'conflict':targets.length&&targets.every(id=>outputs.some(o=>o.targetId===id&&o.contract.status==='generated'))?'satisfied':'unknown','bound output status; not renderer readiness');
 bool('C07',str(f?.narrativeFocus)&&str(f?.visualFocus)?f.narrativeFocus===f.visualFocus:undefined,'declared focus identity');
 }
 const hard=results.filter(r=>r.severity==='hard'&&r.status!=='satisfied');
 return {revision:d.revision,designId:d.id,results,status:hard.some(r=>r.status==='conflict')?'blocked':hard.length||!blocks.length?'incomplete':'declared-checks-satisfied',scope:'caller-declared facts; no measurement, truth or release certification'};
}
