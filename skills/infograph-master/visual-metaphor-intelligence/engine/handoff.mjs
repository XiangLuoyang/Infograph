import {compileReference} from "../../engine/reference-scene.mjs";

export function planReferenceHandoff(plan,requirements,capabilities){
 const txt=x=>typeof x==="string"&&x.trim().length>0;
 if(!plan?.semantic||!plan.scene||!Array.isArray(requirements)||requirements.length!==plan.semantic.objects.length||new Set(requirements.map(r=>r.objectId)).size!==requirements.length)throw Error("explicit per-object renderer requirements required");
 const sceneObjects=new Map(plan.scene.objects.map(o=>[o.id,o])), ids=new Map(plan.semantic.objects.map((o,i)=>[o.id,"obj"+(i+1)])), req=new Map(requirements.map(r=>[r.objectId,r]));
 const objects=plan.semantic.objects.map((o,i)=>{
  const r=req.get(o.id),s=sceneObjects.get(o.id);if(!r||!s||!["flat","surface","raster","photoreal","spatial","optical"].includes(r.fidelity)||typeof r.dynamic!=="boolean"||!txt(r.reason))throw Error("invalid renderer requirement "+o.id);
  if(r.fidelity==="photoreal"||r.fidelity==="raster")if(!txt(r.assetPlan))throw Error("authored asset plan required");
  const [x,y,w,h]=s.desktop;
  return {id:ids.get(o.id),role:"entity",label:o.label,bounds:[x/800,y/440,w/800,h/440],depth:i,provenance:"authored",sourceNote:"VMI "+o.id+"; "+r.reason,essential:true,fidelity:r.fidelity,dynamic:r.dynamic,ports:{center:[.5,.5]}};
 });
 const links=plan.semantic.mappings.map((m,i)=>({id:"rel"+(i+1),kind:"association",from:{object:ids.get(m.from),port:"center"},to:{object:ids.get(m.to),port:"center"}}));
 const visible=[...objects.map(o=>o.id),...links.map(l=>l.id)];
 const manifest={source:{kind:"synthetic",id:plan.semantic.conceptId,width:800,height:440},objects,links,scenes:plan.semantic.states.map((s,i)=>({id:"state"+(i+1),visible:[...visible],intent:"VMI qualitative state "+s.id})),staticScene:"state1"};
 const referencePlan=compileReference(manifest,capabilities);
 return {manifest,referencePlan,semantic:plan.semantic,objectMap:Object.fromEntries(ids),edgeMap:Object.fromEntries(plan.semantic.mappings.map((m,i)=>[m.id,"rel"+(i+1)])),requirements,styleRef:plan.design.sampleRef,status:"handoff-only",rendered:false,releaseAuthorized:false,limitations:["Centered association links are placeholders; art-direct ports, direction and state highlights before rendering.","Asset/geometry, rights, material, actual state transitions and mobile composition still need authoring.","Backend availability is not visual fidelity. No image generation or automatic WebGL assembly."]};
}
