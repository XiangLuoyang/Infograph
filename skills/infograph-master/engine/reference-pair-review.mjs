import {createHash} from 'node:crypto';
import {compileReference} from './reference-scene.mjs';
const assert=(v,m)=>{if(!v)throw Error(m)};
const hex=v=>typeof v==='string'&&/^[0-9a-f]{64}$/.test(v);
const str=v=>typeof v==='string'&&v.trim().length>0;
const bound=b=>Array.isArray(b)&&b.length===4&&b.every(Number.isFinite)&&b[0]>=0&&b[1]>=0&&b[2]>0&&b[3]>0&&b[0]+b[2]<=1+1e-8&&b[1]+b[3]<=1+1e-8;
const policyDefault={minIoU:.65,maxCenterShift:.05,maxAreaRatio:1.5};
export function imageHash(bytes){return createHash('sha256').update(bytes).digest('hex')}
export function compareBounds(a,b){
 assert(bound(a)&&bound(b),'invalid normalized bounds');
 const intersection=Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));
 const aa=a[2]*a[3],ba=b[2]*b[3];
 return {iou:intersection/(aa+ba-intersection),centerShift:Math.hypot(a[0]+a[2]/2-b[0]-b[2]/2,a[1]+a[3]/2-b[1]-b[3]/2),areaRatio:ba/aa};
}
const dimensions=['semantic','geometry','hierarchy','material','lighting','interaction','accessibility','aesthetics'];
const routing={semantic:'semantic model / evidence',geometry:'geometry / layout / camera',hierarchy:'composition / typography',material:'surface / asset / renderer',lighting:'lighting / environment / shadow',interaction:'scene controller / anchor binding',accessibility:'label layout / contrast / keyboard / fallback',aesthetics:'art direction / human review'};
function annotationMap(a,known,side){
 assert(a&&hex(a.imageSha256)&&str(a.sceneId)&&str(a.annotator)&&str(a.method)&&Array.isArray(a.objects)&&Array.isArray(a.links),'invalid '+side+' annotation');
 const map=new Map(),links=new Map();
 for(const o of a.objects){assert(o&&known.objects.has(o.id)&&!map.has(o.id)&&bound(o.bounds)&&['visible-ink','container','authored-region'].includes(o.basis)&&['visible','partial','occluded'].includes(o.visibility)&&str(o.note),'invalid '+side+' object annotation');map.set(o.id,o)}
 for(const l of a.links){assert(l&&known.links.has(l.id)&&!links.has(l.id)&&str(l.from)&&str(l.to)&&str(l.note),'invalid '+side+' link annotation');links.set(l.id,l)}
 return {map,links};
}
export function reviewReferencePair({manifest,reference,candidate,referenceBytes,candidateBytes,observations=[],policy={}}){
 const plan=compileReference(manifest,{raster:true,webgl:true});
 assert(referenceBytes instanceof Uint8Array&&candidateBytes instanceof Uint8Array,'paired image bytes required');
 assert(imageHash(referenceBytes)===reference.imageSha256&&imageHash(candidateBytes)===candidate.imageSha256,'image hash mismatch');
 if(manifest.source.kind==='image')assert(manifest.source.sha256===reference.imageSha256,'reference does not match manifest source');
 assert(reference.sceneId===candidate.sceneId,'different narrative states');
 const scene=plan.scenes.find(s=>s.id===reference.sceneId);assert(scene,'unknown state');
 const p={...policyDefault,...policy};assert(Object.keys(p).every(k=>Object.hasOwn(policyDefault,k))&&Number.isFinite(p.minIoU)&&p.minIoU>0&&p.minIoU<=1&&Number.isFinite(p.maxCenterShift)&&p.maxCenterShift>=0&&p.maxCenterShift<=1&&Number.isFinite(p.maxAreaRatio)&&p.maxAreaRatio>=1&&p.maxAreaRatio<=10,'invalid review policy');
 const known={objects:new Set(plan.objects.map(o=>o.id)),links:new Set(plan.links.map(l=>l.id))},r=annotationMap(reference,known,'reference'),c=annotationMap(candidate,known,'candidate'),issues=[],metrics=[],ledger=[];
 const visible=new Set(scene.visible);
 const issue=(objectId,dimension,severity,note)=>issues.push({objectId,dimension,severity,note,repairScope:routing[dimension]});
 for(const o of plan.objects.filter(x=>visible.has(x.id))){
  const a=r.map.get(o.id),b=c.map.get(o.id),severity=o.essential?'blocking':'review';
  if(!a){issue(o.id,'geometry','unverified','reference annotation missing');continue}
  if(!b){issue(o.id,'semantic',severity,'candidate object not annotated; inspect whether absent or unobserved');continue}
  if(a.visibility!==b.visibility)issue(o.id,'hierarchy',severity,'visibility differs: '+a.visibility+' → '+b.visibility);
  if(a.basis!==b.basis||a.visibility==='occluded'||b.visibility==='occluded'){issue(o.id,'geometry','unverified','bounds not comparable: annotation basis or occlusion differs');continue}
  const m=compareBounds(a.bounds,b.bounds);metrics.push({objectId:o.id,basis:a.basis,...m});
  if(m.iou<p.minIoU||m.centerShift>p.maxCenterShift||m.areaRatio>p.maxAreaRatio||m.areaRatio<1/p.maxAreaRatio)issue(o.id,'geometry',severity,'region displacement or scale exceeds declared tolerance');
 }
 for(const [side,x] of [['reference',r],['candidate',c]])for(const id of [...x.map.keys(),...x.links.keys()])if(!visible.has(id))issue(id,'semantic',side==='candidate'?'blocking':'unverified',side+' annotation includes object outside declared state');
 for(const l of plan.links.filter(x=>visible.has(x.id))){
  const a=r.links.get(l.id),b=c.links.get(l.id);
  if(!a||!b){issue(l.id,'semantic',!a?'unverified':'blocking','link annotation missing');continue}
  for(const [side,v] of [['reference',a],['candidate',b]])if(v.from!==l.from.object||v.to!==l.to.object)issue(l.id,'semantic',side==='candidate'?'blocking':'unverified',side+' link endpoint mismatch');
 }
 const seen=new Set();
 for(const o of observations){
  assert(o&&dimensions.includes(o.dimension)&&(o.objectId==='@scene'||known.objects.has(o.objectId)||known.links.has(o.objectId))&&['pass','fail','not-run'].includes(o.status)&&['human','model','instrument'].includes(o.reviewerType)&&str(o.reviewer)&&str(o.note)&&Array.isArray(o.evidence)&&o.evidence.length>0&&o.evidence.every(str),'invalid review observation');
  assert(o.objectId==='@scene'||visible.has(o.objectId),'observation not in reviewed state');
  assert(o.referenceSha256===reference.imageSha256&&o.candidateSha256===candidate.imageSha256,'stale observation image binding');
  const key=o.objectId+'/'+o.dimension;assert(!seen.has(key),'duplicate observation');seen.add(key);ledger.push({...o});
  if(o.status==='fail')issue(o.objectId,o.dimension,'blocking',o.note);
 }
 // Require scene-level actual human judgments of visual quality; machine region measurements cannot fill them.
 const required=['semantic','geometry','hierarchy','material','lighting','accessibility','aesthetics','interaction'];
 for(const d of required){
  const o=ledger.find(x=>x.objectId==='@scene'&&x.dimension===d);
  if(!o||o.status==='not-run'||(['aesthetics','hierarchy','material','lighting'].includes(d)&&o.reviewerType!=='human'))issue('@scene',d,'unverified','required scene-level review evidence missing or insufficient');
 }
 const status=issues.some(x=>x.severity==='blocking')?'repair-required':issues.length?'review-required':'review-recorded';
 return {version:1,sceneId:scene.id,referenceSha256:reference.imageSha256,candidateSha256:candidate.imageSha256,policy:p,metrics,issues,observations:ledger,status,releaseReady:false,scope:'annotated region/relationship comparison; no automatic image understanding, pixel equivalence, or aesthetic certification'};
}
