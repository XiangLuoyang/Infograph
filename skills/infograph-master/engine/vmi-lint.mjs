import {styleIssues,sceneDimensions,validSceneBox,validHex,contrastRatio} from '../visual-metaphor-intelligence/engine/scene-contract.mjs';
// Narrow, opt-in repair policy. No evidence, semantic mappings or capability decisions are rewritten.
const own=(x,k)=>Object.hasOwn(x,k);
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
const rgb=h=>h.slice(1).match(/../g).map(x=>parseInt(x,16));
const hex=a=>'#'+a.map(x=>x.toString(16).padStart(2,'0')).join('');
function lineCandidate(line,surface){
 if(!validHex(line)||!validHex(surface)||contrastRatio(line,surface)>=3)return null;
 const a=rgb(line),options=[];
 for(const endpoint of [0,255])for(let t=1;t<=255;t++){
  const b=a.map(v=>Math.round(v+(endpoint-v)*t/255));
  const max=Math.max(...b.map((v,i)=>Math.abs(v-a[i])));
  if(max>48)break;
  const color=hex(b);
  if(contrastRatio(color,surface)>=3){options.push({color,max,distance:b.reduce((sum,v,i)=>sum+(v-a[i])**2,0)});break}
 }
 options.sort((a,b)=>a.distance-b.distance||a.max-b.max||a.color.localeCompare(b.color));
 return options[0]?.color??null;
}
const overlap=(a,b)=>Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[1]+a[3]+28,b[1]+b[3]+28)-Math.max(a[1],b[1]));
function roundingCandidate(b,d){
 if(!Array.isArray(b)||b.length!==4||!b.every(Number.isFinite)||b[2]<36||b[3]<36||b[2]>d[0]||b[3]>d[1]-28)return null;
 const [x,y,w,h]=b,clamp=(v,max)=>Math.min(Math.max(0,v),max);
 const next=[clamp(x,d[0]-w),clamp(y,d[1]-28-h),w,h];
 return Math.max(Math.abs(next[0]-x),Math.abs(next[1]-y))<=0.1&&validSceneBox(next,d)?next:null;
}
function inspect(p,prefix,apply,changes){
 const issues=[],add=(path,code,message,details={})=>issues.push({path:prefix+path,code,message,...details});
 if(!object(p)){add('','packet.type','packet must be an object');return issues}
 if(['sceneDraft','styleDrafts','activationDraft'].some(k=>own(p,k))){add('','packet.compact','construct compact input with vmi-author first');return issues}
 const selected=Array.isArray(p.concepts)?p.concepts.filter(c=>c?.id===p.selectedConceptId):[];
 const c=selected.length===1?selected[0]:null;
 if(!c){add('selectedConceptId','packet.selection','select exactly one authored concept');return issues}
 if(!Array.isArray(p.styles)||!p.styles.length||p.styles.length>4)add('styles','style.coverage','author 1–4 styles');
 else for(const [i,s] of p.styles.entries()){
  const path='styles['+i+'].',initial=styleIssues(s,c);
  const eligible=s?.mode==='variant'&&initial.length===1&&initial[0].code==='style.contrast'&&initial[0].foreground==='line';
  if(eligible){
   const before=s.colors.line,after=lineCandidate(before,s.colors.surface);
   if(after){
    const change={path:prefix+path+'colors.line',before,after,reason:'bounded RGB adjustment toward black or white; variant line role only',contrastBefore:contrastRatio(before,s.colors.surface),contrastAfter:contrastRatio(after,s.colors.surface)};
    if(apply){s.colors.line=after;changes.push(change)}
    else initial[0].proposal=change;
   }
  }
  const current=apply?styleIssues(s,c):initial;
  for(const {path:k,code,message,...details} of current)add(path+k,code,message,details);
 }
 const sc=p.scene;
 if(!object(sc)||!Array.isArray(sc.objects)||!sc.objects.length){add('scene','scene.coverage','author a scene with objects');return issues}
 if(sc.composition!==undefined){
  if(sc.objects.some(o=>object(o)&&(own(o,'desktop')||own(o,'mobile')))||Object.keys(sc.waypoints??{}).length||(Array.isArray(sc.physicalTopology?.links)&&sc.physicalTopology.links.some(l=>object(l)&&own(l,'waypoints'))))add('scene.composition','scene.mixed-layout','automatic layout cannot mix authored coordinates or waypoints');
  return issues; // Actual candidate feasibility is decided by the canonical compiler.
 }
 const eligible=c.quantitativeGeometry===false&&!own(sc,'waypoints')&&!own(sc,'physicalTopology')&&!own(sc,'dynamicBindings');
 for(const [tier,d] of Object.entries(sceneDimensions)){
  const boxes=sc.objects.map(o=>o?.[tier]);
  const next=boxes.map(b=>validSceneBox(b,d)?b:eligible?roundingCandidate(b,d):null);
  const safe=eligible&&next.every(b=>b!==null)&&next.every((b,i)=>next.every((q,j)=>i===j||overlap(b,q)<=overlap(boxes[i],boxes[j])+1e-9));
  for(const [i,b] of boxes.entries()){
   if(validSceneBox(b,d))continue;
   const path='scene.objects['+i+'].'+tier,proposal=safe?{path:prefix+path,before:b,after:next[i],reason:'qualitative unrouted scene: at most 0.1px origin correction; size and overlap preserved'}:null;
   if(apply&&proposal){sc.objects[i][tier]=next[i];changes.push(proposal);continue}
   add(path,'scene.box','invalid '+tier+' box',{objectId:sc.objects[i]?.id??null,actual:b??null,canvas:d,labelReserve:28,minSize:36,...(proposal?{proposal}:{})});
  }
 }
 return issues;
}
export function lintVmiPacket(input,{apply=false}={}){
 const packet=structuredClone(input),changes=[];
 const issues=object(packet)&&own(packet,'scenes')?
  (!Array.isArray(packet.scenes)||!packet.scenes.length||packet.scenes.length>8||['scene','styles','activation','sceneDraft','styleDrafts','activationDraft'].some(k=>own(packet,k))?
   [{path:'scenes',code:'packet.batch',message:'invalid or mixed batch packet'}]:packet.scenes.flatMap((p,i)=>inspect(p,'scenes['+i+'].',apply,changes))):inspect(packet,'',apply,changes);
 return {packet,report:{status:issues.length?'blocked':'checked',issues,changes,applied:apply,compiled:false,releaseAuthorized:false,scope:'partial deterministic authoring checks; canonical compiler, activation and independent review remain required'}};
}
