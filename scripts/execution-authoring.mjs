// Blank authoring scaffolds, never benchmark answers or invented pass records.
import {bindScenes,sceneInputs} from './execution-vmi.mjs';
const refs={
 'reconstruction-prepare':['references/reconstruction-entry.md','references/runtime-intent-recovery.md'],
 'reconstruction-plan':['references/reconstruction-entry.md','references/system-level-refactoring.md'],
 'production-plan':['references/visual-opportunity-discovery.md','references/quality-depth.md','references/execution-gates.md'],
 'vmi-explore':['visual-metaphor-intelligence/GUIDE.md','visual-metaphor-intelligence/references/open-discovery.md'],
 'vmi-packet':['visual-metaphor-intelligence/references/creative-critique.md','visual-metaphor-intelligence/references/scene-compilation.md'],
 'specialist-plan':['references/quality-depth.md']
};
const specialistRefs={QD01:'references/narrative-director.md',QD02:'references/interaction-choreography.md',QD03:'references/concept-art-pipeline.md',QD04:'references/motion-completeness.md',QD05:'references/global-spatial-composition.md'};
const rec=(revision,key)=>({key,revision,status:'not-run',ref:''});
const area=(revision,id)=>({id,applicable:null,reason:'',design:{revision,status:'not-run',ref:''}});
const blankPerspective=()=>({id:'',rationale:'',evidenceRef:'',evidenceKind:null,nodes:[],edges:[]});
const required=(p,stage)=>{if(!p)throw Error('missing verified '+stage);return p};
export function authoringTask(stage,run,prior,rules,previous=null){
 const p=prior['production-plan']?.output;
 const revision=p?.revision??previous?.revision??1;
 const references=[...(refs[stage]??[])];
 let template,assignment,locked=[];
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
  template={revision,purpose:null,opportunities:{revision,inventory:[],slices:[],globalReviews:[]},quality:{revision,purpose:null,substantial:true,multiRoute:null,mixedModes:null,semanticInteraction:null,richScene:null,areas:['QD01','QD02','QD03','QD04','QD05','QD06'].map(id=>area(revision,id))},execution:{revision,purpose:null,substantial:true,records:[...new Set(rules.flatMap(g=>g.requires))].map(k=>rec(revision,k))}};break;
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
  else template.routes=Object.fromEntries(p.specialists.areas.map(id=>[id,{mode:'compile',spec:null}]));
  references.push(...p.specialists.areas.map(id=>specialistRefs[id]));
  if(p.selectedMechanisms.length){template.vmiOutputSha256=required(prior['vmi-packet'],'vmi-packet').receipt.outputSha256;locked.push('vmiOutputSha256')}
  locked.push('revision');break;
 default:throw Error('no authoring scaffold for '+stage);
 }
 return {stage,assignment,references:[...new Set(references)].map(x=>'skills/infograph-master/'+x),locked,template,previousInput:previous,verifiedUpstream:Object.fromEntries(Object.entries(prior).map(([k,v])=>[k,{outputSha256:v.receipt.outputSha256,outputFile:k+'/output.json'}])),scope:'Blank scaffold; null/empty/not-run are intentionally incomplete. Author actual evidence before execution.'};
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
