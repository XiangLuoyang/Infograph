// Opt-in expansion of authored design intent. Never creates evidence or a pass receipt.
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const own=(x,k)=>Object.hasOwn(x,k);
const need=(ok,msg)=>{if(!ok)throw Error(msg)};
const text=x=>typeof x==='string'&&x.trim().length>0;
const keys=(x,allowed,path)=>{need(object(x),path+' must be an object');for(const k of Object.keys(x))need(allowed.includes(k),path+'.'+k+' is not supported')};
const requireText=(x,path)=>need(text(x),path+' must be authored');
function expandOne(input){
 need(object(input),'packet must be an object');
 const p=structuredClone(input);
 const drafts=['sceneDraft','styleDrafts','activationDraft'].filter(k=>own(p,k));
 if(!drafts.length)return p;
 need(Array.isArray(p.concepts),'concepts must be authored before expansion');
 const selected=p.concepts.filter(c=>c?.id===p.selectedConceptId);
 need(text(p.selectedConceptId)&&selected.length===1,'select exactly one authored concept');
 const c=selected[0];
 need(Number.isInteger(c.revision)&&c.revision>=1,'selected concept revision required');
 if(own(p,'sceneDraft')){
  need(!own(p,'scene')||p.scene===null,'scene and sceneDraft conflict');
  const d=p.sceneDraft;
  keys(d,['title','subtitle','staticSummary','objects','states','initialState','layout','physicalTopology','surfaceRendering','dynamicBindings'],'sceneDraft');
  for(const k of ['title','subtitle','staticSummary','initialState'])requireText(d[k],'sceneDraft.'+k);
  keys(d.layout,['focalObject','intent','ref','minSize','focalScale'],'sceneDraft.layout');
  for(const k of ['focalObject','intent','ref'])requireText(d.layout[k],'sceneDraft.layout.'+k);
  need(Array.isArray(d.objects)&&d.objects.length>=2&&d.objects.length<=6,'sceneDraft requires 2–6 objects; use canonical scene otherwise');
  need(Array.isArray(c.sceneObjects),'selected concept sceneObjects required');
  const ids=d.objects.map(o=>o?.id),expected=c.sceneObjects.map(o=>o.id);
  need(new Set(ids).size===ids.length&&new Set(expected).size===expected.length&&ids.length===expected.length&&ids.every(id=>text(id)&&expected.includes(id)),'sceneDraft object IDs must match selected concept');
  need(ids.includes(d.layout.focalObject),'sceneDraft.layout.focalObject must match an authored object');
  need(Array.isArray(d.states)&&d.states.length>0&&d.states.some(s=>s?.id===d.initialState),'sceneDraft states and initialState required');
  const objects=d.objects.map((o,i)=>{
   keys(o,['id','caption','detail','shapes','geometry'],'sceneDraft.objects['+i+']');
   requireText(o.caption,'sceneDraft.objects['+i+'].caption');requireText(o.detail,'sceneDraft.objects['+i+'].detail');
   return {...o,layer:'main'};
  });
  need(!d.physicalTopology?.links?.some(l=>own(l,'waypoints')),'sceneDraft automatic layout cannot contain physical waypoints');
  const {layout,...rest}=d;
  p.scene={...rest,conceptId:c.id,revision:c.revision,layers:[{id:'main',renderer:'svg',essential:true}],objects,composition:{version:1,mode:'auto',...layout}};
  delete p.sceneDraft;
 }
 if(own(p,'styleDrafts')){
  need(!own(p,'styles')||(Array.isArray(p.styles)&&p.styles.length===0),'styles and styleDrafts conflict');
  requireText(c.designDNARef,'selected concept.designDNARef');
  need(Array.isArray(p.styleDrafts)&&p.styleDrafts.length>=1&&p.styleDrafts.length<=4,'styleDrafts requires 1–4 authored styles');
  p.styles=p.styleDrafts.map((s,i)=>{
   keys(s,['id','sampleRef','mode','rationale','material','font','depth','radius','motionMs','colors'],'styleDrafts['+i+']');
   return {...s,baselineRef:c.designDNARef};
  });
  delete p.styleDrafts;
 }
 if(own(p,'activationDraft')){
  need(!own(p,'activation'),'activation and activationDraft conflict; remove the unused scaffold first');
  keys(p.activationDraft,['plainComparison','sourceInteraction','decisions'],'activationDraft');
  p.activation={...p.activationDraft,version:1};
  delete p.activationDraft;
 }
 return p;
}
export function constructVmiPacket(input){
 need(object(input),'packet must be an object');
 if(!own(input,'scenes'))return expandOne(input);
 need(Array.isArray(input.scenes)&&input.scenes.length>=1&&input.scenes.length<=8,'scenes must contain 1–8 packets');
 for(const k of ['sceneDraft','styleDrafts','activationDraft','scene','styles','activation'])need(!own(input,k),'mixed batch and single '+k);
 return {...structuredClone(input),scenes:input.scenes.map(expandOne)};
}
