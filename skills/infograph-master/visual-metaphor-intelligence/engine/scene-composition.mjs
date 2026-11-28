// Candidate-based scene layout; structural preferences are not aesthetic or semantic scoring.
import {compilePhysicalTopology} from "./physical-topology.mjs";
export function proposeSceneComposition(scene,mappings){
 const c=scene.composition;if(c===undefined)return null;
 const ok=(v,m)=>{if(!v)throw Error(m)},txt=x=>typeof x==='string'&&x.trim().length>0;
 const dims={desktop:[800,440],mobile:[360,620]},items=scene.objects;
 ok(c?.version===1&&txt(c.ref)&&txt(c.intent)&&Array.isArray(items)&&items.length>=2&&items.length<=6,'composition requires 2–6 objects and authored intent/evidence');
 ok(c.mode==='auto'||c.mode==='select','invalid composition mode');
 ok(!Object.hasOwn(scene,'compositionManifest')&&items.every(o=>!Object.hasOwn(o,'desktop')&&!Object.hasOwn(o,'mobile')),'automatic composition cannot mix authored coordinates');
 ok(!scene.waypoints||Object.keys(scene.waypoints).length===0,'automatic composition does not accept symbolic waypoints');
 ok(!(scene.physicalTopology?.links??[]).some(l=>l.waypoints!==undefined),'automatic composition does not accept physical waypoints');
 const ids=items.map(o=>o.id),byId=new Map(items.map(o=>[o.id,o]));
 ok(new Set(ids).size===ids.length&&ids.every(txt)&&byId.has(c.focalObject),'invalid composition object identities or focus');
 ok(mappings.every(m=>byId.has(m.from)&&byId.has(m.to)&&m.from!==m.to),'invalid composition mapping endpoints');
 const min=c.minSize??64;ok(Number.isInteger(min)&&min>=48&&min<=120,'minSize must be 48–120');
 const focalScale=c.focalScale??1.3;ok(Number.isFinite(focalScale)&&focalScale>=1.15&&focalScale<=1.6,'focalScale must be 1.15–1.6');
 const rank=new Map(ids.map((id,i)=>[id,i])),degree=new Map(ids.map(id=>[id,0]));
 for(const m of mappings)degree.set(m.to,degree.get(m.to)+1);
 const pending=new Set(ids),order=[];
 while(pending.size){const available=[...pending].filter(id=>degree.get(id)===0).sort((a,b)=>rank.get(a)-rank.get(b));const id=available[0]??[...pending][0];order.push(id);pending.delete(id);for(const m of mappings)if(m.from===id)degree.set(m.to,degree.get(m.to)-1)}
 const round=n=>Math.round(n*10)/10;
 const make=(tier,family)=>{
  const [W,H]=dims[tier],pad=18,gapX=tier==='desktop'?26:24,gapY=18,label=28;
  const n=order.length,cols=family==='row'?n:family==='stack'||family==='stagger'?1:family==='grid2'?2:3;
  const rows=[];for(let j=0;j<n;j+=cols)rows.push(order.slice(j,j+cols));
  const sizes=b=>new Map(order.map(id=>[id,round(b*(id===c.focalObject?focalScale:1))]));
  const rowWidth=(row,z)=>row.reduce((sum,id)=>sum+z.get(id),0)+(row.length-1)*gapX;
  const rowHeight=(row,z)=>Math.max(...row.map(id=>z.get(id)))+label;
  const fit=z=>rows.every(row=>rowWidth(row,z)<=W-2*pad-(family==='stagger'?72:0))&&rows.reduce((sum,row)=>sum+rowHeight(row,z),0)+(rows.length-1)*gapY<=H-2*pad;
  let base=min;if(!fit(sizes(base)))return null;
  for(let b=min+1;b<=(tier==='desktop'?190:132)&&fit(sizes(b));b++)base=b;
  const z=sizes(base),h=rows.reduce((sum,row)=>sum+rowHeight(row,z),0)+(rows.length-1)*gapY,boxes=Object.create(null);let y=(H-h)/2;
  for(const [ri,row] of rows.entries()){
   const max=Math.max(...row.map(id=>z.get(id))),rw=rowWidth(row,z);
   let x=family==='stagger'?(ri%2===0?pad+16:W-pad-16-rw):(W-rw)/2;
   for(const id of row){const size=z.get(id);boxes[id]=[round(x),round(y+(max-size)/2),size,size];x+=size+gapX}
   y+=max+label+gapY;
  }
  return {family,boxes,base,focal:z.get(c.focalObject)};
 };
 // Graph-layer layouts preserve fan-in/fan-out structure; cycles stay on other families.
 const dag=(()=>{const indegree=new Map(ids.map(id=>[id,0])),depth=new Map(ids.map(id=>[id,0]));for(const m of mappings)indegree.set(m.to,indegree.get(m.to)+1);const q=ids.filter(id=>indegree.get(id)===0);let seen=0;while(q.length){const id=q.shift();seen++;for(const m of mappings)if(m.from===id){depth.set(m.to,Math.max(depth.get(m.to),depth.get(id)+1));indegree.set(m.to,indegree.get(m.to)-1);if(indegree.get(m.to)===0)q.push(m.to)}}if(seen!==ids.length)return null;const levels=[];for(const id of order){const d=depth.get(id);(levels[d]??=[]).push(id)}return levels})();
 const focalNeighbors=new Set(mappings.flatMap(m=>m.from===c.focalObject?[m.to]:m.to===c.focalObject?[m.from]:[]));
 const graphLayout=(tier,family)=>{
  const [W,H]=dims[tier],pad=18,gap=24,label=28;
  if(family==='layered'&&(!dag||dag.length<2||!dag.some(l=>l.length>1)))return null;
  if(family==='hub'&&(ids.length<3||focalNeighbors.size!==ids.length-1))return null;
  const sizes=b=>new Map(order.map(id=>[id,round(b*(id===c.focalObject?focalScale:1))]));
  const build=b=>{
   const z=sizes(b),boxes=Object.create(null);
   const set=(id,cx,cy)=>{const s=z.get(id);boxes[id]=[round(cx-s/2),round(cy-s/2),s,s]};
   if(family==='layered'){
    const horizontal=tier==='desktop',layers=dag;
    const main=horizontal?W:H,cross=horizontal?H:W;
    const mainSize=layers.map(l=>Math.max(...l.map(id=>z.get(id)))+(horizontal?0:label));
    const total=mainSize.reduce((a,b)=>a+b,0)+(layers.length-1)*gap;
    if(total>main-2*pad)return null;
    let cursor=(main-total)/2;
    for(let j=0;j<layers.length;j++){
     const layer=layers[j],widths=layer.map(id=>z.get(id)+(horizontal?label:0)),crossTotal=widths.reduce((a,b)=>a+b,0)+(layer.length-1)*gap;
     if(crossTotal>cross-2*pad)return null;
     let other=(cross-crossTotal)/2;
     for(let t=0;t<layer.length;t++){const id=layer[t],s=z.get(id);if(horizontal)set(id,cursor+mainSize[j]/2,other+s/2);else set(id,other+s/2,cursor+(mainSize[j]-label)/2);other+=widths[t]+gap}
     cursor+=mainSize[j]+gap;
    }
   }else{
    // Separate central emphasis from surrounding peers, with fixed readable label strips.
    const others=order.filter(id=>id!==c.focalObject),f=z.get(c.focalObject),cx=W/2,cy=(H-label)/2;
    set(c.focalObject,cx,cy);
    const angles=others.map((_,i)=>-Math.PI/2+2*Math.PI*i/others.length);
    const rx=(W-2*pad-b)/2,ry=(H-2*pad-label-b)/2;
    others.forEach((id,i)=>set(id,cx+rx*Math.cos(angles[i]),cy+ry*Math.sin(angles[i])));
   }
   const rects=ids.map(id=>{const [x,y,w,h]=boxes[id];return [x-4,y-4,x+w+4,y+h+label]});
   if(rects.some(r=>r[0]<0||r[1]<0||r[2]>W||r[3]>H))return null;
   for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const a=rects[i],b=rects[j];if(a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1])return null}
   return {family,boxes,base:b,focal:z.get(c.focalObject)};
  };
  let best=null;for(let b=min;b<=(tier==='desktop'?190:132);b++){const p=build(b);if(p)best=p}
  return best;
 };
 const families={desktop:['row','grid2','grid3','stagger','layered','hub'],mobile:['stack','stagger','grid2','layered','hub']};
 const local=Object.fromEntries(Object.keys(dims).map(k=>[k,families[k].map(f=>['layered','hub'].includes(f)?graphLayout(k,f):make(k,f)).filter(Boolean)]));
 const segments=(pts)=>pts.slice(1).map((p,i)=>[pts[i],p]);
 const dist=([a,b])=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const strictCross=([a,b],[c,d])=>cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0;
 const hitsBox=([a,b],box)=>{const [x,y,w,h]=box,vs=[[x-3,y-3],[x+w+3,y-3],[x+w+3,y+h+25],[x-3,y+h+25]];return vs.some((v,i)=>strictCross([a,b],[v,vs[(i+1)%4]]))||[a,b].some(p=>p[0]>x-3&&p[0]<x+w+3&&p[1]>y-3&&p[1]<y+h+25)};
 const metrics=(k,boxes,topology)=>{
  const physical=new Map(topology.map(t=>[t.edgeId,t.routes[k].points]));
  const center=b=>[b[0]+b[2]/2,b[1]+b[3]/2];
  const ray=(box,other,pad)=>{const p=center(box),dx=other[0]-p[0],dy=other[1]-p[1],s=1/Math.max(Math.abs(dx)/(box[2]/2+pad),Math.abs(dy)/(box[3]/2+pad));return [p[0]+dx*s,p[1]+dy*s]};
  const lines=mappings.map(m=>{const a=boxes[m.from],b=boxes[m.to];return {m,physical:physical.has(m.id),segments:segments(physical.get(m.id)??[ray(a,center(b),7),ray(b,center(a),9)])}});
  let crossings=0,obstructions=0,wireLength=0;
  for(const [i,line] of lines.entries()){
   wireLength+=line.segments.reduce((sum,s)=>sum+dist(s),0);
   if(!line.physical)for(const id of ids)if(id!==line.m.from&&id!==line.m.to&&line.segments.some(s=>hitsBox(s,boxes[id])))obstructions++;
   for(const other of lines.slice(i+1))if(line.segments.some(s=>other.segments.some(t=>strictCross(s,t))))crossings++;
  }
  const area=ids.reduce((sum,id)=>sum+boxes[id][2]*boxes[id][3],0)/(dims[k][0]*dims[k][1]);
  return {crossings,obstructions,wireLength:round(wireLength),objectAreaRatio:Math.round(area*10000)/10000};
 };
 const candidates=[];
 for(const a of local.desktop)for(const b of local.mobile){
  const id=a.family+'-'+b.family;
  const positioned={...scene,objects:items.map(o=>({...o,desktop:a.boxes[o.id],mobile:b.boxes[o.id]}))};
  let topology;try{topology=compilePhysicalTopology(positioned,mappings)}catch(e){candidates.push({id,status:'blocked',reason:String(e.message??e)});continue}
  const desktop=metrics('desktop',a.boxes,topology),mobile=metrics('mobile',b.boxes,topology);
  // Engineering preference: prioritize clear relations, then object scale and compact wiring.
  const cost=(desktop.obstructions+mobile.obstructions)*1000+(desktop.crossings+mobile.crossings)*150+(desktop.wireLength+mobile.wireLength)/100-(a.base+b.base)/4;
  candidates.push({id,status:'feasible',desktop:{...a,metrics:desktop},mobile:{...b,metrics:mobile},cost:round(cost),physicalRoutes:topology.length});
 }
 const feasible=candidates.filter(x=>x.status==='feasible').sort((a,b)=>a.cost-b.cost||a.id.localeCompare(b.id));
 return {version:1,ref:c.ref,intent:c.intent,focalObject:c.focalObject,order,candidates,recommendedId:feasible[0]?.id??null,scope:'bounded 2D structural heuristic; no aesthetic ranking or measured meaning of size'};
}
export function applySceneComposition(scene,mappings){
 if(Object.hasOwn(scene,'compositionManifest'))throw Error('compositionManifest is compiler-owned');
 const plan=proposeSceneComposition(scene,mappings);if(!plan)return {scene,manifest:null};
 const c=scene.composition,id=c.mode==='auto'?plan.recommendedId:c.candidateId;
 const selected=plan.candidates.find(x=>x.id===id&&x.status==='feasible');
 if(!selected)throw Error('no selected feasible scene composition');
 if(c.mode==='select'&&(typeof c.reason!=='string'||!c.reason.trim()))throw Error('explicit composition selection rationale required');
 const next={...scene,objects:scene.objects.map(o=>({...o,desktop:selected.desktop.boxes[o.id],mobile:selected.mobile.boxes[o.id]}))};
 return {scene:next,manifest:{...plan,selectedId:id,selectionMode:c.mode,selectionReason:c.mode==='auto'?'lowest structural heuristic cost':c.reason}};
}
