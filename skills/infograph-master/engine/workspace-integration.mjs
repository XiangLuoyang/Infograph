import {compileDirector,initialDirector,reduceDirector,directorView} from './narrative-director.mjs';
import {compileChoreography,choreographyInitial,choreographyGo,choreographyFrame,directorChoreographyRequest} from './interaction-choreography.mjs';
import {compileConceptArt,reviewConceptArt} from './concept-art-pipeline.mjs';
import {compileMotionCompleteness,sampleIllustrativeMotion,reviewMotionCompleteness} from './motion-completeness.mjs';
import {compileSpatialComposition,selectSpatialTier,auditSpatialReview} from './global-spatial-composition.mjs';
import {auditQualityDepth} from './quality-depth.mjs';

export function compileWorkspace(spec){
 const assert=(b,m)=>{if(!b)throw Error(m)},txt=x=>typeof x==="string"&&x.trim().length>0;
 assert(txt(spec?.revision)&&txt(spec.contextRevision)&&spec.scopePolicy==="pinned","V0.1 requires explicit pinned evidence context");
 const director=compileDirector(spec.story,spec.scene),choreography=compileChoreography(spec.choreography),concept=compileConceptArt(spec.concept),motion=compileMotionCompleteness(spec.motion,concept,choreography),spatial=compileSpatialComposition(spec.atlas,spec.spatial);
 const ids=new Set(director.objects.map(o=>o.id)), semantic=new Set(spec.concept.semanticObjects.map(o=>o.id));
 assert(ids.size===semantic.size&&[...ids].every(x=>semantic.has(x)),"P1/P3 semantic identity mismatch");
 const evidence=new Map(director.evidence.map(e=>[e.id,e]));
 for(const e of choreography.evidence){const d=evidence.get(e.id);assert(d&&d.source===e.source&&d.limitation===e.limitation,"P1/P2 evidence mismatch "+e.id)}
 const actBindings=spec.actBindings,sceneBindings=spec.sceneBindings;
 assert(actBindings&&Object.keys(actBindings).length===director.acts.length&&sceneBindings&&Object.keys(sceneBindings).length===director.acts.length,"act bindings incomplete");
 for(const a of director.acts){
  const state=choreography.states.find(s=>s.id===actBindings[a.id]),scene=concept.scenes.find(s=>s.id===sceneBindings[a.id]);
  assert(state&&scene,"unbound act "+a.id);
  assert(a.cue.claimStatus===state.status&&a.cue.scopeLabel===state.scope&&a.claim===state.reading,"P1/P2 claim/status/scope mismatch "+a.id);
  assert(a.evidence_ids.length===state.evidenceIds.length&&a.evidence_ids.every(x=>state.evidenceIds.includes(x)),"P1/P2 act evidence mismatch");
  for(const id of a.cue.visible)assert(concept.layers.some(l=>l.semanticIds.includes(id)&&scene.visible.includes(l.id)&&l.role!=="label"),"visible object lacks scene layer "+id);
 }
 const mapped=new Set();
 for(const j of motion.jobs.filter(j=>j.driver==="transition")){
  const channel=choreography.channels.find(c=>c.key===j.channel),layer=concept.layers.find(l=>l.id===j.layerId);
  assert(channel&&layer&&layer.semanticIds.includes(channel.objectId),"P2/P3/P4 semantic mismatch "+j.channel);
  mapped.add(j.channel);
 }
 for(const t of choreography.transitions)for(const tr of t.tracks)assert(mapped.has(tr.channel),"unbound P2 channel "+tr.channel);
 const directorPage=spatial.pages.find(p=>p.id===spec.routes?.director?.pageId),explorerPage=spatial.pages.find(p=>p.id===spec.routes?.explorer?.pageId);
 assert(directorPage?.purpose==="presentation"&&explorerPage&&explorerPage.id!==directorPage.id,"distinct director/explorer routes required");
 for(const r of Object.values(spec.routes))assert(spatial.pages.some(p=>p.id===r.pageId&&p.sliceOrder.includes(r.sliceId)),"invalid route slice");
 const issues=[...concept.issues.map(x=>({stage:"P3",...x})),...motion.issues.map(x=>({stage:"P4",...x})),...spatial.issues.map(x=>({stage:"P5",...x}))];
 return {revision:spec.revision,contextRevision:spec.contextRevision,director,choreography,concept,motion,spatial,actBindings:{...actBindings},sceneBindings:{...sceneBindings},routes:JSON.parse(JSON.stringify(spec.routes)),issues,planningReady:concept.productionDeclaredReady&&motion.complete&&spatial.planningReady,rendered:false,releaseAuthorized:false};
}

export function initialWorkspace(plan,{width,height,reducedMotion=false}){
 const director=initialDirector(plan.director,plan.contextRevision,reducedMotion),view=directorView(plan.director,director);
 return {director,choreography:choreographyInitial(plan.choreography,plan.actBindings[view.actId],plan.contextRevision,reducedMotion),tier:selectSpatialTier(plan.spatial,width,height),lastTime:0};
}

export function dispatchWorkspace(plan,state,action,nowMs){
 if(!Number.isFinite(nowMs)||nowMs<state.lastTime)throw Error("monotonic clock required");
 if(action.type==="context"&&action.revision!==plan.contextRevision)throw Error("pinned scope: recompile claims before context change");
 if(action.type==="viewport")return {...state,tier:selectSpatialTier(plan.spatial,action.width,action.height),lastTime:nowMs};
 const before=directorView(plan.director,state.director),director=reduceDirector(plan.director,state.director,action),after=directorView(plan.director,director);
 const request=directorChoreographyRequest(before,after,plan.actBindings,nowMs);
 let choreography=state.choreography;
 if(request)choreography=choreographyGo(plan.choreography,choreography,{...request,reducedMotion:director.reducedMotion});
 if(["pause","inspect","motion","reset"].includes(action.type))choreography=choreographyGo(plan.choreography,choreography,{to:plan.actBindings[after.actId],nowMs,cut:true,reducedMotion:director.reducedMotion});
 return {...state,director,choreography,lastTime:nowMs};
}

export function workspaceFrame(plan,state,nowMs){
 if(!Number.isFinite(nowMs)||nowMs<state.lastTime)throw Error("monotonic clock required");
 const narrative=directorView(plan.director,state.director),motion=choreographyFrame(plan.choreography,state.choreography,nowMs),route=plan.routes[narrative.mode],scene=plan.concept.scenes.find(s=>s.id===plan.sceneBindings[narrative.actId]);
 const layout=plan.spatial.layouts.find(l=>l.sliceId===route.sliceId&&l.tierId===state.tier);
 const illustrative=sampleIllustrativeMotion(plan.motion,{stateId:motion.targetId,elapsedMs:nowMs,paused:!narrative.playing||narrative.mode!=="director",reducedMotion:state.director.reducedMotion});
 return {narrative,motion,illustrative,route,layout,scene,contextRevision:plan.contextRevision,rendered:false};
}

export function auditWorkspace(plan,{revision,outputSha,quality,conceptRecords=[],motionRecords=[],spatialObservations=[]}){
 if(revision!==plan.revision||!(/^[a-f0-9]{64}$/.test(outputSha??"")))throw Error("stale revision or invalid output hash");
 const depth=auditQualityDepth(quality);
 const art=reviewConceptArt(plan.concept,{outputSha,records:conceptRecords});
 const motion=reviewMotionCompleteness(plan.motion,{outputSha,records:motionRecords});
 const spatial=auditSpatialReview(plan.spatial,{outputSha,observations:spatialObservations});
 // Require applicable depth reviews plus explicit output-bound references.
 const bound=quality.substantial===true&&quality.areas.every(a=>!a.applicable||a.review?.ref?.includes(outputSha));
 return {planningReady:plan.planningReady,depth,art,motion,spatial,complete:plan.planningReady&&bound&&depth.depthComplete===true&&art.complete&&motion.complete&&spatial.complete,releaseAuthorized:false,scope:"declared evidence and cross-module contracts; no automatic human approval"};
}
