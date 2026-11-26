// Renderer-neutral director; authored evidence and shared external data remain authoritative.
export function compileDirector(story, scene) {
  const nonempty=x=>typeof x==="string"&&x.trim().length>0;
  const required=(o,keys,label)=>{for(const k of keys)if(!nonempty(o?.[k]))throw Error(label+": missing "+k);};
  const ids=(list,label)=>{if(!Array.isArray(list)||!list.length)throw Error("missing "+label);const m=new Map();for(const o of list){if(!nonempty(o?.id)||m.has(o.id))throw Error("invalid/duplicate "+label+" ID");m.set(o.id,o);}return m;};
  const refs=(arr,map,label,empty=false)=>{if(!Array.isArray(arr)||(!empty&&!arr.length)||new Set(arr).size!==arr.length||arr.some(x=>!map.has(x)))throw Error("invalid "+label);return arr.slice();};
  required(story,["audience","purpose","thesis","spine"],"storyboard");
  const evidence=ids(story.evidence,"evidence"), acts=ids(story.acts,"act"),objects=ids(scene?.objects,"object"), cues=ids(scene?.cues,"cue");
  if(cues.size!==acts.size||[...cues.keys()].some(x=>!acts.has(x)))throw Error("cues must match acts");
  for(const e of evidence.values())required(e,["source","definition","limitation"],"evidence "+e.id);
  for(const o of objects.values())required(o,["label","role"],"object "+o.id);
  const output=[];
  for(const a of acts.values()){
    required(a,["question","claim","before","after","visual_task","transition","interaction"],"act "+a.id);
    if(a.before.trim()===a.after.trim())throw Error("act lacks declared cognitive change: "+a.id);
    const links=refs(a.evidence_ids,evidence,"evidence links");
    const c=cues.get(a.id);
    required(c,["nextDecision","transitionReason","staticReading","scopeLabel"],"cue "+a.id);
    if(!["observation","hypothesis","assumption","scenario","decision","question"].includes(c.claimStatus))throw Error("missing claim status");
    const visible=refs(c.visible,objects,"visible objects"), focus=refs(c.focus,objects,"focus objects");
    if(focus.some(x=>!visible.includes(x)))throw Error("focus not visible");
    if(!["cut","reveal","focus","compare","state-change"].includes(c.transitionKind))throw Error("unsupported transition kind");
    if(!Number.isInteger(c.holdMs)||c.holdMs<1000||c.holdMs>120000)throw Error("invalid hold duration");
    if(c.transitionKind==="state-change"&&!nonempty(c.stateMeaning))throw Error("state-change needs semantic payload");
    output.push({...a,evidence_ids:links,cue:{...c,visible,focus}});
  }
  if(scene.modePolicy!=="shared-context")throw Error("only explicit shared-context mode supported");
  // Snapshot authored inputs; host owns calculations and maps semantic object IDs to render layers.
  return JSON.parse(JSON.stringify({version:"0.1",audience:story.audience,purpose:story.purpose,thesis:story.thesis,spine:story.spine,acts:output,evidence:[...evidence.values()],objects:[...objects.values()],modePolicy:scene.modePolicy}));
}

export function initialDirector(plan,contextRevision="initial",reducedMotion=false) {
  if(typeof contextRevision!=="string"||!contextRevision.trim()||typeof reducedMotion!=="boolean")throw Error("invalid context or motion preference");
  if(!plan?.acts?.length)throw Error("missing compiled plan");
  return {index:0,mode:"director",playing:false,inspection:null,contextRevision,reducedMotion,epoch:0};
}

export function reduceDirector(plan,state,action) {
  if(!action||typeof action.type!=="string")throw Error("invalid action");
  const n=plan.acts.length;
  const pause=(patch={})=>({...state,...patch,playing:false,epoch:state.epoch+1});
  const go=(index,playing=false)=>({...state,index,inspection:null,playing,epoch:state.epoch+1});
  switch(action.type){
    case "next": return state.mode!=="director"?state:go(Math.min(n-1,state.index+1));
    case "previous": return state.mode!=="director"?state:go(Math.max(0,state.index-1));
    case "seek": {const index=plan.acts.findIndex(a=>a.id===action.actId);if(index<0)throw Error("unknown act");return state.mode==="director"?go(index):state;}
    case "play": return state.mode!=="director"||state.reducedMotion||state.index===n-1?state:{...state,playing:true,inspection:null,epoch:state.epoch+1};
    case "pause": return pause();
    case "tick": return state.mode!=="director"||!state.playing||action.epoch!==state.epoch?state:go(Math.min(n-1,state.index+1),state.index+1<n-1);
    case "inspect": if(state.mode!=="director"||!plan.acts[state.index].cue.visible.includes(action.objectId))throw Error("object unavailable for inspection");return pause({inspection:action.objectId});
    case "clear-inspection": return pause({inspection:null});
    case "mode": if(!["director","explorer"].includes(action.mode))throw Error("unknown mode");return action.mode===state.mode?state:pause({mode:action.mode,inspection:null});
    case "context": if(typeof action.revision!=="string"||!action.revision.trim())throw Error("invalid context revision");return pause({contextRevision:action.revision,inspection:null});
    case "motion": if(typeof action.reduced!=="boolean")throw Error("invalid preference");return pause({reducedMotion:action.reduced});
    case "reset": return {...initialDirector(plan,state.contextRevision,state.reducedMotion),epoch:state.epoch+1};
    default: throw Error("unknown action "+action.type);
  }
}

export function directorView(plan,state) {
  const act=plan.acts[state.index],c=act.cue;
  const evidence=plan.evidence.filter(e=>act.evidence_ids.includes(e.id));
  return {mode:state.mode,actId:act.id,step:state.index+1,total:plan.acts.length,question:act.question,claim:act.claim,claimStatus:c.claimStatus,before:act.before,after:act.after,decision:c.nextDecision,scopeLabel:c.scopeLabel,contextRevision:state.contextRevision,visible:c.visible.slice(),narrativeFocus:c.focus.slice(),inspection:state.inspection,evidence,transition:state.reducedMotion?"cut":c.transitionKind,transitionReason:c.transitionReason,stateMeaning:c.stateMeaning??null,staticReading:c.staticReading,playing:state.playing,nextTimer:state.playing?{epoch:state.epoch,delayMs:c.holdMs}:null,canPrevious:state.mode==="director"&&state.index>0,canNext:state.mode==="director"&&state.index<plan.acts.length-1};
}

export function staticDirectorOutline(plan) {
  return {thesis:plan.thesis,acts:plan.acts.map(a=>({id:a.id,question:a.question,claim:a.claim,status:a.cue.claimStatus,scope:a.cue.scopeLabel,reading:a.cue.staticReading,nextDecision:a.cue.nextDecision,evidence:plan.evidence.filter(e=>a.evidence_ids.includes(e.id))}))};
}
