// Deterministic bounded candidate generation, no aesthetic certification.
export function proposeCompositions(input){
 const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
 const text=x=>typeof x==='string'&&x.trim().length>0;
 const int=(x,a,b)=>Number.isInteger(x)&&x>=a&&x<=b;
 const {regions,focusRegion,viewport,mode,gap=12,pairs=[]}=input??{};
 ensure(Array.isArray(regions)&&regions.length>=1&&regions.length<=12&&new Set(regions.map(r=>r.id)).size===regions.length,'invalid region inventory');
 ensure(regions.every(r=>/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(r.id)&&int(r.priority,1,5)&&int(r.minWidth,1,10000)&&int(r.minHeight,1,10000)&&text(r.ref)),'invalid region sizing/priority evidence');
 ensure(regions.some(r=>r.id===focusRegion)&&['fixed','hybrid','flow'].includes(mode)&&int(viewport?.width,1,10000)&&int(viewport?.height,1,10000)&&int(gap,0,64),'invalid focus/workspace');
 const ids=regions.map(r=>r.id),byId=new Map(regions.map(r=>[r.id,r]));
 ensure(Array.isArray(pairs)&&pairs.length<=24&&pairs.every(p=>Array.isArray(p)&&p.length===2&&p[0]!==p[1]&&p.every(id=>byId.has(id)))&&new Set(pairs.map(p=>[...p].sort().join('|'))).size===pairs.length,'invalid adjacency pairs');
 const candidates=[],seen=new Set();
 function add(id,columns,rows,rationale){
  const key=JSON.stringify([columns,rows]);if(seen.has(key))return;seen.add(key);
  const minHeights=rows.map(row=>Math.max(...row.map(id=>byId.get(id).minHeight)));
  const rowSizes=mode==='fixed'?minHeights.map(h=>Math.max(1,Math.round(12*h/Math.max(...minHeights)))):rows.map(()=> 'auto');
  const hSpace=viewport.height-gap*(rows.length-1),wSpace=viewport.width-gap*(columns.length-1),totalWeight=columns.reduce((a,b)=>a+b,0),totalRows=mode==='fixed'?rowSizes.reduce((a,b)=>a+b,0):0;
  const colW=columns.map(c=>wSpace*c/totalWeight),rh=mode==='fixed'?rowSizes.map(w=>hSpace*w/totalRows):minHeights;
  let y=0;const boxes=[];
  for(const [i,row] of rows.entries()){
   for(const regionId of new Set(row)){
    const a=row.indexOf(regionId),b=row.lastIndexOf(regionId);
    const w=colW.slice(a,b+1).reduce((n,x)=>n+x,0)+gap*(b-a),x=colW.slice(0,a).reduce((n,z)=>n+z,0)+gap*a;
    boxes.push({id:regionId,x,y,width:w,height:rh[i],row:i});
   }y+=rh[i]+gap;
  }
  const issues=[];
  for(const b of boxes){const r=byId.get(b.id);if(b.width<r.minWidth-0.001)issues.push({id:b.id,kind:'width-below-authored-minimum'});if(b.height<r.minHeight-0.001)issues.push({id:b.id,kind:'height-below-authored-minimum'});}
  const focus=boxes.find(b=>b.id===focusRegion),area=b=>Math.max(0,b.width*b.height),total=boxes.reduce((a,b)=>a+area(b),0)||1;
  const focusShare=area(focus)/total,focusFold=focus.height>0?Math.max(0,Math.min(focus.height,viewport.height-focus.y))/focus.height:0;
  const firstFold=boxes.reduce((n,b)=>n+byId.get(b.id).priority*(b.height>0?Math.max(0,Math.min(b.height,viewport.height-b.y))/b.height:0),0)/regions.reduce((n,r)=>n+r.priority,0);
  const priorityAreaConcordance=regions.flatMap((a,i)=>regions.slice(i+1).filter(b=>a.priority!==b.priority).map(b=>{const x=area(boxes.find(z=>z.id===a.id))-area(boxes.find(z=>z.id===b.id));return x===0?.5:Math.sign(x)===Math.sign(a.priority-b.priority)?1:0;}));
  const concordance=priorityAreaConcordance.length?priorityAreaConcordance.reduce((a,b)=>a+b,0)/priorityAreaConcordance.length:null;
  const adjacent=pairs.filter(([a,b])=>boxes.find(x=>x.id===a).row===boxes.find(x=>x.id===b).row).length;
  candidates.push({id,rationale,columns,rows,rowSizes,estimatedBoxes:boxes,metrics:{focusShare,focusFold,priorityFirstFold:firstFold,priorityAreaConcordance:concordance,adjacentPairs:adjacent,totalPairs:pairs.length,estimatedHeight:y-gap},issues,feasible:issues.length===0});
 }
 const pack=(rest)=>{const rows=[];for(let i=0;i<rest.length;i+=2)rows.push([rest[i],rest[i+1]??rest[i]]);return rows;};
 add('stack',[1],ids.map(id=>[id]),'full-width sequential reading, low horizontal compression');
 if(ids.length>1){
  add('balanced',[1,1],pack(ids),'paired comparisons and compact evidence');
  add('lead-wide',[1,1],[[ids[0],ids[0]],...pack(ids.slice(1))],'lead claim spans width, supporting evidence follows');
  add('lead-split',[2,1],pack(ids),'wide leading region with narrower adjacent support');
  add('support-split',[1,2],pack(ids),'narrow leading region with wider adjacent support');
  const at=ids.indexOf(focusRegion);
  if(at>0)add('focus-wide',[1,1],[...pack(ids.slice(0,at)),[focusRegion,focusRegion],...pack(ids.slice(at+1))],'full-width focal region while preserving earlier semantic reading order');
 }
 return {candidates,scope:'estimated geometry and authored priorities only; no browser measurements, aesthetic ranking or automatic selection',rendered:false,releaseAuthorized:false};
}
