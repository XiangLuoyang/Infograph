import {buildReferenceHTML} from './reference-renderer.mjs';
import {compileReference} from './reference-scene.mjs';

// Converts a compiled VMI plan, not an unreviewed concept. Geometry is
// preserved; richer assets and physical motion are not inferred.
export function bridgeVmiReference(plan,{viewport='desktop'}={}){
 const dimensions={desktop:[800,440],mobile:[360,620]};
 if(!Object.hasOwn(dimensions,viewport)||!plan?.semantic||!plan?.scene)throw Error('compiled VMI plan and supported viewport required');
 const [width,height]=dimensions[viewport],{semantic,scene}=plan;
 const semanticObjects=new Map(semantic.objects.map(o=>[o.id,o]));
 const ids=new Map();
 const objects=scene.objects.map((o,i)=>{
  const s=semanticObjects.get(o.id);
  if(!s||ids.has(o.id))throw Error('unresolved or duplicate semantic object');
  const id='object-'+(i+1);ids.set(o.id,id);
  return {id,role:'entity',label:s.label,bounds:o[viewport].map((v,j)=>v/(j%2?height:width)),depth:1,provenance:'authored',sourceNote:semantic.evidenceRef,essential:true,fidelity:'flat',dynamic:false,ports:{center:[.5,.5]}};
 });
 if(ids.size!==semanticObjects.size)throw Error('semantic coverage mismatch');
 const byId=new Map(objects.map(o=>[o.id,o]));
 const links=semantic.mappings.map((m,i)=>{
  const a=byId.get(ids.get(m.from)),b=byId.get(ids.get(m.to));
  if(!a||!b||a===b)throw Error('invalid relation endpoints');
  const port='edge-'+(i+1);
  a.ports[port]=boundaryPort(a.bounds,b.bounds);
  b.ports[port]=boundaryPort(b.bounds,a.bounds);
  return {id:'link-'+(i+1),from:{object:a.id,port},to:{object:b.id,port},kind:'association'};
 });
 const visible=[...objects.map(o=>o.id),...links.map(l=>l.id)];
 const manifest={source:{kind:'synthetic',id:'vmi-'+semantic.conceptId,width,height},objects,links,scenes:[{id:'overview',intent:scene.staticSummary,visible}],staticScene:'overview'};
 const compiled=compileReference(manifest);
 return {manifest,compiled,semantic:structuredClone(semantic),identity:[...ids].map(([sourceId,referenceId])=>({sourceId,referenceId})),primitiveAssets:scene.objects.map(o=>({referenceId:ids.get(o.id),shapes:structuredClone(o.shapes)})),design:structuredClone(plan.design),stateDescriptions:structuredClone(scene.states),limitations:['bounding-box ports are schematic, not physical attachment points','SVG primitives retained as asset instructions, not rendered','state highlights and waypoints require runtime adapter','no inferred material or physical motion'],rendered:false,releaseAuthorized:false};
}

export function renderVmiReferencePreview(plan,{viewport='desktop'}={}){
 const bridge=bridgeVmiReference(plan,{viewport});
 const primitiveAssets=Object.fromEntries(bridge.primitiveAssets.map(a=>[a.referenceId,{shapes:a.shapes,colors:bridge.design.colors}]));
 const result=buildReferenceHTML(bridge.manifest,{primitiveAssets,designDNA:bridge.design,title:plan.scene.title,description:plan.scene.staticSummary});
 return {...result,bridge,limitations:[...bridge.limitations.filter(x=>!x.startsWith('SVG primitives retained')),'state runtime and advanced material styling not yet adapted'],releaseAuthorized:false};
}

export function boundaryPort(a,b){
 const dx=(b[0]+b[2]/2)-(a[0]+a[2]/2),dy=(b[1]+b[3]/2)-(a[1]+a[3]/2);
 if(![dx,dy,a[2],a[3]].every(Number.isFinite)||a[2]<=0||a[3]<=0)throw Error('invalid boundary geometry');
 const scale=Math.max(Math.abs(dx)/a[2],Math.abs(dy)/a[3]);
 if(scale<1e-12)throw Error('coincident object centers require explicit ports');
 const clamp=v=>Math.max(0,Math.min(1,v));
 return [clamp(.5+dx/a[2]/scale*.5),clamp(.5+dy/a[3]/scale*.5)];
}
