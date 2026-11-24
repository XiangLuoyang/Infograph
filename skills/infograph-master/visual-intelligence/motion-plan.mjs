const roles=['attention','continuity','transformation','causality','orientation','disclosure','feedback','evolution'];
export function motionPlan({objects,events,reducedMotion=false}={}){
if(!Array.isArray(objects)||!objects.length||!Array.isArray(events)||typeof reducedMotion!=='boolean')throw Error('invalid plan');
const ids=new Set();for(const o of objects){if(typeof o.id!=='string'||!o.id.trim()||ids.has(o.id)||typeof o.essential!=='boolean')throw Error('invalid object');ids.add(o.id)}
const seen=new Set();const steps=events.map(e=>{if(typeof e.id!=='string'||!e.id.trim()||seen.has(e.id)||!roles.includes(e.role)||!ids.has(e.target)||!Number.isFinite(e.duration)||e.duration<0||e.duration>10000)throw Error('invalid event');seen.add(e.id);
if(['causality','evolution','transformation'].includes(e.role)&&(typeof e.evidence!=='string'||!e.evidence.trim()))throw Error('evidence reference required');
if(e.role==='continuity'&&(e.fromIdentity!==e.target||e.toIdentity!==e.target))throw Error('identity mismatch');
if(e.role==='disclosure'&&objects.find(o=>o.id===e.target).essential)throw Error('essential information cannot depend on reveal');
return {...e,effectiveDuration:reducedMotion?0:e.duration,staticFallback:true};});
return {steps,reducedMotion,requirements:{keyboard:true,interruptible:true,essentialVisible:true},scope:'declared semantic motion plan; no DOM or evidence verification'};
}