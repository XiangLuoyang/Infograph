// Renderer-neutral, finite authored choreography. See references/interaction-choreography.md.
export function compileChoreography(spec){
 const str=x=>typeof x==="string"&&x.trim().length>0;
 const safe=x=>str(x)&&/^[A-Za-z][A-Za-z0-9_-]*$/.test(x)&&!["constructor","prototype","__proto__"].includes(x);
 const requireText=(o,keys,label)=>{for(const k of keys)if(!str(o?.[k]))throw Error(label+": missing "+k)};
 const index=(list,label)=>{if(!Array.isArray(list)||!list.length)throw Error("missing "+label);const m=new Map();for(const x of list){if(!safe(x?.id)||m.has(x.id))throw Error("invalid/duplicate "+label+" id");m.set(x.id,x)}return m};
 const objects=index(spec?.objects,"objects"), evidence=index(spec?.evidence,"evidence"), states=index(spec?.states,"states");
 for(const e of evidence.values())requireText(e,["source","limitation"],"evidence");
 const channels=new Map();
 for(const o of objects.values()){
  requireText(o,["role"],"object");
  for(const c of index(o.channels,"channels").values()){
   requireText(c,["meaning","mapping","unit"],"channel");
   if(!["qualitative","calibrated"].includes(c.mapping))throw Error("unknown mapping");
   if(c.mapping==="calibrated"){if(!evidence.has(c.evidenceId)||!str(c.calibration))throw Error("calibrated channel needs evidence and calibration");}
   if(c.kind==="number"){
    if(!Number.isFinite(c.min)||!Number.isFinite(c.max)||c.max<=c.min)throw Error("invalid channel range");
   }else if(c.kind==="enum"){
    if(!Array.isArray(c.values)||!c.values.length||!c.values.every(str)||new Set(c.values).size!==c.values.length)throw Error("invalid enum");
   }else throw Error("unknown channel kind");
   channels.set(o.id+"."+c.id,{...c,objectId:o.id,key:o.id+"."+c.id});
  }
 }
 const valid=(c,v)=>c.kind==="number"?Number.isFinite(v)&&v>=c.min&&v<=c.max:c.values.includes(v);
 for(const s of states.values()){
  requireText(s,["reading","scope","status"],"state");
  if(!["observation","hypothesis","assumption","scenario","question","decision"].includes(s.status))throw Error("invalid claim status");
  if(!Array.isArray(s.evidenceIds)||!s.evidenceIds.length||new Set(s.evidenceIds).size!==s.evidenceIds.length||s.evidenceIds.some(x=>!evidence.has(x)))throw Error("invalid state evidence");
  if(!s.values||Object.keys(s.values).length!==channels.size||[...channels].some(([k,c])=>!Object.hasOwn(s.values,k)||!valid(c,s.values[k])))throw Error("state channel coverage or value invalid");
  for(const c of channels.values())if(c.mapping==="calibrated"&&!s.evidenceIds.includes(c.evidenceId))throw Error("state lacks calibrated evidence");
 }
 const edges=new Map(),transitionIds=new Set();
 if(!Array.isArray(spec.transitions))throw Error("missing transitions");
 for(const t of spec.transitions){
  if(!safe(t.id)||transitionIds.has(t.id)||!states.has(t.from)||!states.has(t.to)||t.from===t.to)throw Error("invalid transition identity");
  transitionIds.add(t.id);
  const key=t.from+":"+t.to;if(edges.has(key))throw Error("duplicate directed transition");
  requireText(t,["trigger","semanticPayload","timingRationale","staticAlternative"],"transition");
  if(!Array.isArray(t.evidenceIds)||!t.evidenceIds.length||new Set(t.evidenceIds).size!==t.evidenceIds.length||t.evidenceIds.some(x=>!evidence.has(x)))throw Error("invalid transition evidence");
  const a=states.get(t.from),b=states.get(t.to);
  if(t.evidenceIds.some(x=>!a.evidenceIds.includes(x)&&!b.evidenceIds.includes(x)))throw Error("transition evidence not linked to endpoints");
  const changed=[...channels.keys()].filter(k=>a.values[k]!==b.values[k]);
  const trackMap=index(t.tracks,"tracks"),targets=new Set();
  for(const tr of trackMap.values()){
   if(!changed.includes(tr.channel)||targets.has(tr.channel))throw Error("track must target unique changed channel");
   targets.add(tr.channel);
   const c=channels.get(tr.channel);
   if(c.mapping==="calibrated"&&!t.evidenceIds.includes(c.evidenceId))throw Error("track lacks calibration evidence");
   if(!Number.isInteger(tr.durationMs)||tr.durationMs<0||tr.durationMs>10000||!Number.isInteger(tr.delayMs)||tr.delayMs<0||tr.delayMs>10000)throw Error("invalid timing");
   if(!["linear","ease-in-out","step-start","step-end"].includes(tr.easing))throw Error("invalid easing");
   if(c.kind==="enum"&&!tr.easing.startsWith("step-"))throw Error("enum must be discrete");
   if(c.mapping==="calibrated"&&!tr.easing.startsWith("step-"))throw Error("calibrated factual values must step, not interpolate");
   if(!Array.isArray(tr.after)||new Set(tr.after).size!==tr.after.length||tr.after.some(x=>!trackMap.has(x)||x===tr.id))throw Error("invalid dependency");
  }
  if(targets.size!==changed.length)throw Error("untracked changed channel");
  const resolved=new Map(),visiting=new Set();
  function resolve(id){
   if(resolved.has(id))return resolved.get(id);
   if(visiting.has(id))throw Error("cyclic track dependency");
   visiting.add(id);
   const tr=trackMap.get(id),startMs=tr.delayMs+Math.max(0,...tr.after.map(x=>resolve(x).endMs));
   const r={...tr,startMs,endMs:startMs+tr.durationMs};
   visiting.delete(id);resolved.set(id,r);return r;
  }
  const tracks=[...trackMap.keys()].map(resolve),durationMs=Math.max(...tracks.map(x=>x.endMs));
  if(durationMs>30000)throw Error("transition exceeds 30s");
  edges.set(key,{...t,tracks,durationMs});
 }
 return JSON.parse(JSON.stringify({version:"0.1",objects:[...objects.values()],channels:[...channels.values()],states:[...states.values()],evidence:[...evidence.values()],transitions:[...edges.values()]}));
}

export function choreographyInitial(plan,stateId,contextRevision="initial",reducedMotion=false){
 const target=plan.states.find(x=>x.id===stateId);
 if(!target||typeof contextRevision!=="string"||!contextRevision.trim()||typeof reducedMotion!=="boolean")throw Error("invalid initial state");
 return {targetId:stateId,contextRevision,reducedMotion,epoch:0,active:null};
}

export function choreographyFrame(plan,state,nowMs){
 if(!Number.isFinite(nowMs)||nowMs<0)throw Error("invalid timestamp");
 const target=plan.states.find(x=>x.id===state.targetId);
 if(!target)throw Error("invalid target");
 const a=state.active;
 const elapsed=a?Math.max(0,nowMs-a.startedAt):0;
 const moving=!!a&&elapsed<a.durationMs;
 const values={...target.values};
 if(moving){
  // Transient visual channels are not authoritative business values.
  for(const tr of a.tracks){
   const from=a.fromValues[tr.channel],to=target.values[tr.channel];
   if(elapsed<tr.startMs){values[tr.channel]=from;continue;}
   const p=tr.durationMs===0?1:Math.max(0,Math.min(1,(elapsed-tr.startMs)/tr.durationMs));
   if(tr.easing==="step-start")values[tr.channel]=to;
   else if(tr.easing==="step-end")values[tr.channel]=p>=1?to:from;
   else{const q=tr.easing==="ease-in-out"?p*p*(3-2*p):p;values[tr.channel]=from+(to-from)*q;}
  }
 }
 return {epoch:state.epoch,targetId:target.id,contextRevision:state.contextRevision,moving,progress:moving?elapsed/a.durationMs:1,visualValues:values,semantic:{reading:target.reading,scope:target.scope,status:target.status,evidence:plan.evidence.filter(e=>target.evidenceIds.includes(e.id))},transition:moving?{id:a.id,semanticPayload:a.semanticPayload,staticAlternative:a.staticAlternative,evidence:plan.evidence.filter(e=>a.evidenceIds.includes(e.id))}:null};
}

export function choreographyGo(plan,state,{to,nowMs,contextRevision=state.contextRevision,reducedMotion=state.reducedMotion,cut=false}){
 if(!Number.isFinite(nowMs)||nowMs<0||typeof contextRevision!=="string"||!contextRevision.trim()||typeof reducedMotion!=="boolean"||typeof cut!=="boolean")throw Error("invalid request");
 const target=plan.states.find(x=>x.id===to);if(!target)throw Error("unknown state");
 if(to===state.targetId&&contextRevision===state.contextRevision&&reducedMotion===state.reducedMotion&&!cut)return state;
 const base={targetId:to,contextRevision,reducedMotion,epoch:state.epoch+1,active:null};
 if(cut||reducedMotion||state.reducedMotion||contextRevision!==state.contextRevision)return base;
 const edge=plan.transitions.find(t=>t.from===state.targetId&&t.to===to);
 if(!edge||!edge.durationMs)return base;
 const fromValues=choreographyFrame(plan,state,nowMs).visualValues;
 // Retarget from the actual rendered frame. Channels not part of the new edge
 // may still be transient after interruption: snap the entire scene instead of
 // inventing a motion not authorized by the new transition.
 const targets=new Set(edge.tracks.map(t=>t.channel));
 if(Object.keys(target.values).some(k=>fromValues[k]!==target.values[k]&&!targets.has(k)))return base;
 return {...base,active:{id:edge.id,tracks:edge.tracks,startedAt:nowMs,durationMs:edge.durationMs,fromValues,semanticPayload:edge.semanticPayload,staticAlternative:edge.staticAlternative,evidenceIds:edge.evidenceIds}};
}

export function choreographySettle(plan,state,{epoch,nowMs}){
 if(epoch!==state.epoch||!state.active)return state;
 if(choreographyFrame(plan,state,nowMs).moving)return state;
 return {...state,active:null};
}

export function directorChoreographyRequest(previous,next,actStates,nowMs){
 if(!next||!Object.hasOwn(actStates,next.actId))throw Error("director act has no choreography state");
 if(!Number.isFinite(nowMs)||nowMs<0)throw Error("invalid timestamp");
 // Inspection-only changes are deliberately excluded: P1 owns inspection.
 if(previous&&previous.actId===next.actId&&previous.contextRevision===next.contextRevision&&previous.mode===next.mode&&previous.transition===next.transition)return null;
 return {to:actStates[next.actId],nowMs,contextRevision:next.contextRevision,cut:!previous||previous.mode!==next.mode||previous.contextRevision!==next.contextRevision||next.mode!=="director"||next.transition==="cut"};
}
