export const curves={"linear":[0,0,1,1],"enter":[0.16,1,0.3,1],"exit":[0.4,0,1,1],"standard":[0.4,0,0.2,1],"precision":[0.25,0.1,0.25,1],"elastic":[0.34,1.35,0.64,1]};
export function progress(t,curve='standard',{data=false}={}){
if(!Number.isFinite(t)||t<0||t>1||!Object.hasOwn(curves,curve))throw Error('invalid curve input');
if(data&&curve==='elastic')throw Error('overshoot prohibited for data');
if(t===0||t===1)return t;
const [a,b,c,d]=curves[curve];const bez=(u,p,q)=>3*(1-u)**2*u*p+3*(1-u)*u*u*q+u**3;
let lo=0,hi=1;for(let i=0;i<32;i++){const m=(lo+hi)/2;if(bez(m,a,c)<t)lo=m;else hi=m}return bez((lo+hi)/2,b,d);
}
export function schedule(events,{reducedMotion=false}={}){
if(!Array.isArray(events)||typeof reducedMotion!=='boolean')throw Error('invalid schedule');
const map=new Map();for(const e of events){if(typeof e.id!=='string'||!e.id.trim()||map.has(e.id)||!Number.isFinite(e.duration)||e.duration<0||e.duration>10000||!Array.isArray(e.after)||new Set(e.after).size!==e.after.length||!Object.hasOwn(curves,e.curve)||typeof e.data!=='boolean'||(e.data&&e.curve==='elastic'))throw Error('invalid event');map.set(e.id,e)}
const done=new Map(),visiting=new Set();function visit(id){if(done.has(id))return done.get(id);if(!map.has(id)||visiting.has(id))throw Error('unknown dependency or cycle');visiting.add(id);const e=map.get(id),start=Math.max(0,...e.after.map(x=>visit(x).end)),duration=reducedMotion?0:e.duration;const r={...e,start,duration,end:start+duration};visiting.delete(id);done.set(id,r);return r}
const steps=events.map(e=>visit(e.id));return {steps,total:Math.max(0,...steps.map(e=>e.end)),reducedMotion,scope:'dependency schedule only; no playback'};
}