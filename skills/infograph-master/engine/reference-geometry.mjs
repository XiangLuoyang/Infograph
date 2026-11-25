export function cameraBasis(camera={}) {
 const {azimuth=30,elevation=30,zoom=.69}=camera;
 if(!Number.isFinite(azimuth)||Math.abs(azimuth)>360||!Number.isFinite(elevation)||elevation<5||elevation>80||!Number.isFinite(zoom)||zoom<.2||zoom>1)throw Error('invalid orthographic camera');
 const a=azimuth*Math.PI/180,e=elevation*Math.PI/180;
 return {right:[Math.cos(a),0,-Math.sin(a)],up:[Math.sin(a)*Math.sin(e),Math.cos(e),Math.cos(a)*Math.sin(e)],depth:[Math.sin(a)*Math.cos(e),-Math.sin(e),Math.cos(a)*Math.cos(e)],zoom};
}

export function projectPoint(point,camera,aspect){
 if(!Array.isArray(point)||point.length!==3||!point.every(Number.isFinite)||!Number.isFinite(aspect)||aspect<=0)throw Error('invalid projection input');
 const b=cameraBasis(camera),dot=v=>v.reduce((s,x,i)=>s+x*point[i],0),x=dot(b.right)*b.zoom/Math.max(aspect,1),y=dot(b.up)*b.zoom*Math.min(aspect,1);
 return [(x+1)/2,(1-y)/2,dot(b.depth)*.25];
}

export function projectedObjectPorts(object,stageAspect){
 if(!object.geometry?.ports3d)return object;
 const ratio=stageAspect*object.bounds[2]/object.bounds[3],ports={...object.ports};
 for(const [id,p] of Object.entries(object.geometry.ports3d)){const q=projectPoint(p,object.geometry.camera,ratio);if(q[0]<0||q[0]>1||q[1]<0||q[1]>1||Math.abs(q[2])>1)throw Error('3D port outside camera: '+id);ports[id]=q.slice(0,2)}
 return {...object,ports};
}

export function validateGeometry(o){
 const g=o.geometry,m=o.material,ok=(v,lo,hi)=>Number.isFinite(v)&&v>=lo&&v<=hi,vec=(v,n,lo,hi)=>Array.isArray(v)&&v.length===n&&v.every(x=>ok(x,lo,hi));
 if(o.fidelity!=='spatial'||!g||!m||m.opacity!==1||!['mechanical-hub','assembly'].includes(g.preset))throw Error('unsupported opaque spatial geometry: '+o.id);
 cameraBasis(g.camera);
 if(g.ports3d!==undefined){
 if(!g.ports3d||typeof g.ports3d!=='object'||Array.isArray(g.ports3d)||Object.entries(g.ports3d).some(([k,v])=>!Object.hasOwn(o.ports??{},k)||!vec(v,3,-2,2)))throw Error('invalid 3D port: '+o.id);
 }
 if(g.preset==='assembly'){
 if(!Array.isArray(g.parts)||g.parts.length<1||g.parts.length>128)throw Error('invalid assembly part count');
 const ids=new Set();
 for(const p of g.parts){if(!p||typeof p.id!=='string'||!p.id||ids.has(p.id)||!vec(p.center,3,-1.5,1.5)||!['box','cylinder'].includes(p.type)||!vec(p.color,3,0,1)||!ok(p.metalness,0,1)||!ok(p.roughness,0,1))throw Error('invalid assembly part');ids.add(p.id);
 if(p.type==='box'&&!vec(p.size,3,.01,3))throw Error('invalid box size');
 if(p.type==='cylinder'&&(!ok(p.radius,.01,1.5)||!ok(p.height,.01,3)||!Number.isInteger(p.segments??48)||!ok(p.segments??48,8,96)))throw Error('invalid cylinder');
 }
 }
}
