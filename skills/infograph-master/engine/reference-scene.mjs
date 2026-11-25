function requireThat(ok,message){if(!ok)throw Error(message)}

function unit(v){return Number.isFinite(v)&&v>=0&&v<=1}

function validId(v){return typeof v==="string"&&/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(v)}

function nonempty(v){return typeof v==="string"&&v.trim().length>0}

export function compileReference(input,capabilities={}){
 const src=input?.source;requireThat(src&&["image","synthetic"].includes(src.kind)&&nonempty(src.id)&&Number.isInteger(src.width)&&src.width>0&&Number.isInteger(src.height)&&src.height>0,"invalid source");
 if(src.kind==="image")requireThat(/^[a-f0-9]{64}$/.test(src.sha256??""),"source SHA-256 required");
 requireThat(Array.isArray(input.objects)&&input.objects.length>0&&Array.isArray(input.links)&&Array.isArray(input.scenes),"invalid scene");
 const ids=new Map(),slots=[],issues=[];
 const available={html:true,svg:true,css:true,raster:false,webgl:false,...capabilities};
 for(const o of input.objects){
  requireThat(validId(o.id)&&!ids.has(o.id)&&["environment","entity","anchor","label","connector","instrument","ornament"].includes(o.role)&&nonempty(o.label)&&typeof o.essential==="boolean","invalid or duplicate object");
  requireThat(Array.isArray(o.bounds)&&o.bounds.length===4&&o.bounds.every(unit)&&o.bounds[2]>0&&o.bounds[3]>0&&o.bounds[0]+o.bounds[2]<=1.00000001&&o.bounds[1]+o.bounds[3]<=1.00000001,"invalid bounds "+o.id);
  requireThat(Number.isInteger(o.depth)&&o.depth>=0&&["observed","inferred","authored"].includes(o.provenance)&&nonempty(o.sourceNote),"missing provenance/depth "+o.id);
  requireThat(["flat","surface","photoreal","spatial","optical"].includes(o.fidelity)&&typeof o.dynamic==="boolean","invalid fidelity/dynamic");
  const ports=o.ports??{};requireThat(ports&&typeof ports==="object"&&!Array.isArray(ports)&&Object.entries(ports).every(([k,p])=>validId(k)&&Array.isArray(p)&&p.length===2&&p.every(unit)),"invalid ports "+o.id);
  if(o.material){requireThat(["paper","metal","stone","glass","matte"].includes(o.material.family)&&unit(o.material.roughness)&&unit(o.material.metalness)&&unit(o.material.opacity),"invalid material "+o.id)}
  if(o.role==="label")requireThat(o.fidelity==="flat","labels must be deterministic flat text");
  ids.set(o.id,o);
  let preferred=o.role==="label"?"html":o.role==="connector"||o.role==="anchor"?"svg":o.fidelity==="spatial"||o.fidelity==="optical"?"webgl":o.fidelity==="photoreal"?(o.dynamic?"webgl":"raster"):o.fidelity==="surface"?"css":"svg";
  let renderer=available[preferred]?preferred:available.svg&&o.role!=="label"?"svg":available.html&&o.role==="label"?"html":null;
  if(o.role==="label"&&!available.html)renderer=null;
  let degraded=renderer!==preferred;
  if(degraded||!renderer)issues.push({objectId:o.id,severity:o.essential?"blocking":"review",reason:`${preferred} unavailable; ${renderer??"no"} fallback`,requirement:o.fidelity});
  slots.push({id:o.id,role:o.role,renderer,preferred,degraded,depth:o.depth,bounds:o.bounds,essential:o.essential,sourceNote:o.sourceNote,material:o.material??null,implementationStatus:"not-rendered"});
 }
 const linkIds=new Set();
 const links=input.links.map(l=>{requireThat(validId(l.id)&&!linkIds.has(l.id)&&!ids.has(l.id),"invalid or duplicate link");linkIds.add(l.id);for(const end of [l.from,l.to])requireThat(ids.has(end?.object)&&Object.hasOwn(ids.get(end.object).ports??{},end.port),"unresolved link endpoint "+l.id);requireThat(l.from.object!==l.to.object&&["constraint","association","sequence"].includes(l.kind),"invalid link semantics");return {...l,renderer:available.svg?"svg":null}});
 if(links.length&&!available.svg)issues.push({severity:"blocking",reason:"dynamic link renderer unavailable"});
 const sceneIds=new Set(),known=new Set([...ids.keys(),...linkIds]);
 for(const s of input.scenes){requireThat(validId(s.id)&&!sceneIds.has(s.id)&&Array.isArray(s.visible)&&new Set(s.visible).size===s.visible.length&&s.visible.every(id=>known.has(id))&&nonempty(s.intent),"invalid scene");sceneIds.add(s.id);for(const l of links.filter(l=>s.visible.includes(l.id)))requireThat(s.visible.includes(l.from.object)&&s.visible.includes(l.to.object),"visible link has hidden endpoint");}
 requireThat(input.scenes.length>0,"scene required");
 requireThat(input.objects.filter(o=>o.essential).every(o=>input.scenes.some(s=>s.visible.includes(o.id))),"essential object never visible");
 const staticScene=input.scenes.find(s=>s.id===input.staticScene);requireThat(staticScene&&input.objects.filter(o=>o.essential).every(o=>staticScene.visible.includes(o.id))&&links.every(l=>staticScene.visible.includes(l.id)),"static fallback must show all essential objects and links");
 return {source:{...src},objects:input.objects,slots:slots.sort((a,b)=>a.depth-b.depth),links,scenes:input.scenes,staticScene:input.staticScene,issues,planningReady:!issues.some(i=>i.severity==="blocking"),rendered:false,releaseReady:false,scope:"authored reference decomposition and renderer routing; not computer vision or fidelity certification"};
}

export function resolveAnchor(object,port,transform={}){
 requireThat(object&&Object.hasOwn(object.ports??{},port),"unknown port");
 const [x,y,w,h]=object.bounds,[u,v]=object.ports[port],{dx=0,dy=0,rotation=0,scale=1}=transform;
 requireThat([dx,dy,rotation,scale].every(Number.isFinite)&&scale>0,"invalid transform");
 const a=rotation*Math.PI/180,px=(u-.5)*w*scale,py=(v-.5)*h*scale;
 return [x+w/2+dx+px*Math.cos(a)-py*Math.sin(a),y+h/2+dy+px*Math.sin(a)+py*Math.cos(a)];
}

export function planLinks(plan,transforms={}){
 const objects=new Map(plan.objects.map(o=>[o.id,o]));
 return plan.links.map(l=>({id:l.id,kind:l.kind,from:resolveAnchor(objects.get(l.from.object),l.from.port,transforms[l.from.object]),to:resolveAnchor(objects.get(l.to.object),l.to.port,transforms[l.to.object])}));
}

export function fidelityReview(plan,records=[]){
 requireThat(Array.isArray(records),"records required");
 const dimensions=["semantic","geometry","hierarchy","material","lighting","interaction","accessibility"],byKey=new Map(),results=[];
 for(const r of records){requireThat(plan.slots.some(o=>o.id===r.objectId)&&dimensions.includes(r.dimension)&&["pass","fail","not-run","not-applicable"].includes(r.status)&&nonempty(r.ref)&&nonempty(r.reviewer)&&nonempty(r.note),"invalid review record");const key=r.objectId+"/"+r.dimension;requireThat(!byKey.has(key),"duplicate review");byKey.set(key,r);}
 for(const o of plan.slots)for(const d of dimensions){
  const needed=d==="semantic"||d==="geometry"||d==="hierarchy"||d==="accessibility"&&o.essential||d==="interaction"&&plan.objects.find(x=>x.id===o.id).dynamic||["material","lighting"].includes(d)&&["surface","photoreal","spatial","optical"].includes(plan.objects.find(x=>x.id===o.id).fidelity);
  const r=byKey.get(o.id+"/"+d);
  if(needed)requireThat(r?.status!=="not-applicable","required review cannot be waived");
  results.push(r??{objectId:o.id,dimension:d,status:needed?"not-run":"not-applicable",ref:null,reviewer:null,note:needed?"missing observed evidence":"not required by declared role",required:needed});
 }
 const required=results.filter(r=>r.required??true),failed=required.filter(r=>r.status==="fail"),unrun=required.filter(r=>r.status==="not-run");
 return {records:results,failed:failed.length,unrun:unrun.length,reviewComplete:!failed.length&&!unrun.length&&plan.planningReady,releaseReady:false,scope:"evidence ledger; ratings and aesthetic approval require human review; no automatic certification"};
}
