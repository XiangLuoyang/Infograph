// Label-aware symbolic routing for auto-composed scenes; estimates are checked against rendered text separately.
const limits={"desktop":[800,440],"mobile":[360,620]};
export function routeSymbolicEdges(tier,boxes,mappings,physical=[],labels={}){
 const [W,H]=limits[tier],ids=Object.keys(boxes),phys=new Map(physical.map(t=>[t.edgeId,t.routes[tier].points]));
 const round=x=>Math.round(x*1000)/1000,center=b=>[b[0]+b[2]/2,b[1]+b[3]/2];
 const rects=ids.flatMap(id=>{const [x,y,w,h]=boxes[id],label=String(labels[id]??id);
  const width=Math.max(16,Array.from(label).reduce((n,c)=>n+(/[^\x00-\x7f]/.test(c)?14:9),0)+8);
  return [{id,kind:'object',r:[x-4,y-4,x+w+4,y+h+4]},{id,kind:'label',r:[x+w/2-width/2,y+h+5,x+w/2+width/2,y+h+24]}]});
 const overlap=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
 for(const [i,a] of rects.entries()){if(a.r[0]<0||a.r[1]<0||a.r[2]>W||a.r[3]>H)throw Error('label/object outside composition canvas: '+a.id);for(const b of rects.slice(i+1))if(a.id!==b.id&&overlap(a.r,b.r))throw Error('label/object overlap: '+a.id+' / '+b.id)}
 // Slab intersection, including boundary contact.
 const hit=([a,b],r)=>{let lo=0,hi=1;for(let i=0;i<2;i++){const d=b[i]-a[i];if(Math.abs(d)<1e-9){if(a[i]<r[i]||a[i]>r[i+2])return false;continue}let t=(r[i]-a[i])/d,u=(r[i+2]-a[i])/d;if(t>u)[t,u]=[u,t];lo=Math.max(lo,t);hi=Math.min(hi,u);if(lo>hi)return false}return true};
 const segs=p=>p.slice(1).map((q,i)=>[p[i],q]),dist=([a,b])=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 const clean=p=>p.map(q=>q.map(round)).filter((q,i,a)=>i===0||q[0]!==a[i-1][0]||q[1]!==a[i-1][1]);
 const ray=(box,other,pad)=>{const p=center(box),dx=other[0]-p[0],dy=other[1]-p[1],s=1/Math.max(Math.abs(dx)/(box[2]/2+pad),Math.abs(dy)/(box[3]/2+pad));return [p[0]+dx*s,p[1]+dy*s]};
 const anchors=(b,p)=>[[b[0]-p,b[1]+b[3]/2],[b[0]+b[2]+p,b[1]+b[3]/2],[b[0]+b[2]/2,b[1]-p]];
 const valid=p=>p.length>=2&&p.every(q=>q.every((v,i)=>Number.isFinite(v)&&v>=3&&v<=[W,H][i]-3))&&segs(p).every(s=>!rects.some(o=>hit(s,o.r)));
 const routes=[];
 for(const m of mappings){
  if(phys.has(m.id)){
   const p=phys.get(m.id);if(segs(p).some(s=>rects.some(o=>o.kind==='label'&&hit(s,o.r))))throw Error('physical route crosses label: '+m.id);
   continue;
  }
  const a=boxes[m.from],b=boxes[m.to];if(!a||!b)throw Error('unknown symbolic endpoints');
  const direct=clean([ray(a,center(b),7),ray(b,center(a),9)]),candidates=[direct];
  const xs=[8,W-8,...rects.flatMap(o=>[o.r[0]-5,o.r[2]+5])],ys=[8,H-8,...rects.flatMap(o=>[o.r[1]-5,o.r[3]+5])];
  for(const s of anchors(a,7))for(const t of anchors(b,9)){
   candidates.push([s,t],[s,[s[0],t[1]],t],[s,[t[0],s[1]],t]);
   for(const x of xs)candidates.push([s,[x,s[1]],[x,t[1]],t]);
   for(const y of ys)candidates.push([s,[s[0],y],[t[0],y],t]);
  }
  const cost=p=>segs(p).reduce((n,s)=>n+dist(s),0)+6*Math.max(0,p.length-2);
  const best=candidates.map(clean).filter(valid).sort((a,b)=>cost(a)-cost(b)||a.length-b.length)[0];
  if(!best)throw Error('no label-safe symbolic route: '+m.id+' / '+tier);
  routes.push({id:m.id,points:best,d:best.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ')});
 }
 return routes;
}
