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
 const links=semantic.mappings.map((m,i)=>({id:'link-'+(i+1),from:{object:ids.get(m.from),port:'center'},to:{object:ids.get(m.to),port:'center'},kind:'association'}));
 const visible=[...objects.map(o=>o.id),...links.map(l=>l.id)];
 const manifest={source:{kind:'synthetic',id:'vmi-'+semantic.conceptId,width,height},objects,links,scenes:[{id:'overview',intent:scene.staticSummary,visible}],staticScene:'overview'};
 const compiled=compileReference(manifest);
 return {manifest,compiled,semantic:structuredClone(semantic),identity:[...ids].map(([sourceId,referenceId])=>({sourceId,referenceId})),primitiveAssets:scene.objects.map(o=>({referenceId:ids.get(o.id),shapes:structuredClone(o.shapes)})),design:structuredClone(plan.design),stateDescriptions:structuredClone(scene.states),limitations:['center ports are provisional','SVG primitives retained as asset instructions, not rendered','state highlights and waypoints require runtime adapter','no inferred material or physical motion'],rendered:false,releaseAuthorized:false};
}

export function renderVmiReferencePreview(plan,{viewport='desktop'}={}){
 const bridge=bridgeVmiReference(plan,{viewport});
 const primitiveAssets=Object.fromEntries(bridge.primitiveAssets.map(a=>[a.referenceId,{shapes:a.shapes,colors:bridge.design.colors}]));
 const result=buildReferenceHTML(bridge.manifest,{primitiveAssets,title:plan.scene.title,description:plan.scene.staticSummary});
 return {...result,bridge,limitations:[...bridge.limitations.filter(x=>!x.startsWith('SVG primitives retained')),'reference shell palette and state runtime not yet adapted'],releaseAuthorized:false};
}
