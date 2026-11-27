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
  const hSpace=Math.max(0,viewport.height-gap*(rows.length-1)),wSpace=Math.max(0,viewport.width-gap*(columns.length-1)),totalWeight=columns.reduce((a,b)=>a+b,0),totalRows=mode==='fixed'?rowSizes.reduce((a,b)=>a+b,0):0;
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

export function compositionPreview(input){
 const result=proposeCompositions(input);
 const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const pct=x=>Math.round(x*100)+'%';
 const cards=result.candidates.map(c=>{
  const W=input.viewport.width,H=Math.max(input.viewport.height,c.metrics.estimatedHeight,1);
  const regions=c.estimatedBoxes.map(b=>{
   const r=input.regions.find(x=>x.id===b.id),focus=b.id===input.focusRegion;
   return '<div class="region'+(focus?' focus':'')+'" style="left:'+100*b.x/W+'%;top:'+100*b.y/H+'%;width:'+100*Math.max(0,b.width)/W+'%;height:'+100*Math.max(0,b.height)/H+'%"><strong>'+esc(b.id)+'</strong><small> P'+r.priority+' · '+Math.round(b.width)+'×'+Math.round(b.height)+'</small></div>';
  }).join('');
  const issues=c.issues.length?'<ul>'+c.issues.map(i=>'<li>'+esc(i.id+' · '+i.kind)+'</li>').join('')+'</ul>':'';
  return '<article><header><h2>'+esc(c.id)+'</h2><span class="'+(c.feasible?'ok':'bad')+'">'+(c.feasible?'Fits authored minima':'Below authored minima')+'</span></header><p>'+esc(c.rationale)+'</p><div class="wire" style="aspect-ratio:'+W+'/'+H+'">'+regions+'<div class="fold" style="top:'+100*input.viewport.height/H+'%"></div></div><dl><dt>Focus area share</dt><dd>'+pct(c.metrics.focusShare)+'</dd><dt>Priority-weighted first fold</dt><dd>'+pct(c.metrics.priorityFirstFold)+'</dd><dt>Same-row adjacency</dt><dd>'+c.metrics.adjacentPairs+'/'+c.metrics.totalPairs+'</dd></dl>'+issues+'</article>';
 }).join('');
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Infograph · Composition alternatives</title><style> *{box-sizing:border-box}body{margin:0;background:#f5f3ee;color:#252a28;font:15px/1.45 system-ui,sans-serif}main{max-width:1400px;margin:auto;padding:24px}h1{font-size:30px;margin:0}h2{font-size:18px;margin:0}p{margin:8px 0;color:#5a625e}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:18px;margin-top:22px}article{background:#fffdf8;border:1px solid #d9d6cd;border-radius:8px;padding:16px;min-width:0}header{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px}.wire{position:relative;background:#e9e7df;border:1px solid #d2d0c6;overflow:hidden;margin:16px 0}.region{position:absolute;border:1px solid #a3ada5;background:#dce4df;color:#253b32;padding:5px;overflow:hidden;font-size:12px}.region.focus{background:#365e50;color:#fff;border-color:#365e50}.region small{display:block;font-size:10px}.fold{position:absolute;left:0;right:0;border-top:2px dashed #b65e40;pointer-events:none}dl{display:grid;grid-template-columns:1fr auto;gap:5px;margin:0}dd{margin:0;font-variant-numeric:tabular-nums}.ok{color:#365e50}.bad,li{color:#a74732}span{font-size:12px}footer{margin-top:24px;color:#555}</style><main><h1>Composition alternatives</h1><p>'+esc(input.mode)+' · '+input.viewport.width+' × '+input.viewport.height+' CSS px · dark region = focal task; dashed line = estimated first fold.</p><p>Wireframes from authored region minima and priorities, not a rendered dashboard or an aesthetic ranking.</p><section>'+cards+'</section><footer>Selection remains an explicit task-led decision. Actual browser and independent visual review are still required.</footer></main></html>';
}
