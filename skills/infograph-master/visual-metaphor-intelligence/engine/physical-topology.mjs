// Bounded 2D physical routing; authored semantics are never inferred from geometry.
export const ports={
  "tank": {
    "out": {
      "xy": [
        97,
        67.5
      ],
      "normal": [
        1,
        0
      ],
      "direction": "out"
    }
  },
  "handwheel-valve": {
    "in": {
      "xy": [
        3,
        64
      ],
      "normal": [
        -1,
        0
      ],
      "direction": "in"
    },
    "out": {
      "xy": [
        97,
        64
      ],
      "normal": [
        1,
        0
      ],
      "direction": "out"
    }
  },
  "manifold-four": {
    "in": {
      "xy": [
        6,
        50
      ],
      "normal": [
        -1,
        0
      ],
      "direction": "in"
    },
    "out1": {
      "xy": [
        96,
        16
      ],
      "normal": [
        1,
        0
      ],
      "direction": "out"
    },
    "out2": {
      "xy": [
        96,
        38
      ],
      "normal": [
        1,
        0
      ],
      "direction": "out"
    },
    "out3": {
      "xy": [
        96,
        60
      ],
      "normal": [
        1,
        0
      ],
      "direction": "out"
    },
    "out4": {
      "xy": [
        96,
        82
      ],
      "normal": [
        1,
        0
      ],
      "direction": "out"
    }
  }
};
export function compilePhysicalTopology(scene,mappings){
 const cfg=scene.physicalTopology;if(cfg===undefined)return [];
 const fail=m=>{throw Error(m)},ok=(v,m)=>{if(!v)fail(m)},txt=x=>typeof x==='string'&&x.trim().length>0;
 ok(cfg?.version===1&&Array.isArray(cfg.links)&&cfg.links.length>0&&cfg.links.length<=32,'invalid physical topology');
 const objects=new Map(scene.objects.map(o=>[o.id,o])),edges=new Map(mappings.map(m=>[m.id,m])),used=new Set(),links=new Set(),result=[];
 const kinds=['desktop','mobile'],limits={desktop:[800,440],mobile:[360,620]};
 const round=n=>Math.round(n*1000)/1000;
 const point=(box,p)=>{const [x,y,w,h]=box,s=Math.min(w,h)/100;return [round(x+(w-100*s)/2+p.xy[0]*s),round(y+(h-100*s)/2+p.xy[1]*s)]};
 const escape=(box,p,q)=>p.normal[0]?[p.normal[0]<0?box[0]-8:box[0]+box[2]+8,q[1]]:[q[0],p.normal[1]<0?box[1]-8:box[1]+box[3]+8];
 const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
 const clean=a=>a.filter((p,i)=>i===0||!same(p,a[i-1]));
 const segs=p=>p.slice(1).map((q,i)=>[p[i],q]);
 const boxOf=(b,pad=0)=>[b[0]-pad,b[1]-pad,b[0]+b[2]+pad,b[1]+b[3]+pad];
 const overlaps=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
 const hit=([a,b],r)=>a[0]===b[0]?a[0]>=r[0]&&a[0]<=r[2]&&Math.max(a[1],b[1])>=r[1]&&Math.min(a[1],b[1])<=r[3]:a[1]>=r[1]&&a[1]<=r[3]&&Math.max(a[0],b[0])>=r[0]&&Math.min(a[0],b[0])<=r[2];
 const intersect=([a,b],[c,d])=>hit([a,b],[Math.min(c[0],d[0]),Math.min(c[1],d[1]),Math.max(c[0],d[0]),Math.max(c[1],d[1])]);
 const inbounds=(p,k)=>p.every((v,i)=>Number.isFinite(v)&&v>=4&&v<=limits[k][i]-4);
 const length=p=>segs(p).reduce((n,[a,b])=>n+Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]),0);
 // Reserve the object plus its existing label strip, conservatively.
 const obstacles=(k)=>[...objects.values()].map(o=>({id:o.id,rect:boxOf([o[k][0],o[k][1],o[k][2],o[k][3]+24],4)}));
 for(const k of kinds){const obs=obstacles(k);for(let i=0;i<obs.length;i++)for(let j=i+1;j<obs.length;j++)ok(!overlaps(obs[i].rect,obs[j].rect),'physical layout object/label overlap: '+k)}
 for(const l of cfg.links){
  const m=edges.get(l?.edgeId);ok(m&&!links.has(l.edgeId)&&l.kind==='pipe'&&txt(l.ref)&&txt(l.reason),'physical link must reference a unique reviewed edge');
  const a=objects.get(m.from),b=objects.get(m.to),ap=ports[a?.geometry?.kind]?.[l.fromPort],bp=ports[b?.geometry?.kind]?.[l.toPort];
  ok(ap?.direction==='out'&&bp?.direction==='in'&&a.id!==b.id,'incompatible physical ports: '+l.edgeId);
  ok(!scene.waypoints?.desktop?.[l.edgeId]&&!scene.waypoints?.mobile?.[l.edgeId],'do not mix symbolic and physical waypoints');
  for(const id of [a.id+':'+l.fromPort,b.id+':'+l.toPort]){ok(!used.has(id),'physical port reused: '+id);used.add(id)}
  links.add(l.edgeId);
  const row={edgeId:l.edgeId,kind:'pipe',from:m.from,to:m.to,fromPort:l.fromPort,toPort:l.toPort,ref:l.ref,reason:l.reason,routes:{}};
  for(const k of kinds){
   const A=point(a[k],ap),B=point(b[k],bp),S=escape(a[k],ap,A),T=escape(b[k],bp,B),obs=obstacles(k);
   const previous=result.flatMap(r=>segs(r.routes[k].points));
   const supplied=l.waypoints?.[k];
   ok(supplied===undefined||(Array.isArray(supplied)&&supplied.length<=8&&supplied.every(p=>Array.isArray(p)&&p.length===2&&inbounds(p,k))),'invalid physical waypoints');
   const xs=[(S[0]+T[0])/2,...obs.flatMap(o=>[o.rect[0]-5,o.rect[2]+5]),8,limits[k][0]-8].map(round);
   const ys=[(S[1]+T[1])/2,...obs.flatMap(o=>[o.rect[1]-5,o.rect[3]+5]),8,limits[k][1]-8].map(round);
   const candidates=supplied!==undefined?[[S,...supplied,T]]:[[S,[T[0],S[1]],T],[S,[S[0],T[1]],T],...xs.map(x=>[S,[x,S[1]],[x,T[1]],T]),...ys.map(y=>[S,[S[0],y],[T[0],y],T])];
   const valid=candidates.map(p=>clean([A,...p,B])).filter(p=>{
    if(!p.every(q=>inbounds(q,k)))return false;
    const ss=segs(p);
    return ss.every((s,i)=> (s[0][0]===s[1][0]||s[0][1]===s[1][1])&&
      !obs.some(o=>!(i===0&&o.id===a.id)&&!(i===ss.length-1&&o.id===b.id)&&hit(s,o.rect))&&
      !previous.some(t=>intersect(s,t))&& !ss.slice(0,Math.max(0,i-1)).some(t=>intersect(s,t)));
   }).sort((x,y)=>length(x)-length(y)||x.length-y.length);
   ok(valid.length,'no collision-free physical route for '+l.edgeId+' / '+k);
   const pts=valid[0],d=pts.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ');
   const longest=segs(pts).sort((x,y)=>length(y)-length(x))[0],mid=longest[0].map((v,i)=>(v+longest[1][i])/2);
   const delta=longest[1].map((v,i)=>Math.sign(v-longest[0][i])*Math.min(7,length(longest)/4));
   const arrow='M'+mid.map((v,i)=>round(v-delta[i])).join(' ')+' L'+mid.map((v,i)=>round(v+delta[i])).join(' ');
   row.routes[k]={points:pts,d,arrow};
  }
  result.push(row);
 }
 return result;
}
