// Bounded vector surface rendering. Decorative material cues never encode data.
const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
const text=x=>typeof x==='string'&&x.trim().length>0;
const number=(x,a,b)=>typeof x==='number'&&Number.isFinite(x)&&x>=a&&x<=b;
const materials=['brushed-metal','matte-enamel','glass','rubber','liquid'];
const roles=['surface','metal','accent','warning','line','highlight'];
export function validateSurfaceScene(scene,concept){
 const config=scene.surfaceRendering;
 if(config===undefined)return null;
 ensure(config?.version===1&&text(config.rationale)&&Array.isArray(config.parts)&&config.parts.length>0&&config.parts.length<=200,'invalid surface rendering contract');
 const objects=new Map(scene.objects.map(x=>[x.id,x])),states=new Set(scene.states.map(x=>x.id)),keys=new Set();
 for(const part of config.parts){
  const object=objects.get(part.objectId),shape=object?.shapes?.[part.shapeIndex],key=part.objectId+':'+part.shapeIndex;
  ensure(object&&Number.isInteger(part.shapeIndex)&&shape&&!keys.has(key)&&materials.includes(part.material)&&roles.includes(shape.fill)&&text(part.ref),'invalid surface part binding');
  keys.add(key);
  // A gradient on a data-encoded mark would add unsupported semantics.
  ensure(part.encoding==='decorative-only','surface cue must be decorative only');
 }
 const motions=config.motions??[];
 ensure(Array.isArray(motions)&&motions.length<=32,'invalid motion list');
 const animated=new Set();
 for(const m of motions){
  const object=objects.get(m.objectId),key=m.objectId+':'+m.shapeIndex;
  ensure(object&&Number.isInteger(m.shapeIndex)&&object.shapes[m.shapeIndex]&&!animated.has(key)&&m.kind==='rotation'&&m.encoding==='qualitative'&&text(m.ref),'invalid qualitative motion binding');
  animated.add(key);
  ensure(Array.isArray(m.pivot)&&m.pivot.length===2&&m.pivot.every(x=>number(x,0,100)),'invalid pivot');
  ensure(m.angles&&Object.keys(m.angles).length===states.size&&Object.keys(m.angles).every(x=>states.has(x))&&Object.values(m.angles).every(x=>number(x,-180,180)),'every state needs explicit bounded angle');
  for(const t of concept.transitions??[])if(m.angles[t.from]!==m.angles[t.to])ensure(t.changedObjects.includes(m.objectId)&&t.quantitative===false,'motion contradicts verified transition');
  // No changing state through an unapproved direct jump, including reverse UI navigation.
  const changes=new Set((concept.transitions??[]).filter(t=>t.changedObjects.includes(m.objectId)&&t.quantitative===false).flatMap(t=>[t.from,t.to]));
  for(const [s,a] of Object.entries(m.angles))if(a!==m.angles[scene.initialState])ensure(changes.has(s)&&changes.has(scene.initialState),'motion state lacks qualitative transition coverage');
 }
 return {version:1,parts:config.parts,motions,rationale:config.rationale,scope:'decorative vector surface cues and qualitative state poses; no optical or physical simulation'};
}
export function surfaceGradient(material,role,id){
 ensure(materials.includes(material)&&roles.includes(role)&&/^[A-Za-z0-9_-]+$/.test(id),'invalid gradient contract');
 const base='var(--'+role+')',light='var(--highlight)',dark='var(--ink)';
 const recipes={
  'brushed-metal':[[0,dark,.32],[12,base,1],[27,light,.82],[42,base,1],[68,dark,.46],[84,base,1],[100,light,.55]],
  'matte-enamel':[[0,light,.85],[20,base,1],[78,base,1],[100,dark,.68]],
  glass:[[0,light,.85],[16,base,.62],[48,base,.36],[76,base,.62],[100,light,.9]],
  rubber:[[0,base,1],[30,dark,.86],[80,dark,1],[100,base,1]],
  liquid:[[0,light,.85],[13,base,.92],[75,base,1],[100,dark,.7]]
 };
 return '<linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="'+(material==='brushed-metal'?'0.65':'1')+'">'+recipes[material].map(([offset,color,opacity])=>'<stop offset="'+offset+'%" stop-color="'+color+'" stop-opacity="'+opacity+'"/>').join('')+'</linearGradient>';
}
