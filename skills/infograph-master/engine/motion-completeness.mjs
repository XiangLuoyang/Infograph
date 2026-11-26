// Authored physical-motion inventory and evidence audit. No physics solver.
export const motionProfiles={
  "static-structure": {
    "behaviors": [],
    "checks": [
      "identity",
      "stability"
    ]
  },
  "rigid": {
    "behaviors": [
      "rotation",
      "translation"
    ],
    "checks": [
      "pivot",
      "perspective",
      "thickness",
      "lighting"
    ]
  },
  "articulated": {
    "behaviors": [
      "joint-rotation",
      "joint-translation"
    ],
    "checks": [
      "joint-limits",
      "attachment",
      "perspective",
      "collision"
    ]
  },
  "deformable": {
    "behaviors": [
      "bend",
      "stretch",
      "oscillation"
    ],
    "checks": [
      "anchors",
      "deformation",
      "material",
      "boundary"
    ]
  },
  "liquid": {
    "behaviors": [
      "surface-wave",
      "texture-flow",
      "level-change",
      "bubbles"
    ],
    "checks": [
      "container-boundary",
      "surface",
      "texture",
      "reflection"
    ]
  },
  "gas": {
    "behaviors": [
      "advection",
      "dispersion",
      "density-change"
    ],
    "checks": [
      "domain",
      "continuity",
      "opacity",
      "occlusion"
    ]
  },
  "optical": {
    "behaviors": [
      "reflection",
      "emission",
      "refraction"
    ],
    "checks": [
      "lighting",
      "surface-alignment",
      "occlusion"
    ]
  },
  "semantic-overlay": {
    "behaviors": [
      "reveal",
      "focus",
      "value-step"
    ],
    "checks": [
      "legibility",
      "evidence",
      "identity"
    ]
  }
};

export function compileMotionCompleteness(spec,conceptPlan,choreographyPlan,profiles){
 const text=x=>typeof x==="string"&&x.trim().length>0;
 const hash=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 const index=(xs,label)=>{assert(Array.isArray(xs),"missing "+label);const m=new Map();for(const x of xs){assert(text(x?.id)&&!m.has(x.id),"invalid or duplicate "+label);m.set(x.id,x)}return m};
 const layers=index(conceptPlan?.layers,"concept layers"),channels=new Map((choreographyPlan?.channels??[]).map(c=>[c.key,c])),states=index(choreographyPlan?.states??[],"choreography states");
 assert(hash(spec?.conceptSha)&&spec.conceptSha===conceptPlan.source.sha256,"stale concept source");
 assert(text(spec.motionRevision)&&text(spec.sceneRef),"missing motion revision or scene");
 const inventory=index(spec.inventory,"inventory"),issues=[],jobs=[],covered=new Set(),usedChannels=new Set();
 for(const o of inventory.values()){
  const profile=Object.hasOwn(profiles,o.class)?profiles[o.class]:null;assert(profile,"unknown physical class "+o.id);
  assert(text(o.observedRef)&&text(o.physicalRole)&&text(o.staticAlternative)&&typeof o.essential==="boolean","missing object evidence/role "+o.id);
  assert(Array.isArray(o.layerIds)&&o.layerIds.length&&new Set(o.layerIds).size===o.layerIds.length&&o.layerIds.every(x=>layers.has(x)),"unmapped layers "+o.id);
  for(const x of o.layerIds)covered.add(x);
  assert(Array.isArray(o.expectations)&&o.expectations.length&&new Set(o.expectations.map(e=>e.behavior)).size===o.expectations.length,"missing or duplicate expectations "+o.id);
  for(const e of o.expectations){
   assert(e.behavior==="none"||profile.behaviors.includes(e.behavior),"behavior incompatible with class "+o.id);
   assert(["required","optional","static"].includes(e.disposition)&&text(e.reason),"missing disposition or reason");
   assert(["business","illustrative","ambient","none"].includes(e.intent),"invalid intent");
   assert(e.behavior!=="none"||e.disposition==="static","none cannot require motion");
   if(e.intent==="ambient")assert(e.disposition!=="required","ambient motion cannot be mandatory");
   if(e.intent==="none")assert(e.disposition==="static","motion needs meaning");
  }
  assert(o.expectations.every(e=>e.behavior!=="none")||o.expectations.length===1,"none conflicts with other expectations");
  assert(Array.isArray(o.implementations),"missing implementations");
  const implementations=index(o.implementations,"implementations");
  const matched=new Set();
  for(const m of implementations.values()){
   const e=o.expectations.find(x=>x.behavior===m.behavior);
   assert(e&&e.disposition!=="static"&&!matched.has(m.behavior),"unjustified or duplicate motion "+o.id);
   matched.add(m.behavior);
   assert(o.layerIds.includes(m.layerId)&&layers.get(m.layerId).dynamic,"motion must bind dynamic layer");
   assert(text(m.renderer)&&text(m.geometryRule)&&text(m.occlusionRule)&&text(m.reducedMotionRule),"missing motion fidelity contract");
   assert(["transition","loop"].includes(m.driver),"unknown driver");
   assert(["qualitative","calibrated"].includes(m.mapping),"unknown mapping");
   if(m.mapping==="calibrated")assert(m.driver==="transition"&&text(m.evidenceRef),"calibrated motion requires evidence and finite transition");
   if(m.driver==="transition"){
    const c=channels.get(m.channel);
    assert(c&&c.mapping===m.mapping&&!usedChannels.has(m.channel),"invalid/duplicate choreography channel");
    assert((choreographyPlan.transitions??[]).some(t=>t.tracks.some(tr=>tr.channel===m.channel)),"channel never moves");
    usedChannels.add(m.channel);
   }else{
    assert(e.intent!=="business","business motion must be state-bound, not autonomous");
    assert(m.mapping==="qualitative"&&Number.isFinite(m.periodMs)&&m.periodMs>=300&&m.periodMs<=30000&&Number.isFinite(m.amplitude)&&m.amplitude>0&&m.amplitude<=1,"invalid illustrative loop");
    assert(Array.isArray(m.activeStates)&&m.activeStates.length&&new Set(m.activeStates).size===m.activeStates.length&&m.activeStates.every(x=>states.has(x)),"loop needs explicit active states");
    assert(m.pausePolicy==="stop"&&m.reducedMotionPolicy==="static","loop must stop and respect reduced motion");
   }
   jobs.push({objectId:o.id,class:o.class,intent:e.intent,...m});
  }
  for(const e of o.expectations.filter(x=>x.disposition==="required"&&!matched.has(x.behavior)))issues.push({kind:"missing-motion",objectId:o.id,behavior:e.behavior,severity:o.essential?"blocking":"review"});
  if(o.essential&&o.class!=="static-structure"&&o.class!=="semantic-overlay"&&o.expectations.length===1&&o.expectations[0].behavior==="none"&&!text(o.staticRationale))issues.push({kind:"static-justification-missing",objectId:o.id,severity:"blocking"});
 }
 for(const l of layers.values())if(!covered.has(l.id))issues.push({kind:"unclassified-layer",layerId:l.id,severity:l.essential||l.dynamic?"blocking":"review"});
 for(const l of layers.values())if(l.dynamic&&!jobs.some(j=>j.layerId===l.id))issues.push({kind:"dynamic-layer-unbound",layerId:l.id,severity:l.essential?"blocking":"review"});
 return JSON.parse(JSON.stringify({version:"0.1",conceptSha:spec.conceptSha,motionRevision:spec.motionRevision,sceneRef:spec.sceneRef,inventory:[...inventory.values()],jobs,issues,requiredReviews:[...inventory.values()].flatMap(o=>[...profiles[o.class].checks.map(d=>o.id+":"+d),...(o.implementations.length? [o.id+":motion",o.id+":reduced-motion",o.id+":pause"]:[])]),planningReady:!issues.some(i=>i.severity==="blocking"),complete:issues.length===0,rendered:false,releaseAuthorized:false}));
}

export function sampleIllustrativeMotion(plan,{stateId,elapsedMs,paused=false,reducedMotion=false}){
 if(typeof stateId!=="string"||!Number.isFinite(elapsedMs)||elapsedMs<0||typeof paused!=="boolean"||typeof reducedMotion!=="boolean")throw Error("invalid sample");
 return plan.jobs.filter(j=>j.driver==="loop").map(j=>{
  const active=!paused&&!reducedMotion&&j.activeStates.includes(stateId);
  const phase=active?(elapsedMs%j.periodMs)/j.periodMs:0;
  return {objectId:j.objectId,layerId:j.layerId,behavior:j.behavior,active,phase,offset:active?j.amplitude*Math.sin(2*Math.PI*phase):0,mapping:"qualitative"};
 });
}

export function reviewMotionCompleteness(plan,{outputSha,records=[]}){
 if(!/^[a-f0-9]{64}$/.test(outputSha??""))throw Error("output hash required");
 const m=new Map();for(const r of records){if(!plan.requiredReviews.includes(r.key)||m.has(r.key))throw Error("unknown/duplicate record");m.set(r.key,r)}
 const checks=plan.requiredReviews.map(key=>{const r=m.get(key);return {key,status:!r?"missing":r.conceptSha!==plan.conceptSha||r.motionRevision!==plan.motionRevision||r.outputSha!==outputSha?"stale":!["pass","fail","not-run"].includes(r.status)?"invalid":r.status==="pass"&&(!r.ref?.trim?.()||!r.reviewer?.trim?.())?"missing-evidence":r.status}});
 return {checks,complete:plan.complete&&checks.every(c=>c.status==="pass"),releaseAuthorized:false,scope:"declared object inventory and evidence only; not physical simulation or pixel review"};
}
