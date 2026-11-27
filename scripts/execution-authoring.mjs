// Blank authoring scaffolds, never benchmark answers or invented pass records.
import {activationSignals} from './execution-activation.mjs';
import {bindScenes,sceneInputs} from './execution-vmi.mjs';
const refs={
 'reconstruction-prepare':['references/reconstruction-entry.md','references/runtime-intent-recovery.md'],
 'reconstruction-plan':['references/reconstruction-entry.md','references/system-level-refactoring.md'],
 'production-plan':['references/visual-opportunity-discovery.md','references/quality-depth.md','references/execution-gates.md'],
 'vmi-explore':['visual-metaphor-intelligence/GUIDE.md','visual-metaphor-intelligence/references/open-discovery.md'],
 'vmi-packet':['visual-metaphor-intelligence/references/creative-critique.md','visual-metaphor-intelligence/references/scene-compilation.md'],
 'specialist-plan':['references/quality-depth.md']
};
const globalRefs=['references/context-guide.md','references/acceptance.md','references/design-principles.md'];
const specialistRefs={QD01:'references/narrative-director.md',QD02:'references/interaction-choreography.md',QD03:'references/concept-art-pipeline.md',QD04:'references/motion-completeness.md',QD05:'references/global-spatial-composition.md'};
const rec=(revision,key)=>({key,revision,status:'not-run',ref:''});
const area=(revision,id)=>({id,applicable:null,reason:'',design:{revision,status:'not-run',ref:''}});
const blankPerspective=()=>({id:'',rationale:'',evidenceRef:'',evidenceKind:null,nodes:[],edges:[]});
const required=(p,stage)=>{if(!p)throw Error('missing verified '+stage);return p};
// Derive identity scaffolds only; evidence and design judgments remain authored.
export function spatialScaffold(requirements){
 const inventory=requirements.inventory;
 const pageIds=[...new Set(inventory.map(x=>x.page))];
 const sliceIds=new Set(inventory.map(x=>x.id));
 const conflicts=pageIds.filter(id=>sliceIds.has(id));
 const valid=id=>typeof id==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(id)&&!['constructor','prototype'].includes(id);
 const invalidIds=[...new Set([...pageIds,...sliceIds])].filter(id=>!valid(id));
 return {conflicts,invalidIds,atlas:{coverage:null,discoveryRef:'',
 pages:pageIds.map((id,i)=>({id,title:'',task:'',ref:'',inventoryIds:['page-evidence-'+i]})),
 slices:inventory.map(({id,page},i)=>({id,pageId:page,title:'',task:'',ref:'',inventoryIds:['slice-evidence-'+i]})),
 inventory:[...pageIds.map((_,i)=>({id:'page-evidence-'+i,kind:'page',ref:''})),...inventory.map((_,i)=>({id:'slice-evidence-'+i,kind:'slice',ref:''}))]},
 spec:{revision:'',atlasRef:'',designDNARef:'',selectionReason:'',
 alternatives:['fixed','flow','hybrid'].map(mode=>({id:mode,mode,tradeoff:''})),tiers:[],viewports:[],
 pages:pageIds.map(id=>({id,purpose:null,returnPolicy:'',filterPolicy:'',sliceOrder:inventory.filter(x=>x.page===id).map(x=>x.id)})),
 slices:inventory.map(({id})=>({id,claim:'',densityRationale:'',preservationRef:'',regions:[],focusRegion:'',readingOrder:[],variants:[]}))}};
}
export function specialistScaffold(id){
 switch(id){
 case 'QD01':return {story:{audience:'',purpose:'',thesis:'',spine:'',evidence:[],acts:[]},scene:{objects:[],cues:[],modePolicy:'shared-context'}};
 case 'QD02':return {objects:[],evidence:[],states:[],transitions:[]};
 case 'QD03':return {intent:'',readerTask:'',semanticRef:'',designDNARef:'',selectionReason:'',directions:['plain','concept-a','concept-b'].map(id=>({id,kind:id==='plain'?'plain':'concept',silhouette:'',viewpoint:'',composition:'',palette:'',materials:'',lighting:'',tradeoff:''})),selectedDirection:'',source:null,conceptInspection:null,assets:[],semanticObjects:[],layers:[],scenes:[]};
 case 'QD04':return {conceptSha:'',motionRevision:'',sceneRef:'',inventory:[]};
 default:return null;
 }
}
export function authoringTask(stage,run,prior,rules,previous=null){
 const p=prior['production-plan']?.output;
 const revision=p?.revision??previous?.revision??1;
 const references=[...globalRefs,...(refs[stage]??[])];
 let template,assignment,locked=[],diagnostics=[];
 switch(stage){
 case 'reconstruction-prepare':
  assignment='Recover actual source observations and optional runtime states; do not invent the source IR.';
  template={ir:null,runtime:null};break;
 case 'reconstruction-plan':{
  const prep=required(prior['reconstruction-prepare'],'reconstruction-prepare').output;
  assignment='Recover the decision, compare refine/restructure/reinvent and bind essential assets to observations.';
  template={inputFingerprint:prep.inputFingerprint,brief:{audience:'',readerTask:'',decision:'',constraints:'',unknowns:''},packet:null,intentLinks:[],assetEvidence:[],exploration:{options:[],selected:'',reason:''}};
  locked=['inputFingerprint'];break;
 }
 case 'production-plan':
  assignment='Inventory all pages and slices, choose representation alternatives, assess QD applicability and attach actual evidence. Set purpose consistently; no default pass.';
  template={revision,purpose:null,activationReviews:activationSignals(prior['reconstruction-prepare']?.output).map(s=>({observationId:s.id,ref:s.ref,disposition:null,sliceId:'',reason:'',staticReason:'',mechanismReason:''})),opportunities:{revision,inventory:[],slices:[],globalReviews:[]},quality:{revision,purpose:null,substantial:true,multiRoute:null,mixedModes:null,semanticInteraction:null,richScene:null,areas:['QD01','QD02','QD03','QD04','QD05','QD06'].map(id=>area(revision,id))},execution:{revision,purpose:null,substantial:true,records:[...new Set(rules.flatMap(g=>g.requires))].map(k=>rec(revision,k))}};break;
 case 'vmi-explore':
  required(p,'production-plan');assignment='Author distinct directed abstractions of the same decision. Use the ontology vocabulary, actual evidence, essential relations and limitations.';
  {const scenes=p.selectedMechanisms.map(sliceId=>({sliceId,perspectives:[blankPerspective(),blankPerspective()],sourceAdditions:[]}));template=scenes.length===1?scenes[0]:{scenes};locked=['sliceId (per scene)'];}break;
 case 'vmi-packet':{
  const explore=required(prior['vmi-explore'],'vmi-explore');
  assignment='Inspect exploration output; author contrasting concepts, explicit reviews, chosen scene and styles. Do not claim source verification or comparison that did not occur.';
  {const scenes=sceneInputs(explore.input,p.selectedMechanisms).map(s=>({sliceId:s.sliceId,perspectives:s.perspectives,...(s.sourceAdditions!==undefined?{sourceAdditions:s.sourceAdditions}:{}),targetId:'',concepts:[],reviews:[],selectedConceptId:'',scene:null,styles:[]}));template=Object.hasOwn(explore.input,'scenes')?{scenes}:scenes[0];}
  locked=['sliceId','perspectives','sourceAdditions (per scene)'];break;
 }
 case 'specialist-plan':
  required(p,'production-plan');assignment='Author only applicable specialist specs using the verified inventory and previous outputs. Static route needs evidence and justification.';
  template={revision};
  if(p.specialists.integrated){template.workspace=null;references.push('references/workspace-integration.md')}
  else template.routes=Object.fromEntries(p.specialists.areas.map(id=>[id,{mode:'compile',spec:specialistScaffold(id)}]));
  if(p.specialists.areas.includes('QD05')){
   const {conflicts,invalidIds,atlas,spec}=spatialScaffold(p.specialists);
   if(conflicts.length||invalidIds.length)diagnostics.push({code:'SPATIAL_ID_CONTRACT',conflicts,invalidIds,repair:'Retry production-plan with distinct valid page and slice IDs; preserve evidence references.'});
   if(p.specialists.integrated)template.workspace={revision:'',contextRevision:'',scopePolicy:'pinned',...specialistScaffold('QD01'),choreography:specialistScaffold('QD02'),concept:specialistScaffold('QD03'),motion:specialistScaffold('QD04'),atlas,spatial:spec,actBindings:{},sceneBindings:{},routes:{director:{pageId:'',sliceId:''},explorer:{pageId:'',sliceId:''}}};
   else template.routes.QD05.spec={atlas,spec};
  }
  references.push(...p.specialists.areas.map(id=>specialistRefs[id]));
  if(p.selectedMechanisms.length){template.vmiOutputSha256=required(prior['vmi-packet'],'vmi-packet').receipt.outputSha256;locked.push('vmiOutputSha256')}
  locked.push('revision');break;
 default:throw Error('no authoring scaffold for '+stage);
 }
 return {stage,assignment,diagnostics,requiredGlobalReferences:globalRefs.map(x=>'skills/infograph-master/'+x),referencePolicy:'Load global references before authoring; task-specific references supplement, never replace them. A listed reference is not proof of reading.',references:[...new Set(references)].map(x=>'skills/infograph-master/'+x),locked,template,previousInput:previous,verifiedUpstream:Object.fromEntries(Object.entries(prior).map(([k,v])=>[k,{outputSha256:v.receipt.outputSha256,outputFile:k+'/output.json'}])),scope:'Blank scaffold; null/empty/not-run are intentionally incomplete. Author actual evidence before execution.'};
}
export function hydrateInput(stage,input,run,prior){
 if(run.workflow!=='production')return input;
 const out=structuredClone(input),bind=(key,value)=>{if(value===undefined)throw Error('missing upstream '+key);if(Object.hasOwn(out,key)&&JSON.stringify(out[key])!==JSON.stringify(value))throw Error('authored '+key+' conflicts with verified upstream');out[key]=value};
 const p=prior['production-plan']?.output;
 if(stage==='reconstruction-plan')bind('inputFingerprint',prior['reconstruction-prepare']?.output.inputFingerprint);
 if(stage==='vmi-explore'||stage==='vmi-packet')return bindScenes(stage,out,p?.selectedMechanisms,prior['vmi-explore']?.input);
 if(stage==='specialist-plan'){bind('revision',p?.revision);if(p?.selectedMechanisms.length)bind('vmiOutputSha256',prior['vmi-packet']?.receipt.outputSha256)}
 return out;
}
