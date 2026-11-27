import {createHash} from 'node:crypto';
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

 // Intake validates declared production records, not asset bytes or visual quality.
export function auditVisualProduction(routes,records=[]){
 if(!Array.isArray(routes)||!Array.isArray(records))throw Error('routes and records required');
 const required=new Map();
 for(const r of routes)for(const w of r.workOrders)required.set(r.objectId+'/'+w.kind,{objectId:r.objectId,...w});
 const accepted=new Map();
 for(const r of records){
  const key=r.objectId+'/'+r.kind;
  if(!required.has(key)||accepted.has(key))throw Error('unknown or duplicate production record');
  if(typeof r.artifactRef!=='string'||!r.artifactRef.trim()||typeof r.evidenceRef!=='string'||!r.evidenceRef.trim()||!['produced','blocked'].includes(r.status))throw Error('invalid production provenance');
  if(r.status==='produced'&&!/^[a-f0-9]{64}$/.test(r.sha256??''))throw Error('produced artifact digest required');
  accepted.set(key,structuredClone(r));
 }
 const ledger=[...required].map(([key,order])=>({...order,record:accepted.get(key)??null,status:accepted.get(key)?.status??'missing'}));
 return {ledger,missing:ledger.filter(x=>x.status==='missing'),blocked:ledger.filter(x=>x.status==='blocked'),declaredComplete:ledger.every(x=>x.status==='produced'),verified:false,rendered:false,releaseAuthorized:false};
}

 // Caller supplies actual bytes; no implicit filesystem or network access.
export function verifyVisualProduction(audit,artifacts){
 if(!(artifacts instanceof Map)||!Array.isArray(audit?.ledger))throw Error('production ledger and artifact byte map required');
 const ledger=audit.ledger.map(entry=>{
  const r=entry.record;
  if(entry.status!=='produced'||!r)return {...entry,verification:'not-produced'};
  const bytes=artifacts.get(r.artifactRef);
  if(!(bytes instanceof Uint8Array)||bytes.byteLength===0)return {...entry,verification:'missing-bytes'};
  const actualSha256=createHash('sha256').update(bytes).digest('hex');
  return {...entry,actualSha256,verification:actualSha256===r.sha256?'digest-match':'digest-mismatch'};
 });
 return {ledger,verified:ledger.every(x=>x.verification==='digest-match'),formatVerified:false,rendered:false,releaseAuthorized:false};
}
