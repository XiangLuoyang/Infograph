// Routing is a production decision, not a claim of visual quality.
export function routeVisualFidelity(requirements,capabilities={}){
 const available={svg:true,css:true,raster:false,webgl:false,...capabilities};
 if(!Array.isArray(requirements))throw Error('visual requirements array required');
 const seen=new Set();
 return requirements.map(r=>{
  if(typeof r.objectId!=='string'||!r.objectId.trim()||seen.has(r.objectId))throw Error('invalid or duplicate object identity');
  seen.add(r.objectId);
  if(!['flat','surface','photoreal','spatial'].includes(r.fidelity)||typeof r.dynamic!=='boolean'||typeof r.reason!=='string'||!r.reason.trim()||typeof r.evidenceRef!=='string'||!r.evidenceRef.trim())throw Error('explicit visual requirement and provenance required');
  const renderer={flat:'svg',surface:'css',photoreal:r.dynamic?'webgl':'raster',spatial:'webgl'}[r.fidelity];
  const workOrders=[];
  if(!available[renderer])workOrders.push({kind:'renderer-capability',renderer});
  if(renderer==='raster')workOrders.push({kind:'verified-raster-asset',objectId:r.objectId});
  if(renderer==='webgl')workOrders.push({kind:'validated-geometry-material',objectId:r.objectId});
  if(renderer==='css')workOrders.push({kind:'surface-design',objectId:r.objectId});
  return {objectId:r.objectId,fidelity:r.fidelity,renderer,reason:r.reason,evidenceRef:r.evidenceRef,dynamic:r.dynamic,workOrders,status:workOrders.length?'production-required':'route-ready',rendered:false,releaseAuthorized:false};
 });
}
