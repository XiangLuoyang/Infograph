import {hasVmiPreview} from './execution-vmi.mjs';
import {compileDirector} from '../skills/infograph-master/engine/narrative-director.mjs';
import {compileChoreography} from '../skills/infograph-master/engine/interaction-choreography.mjs';
import {compileConceptArt} from '../skills/infograph-master/engine/concept-art-pipeline.mjs';
import {compileMotionCompleteness} from '../skills/infograph-master/engine/motion-completeness.mjs';
import {compileSpatialComposition} from '../skills/infograph-master/engine/global-spatial-composition.mjs';
import {compileWorkspace} from '../skills/infograph-master/engine/workspace-integration.mjs';
const ids=['QD01','QD02','QD03','QD04','QD05'];
const names={QD01:'narrative-director.mjs',QD02:'interaction-choreography.mjs',QD03:'concept-art-pipeline.mjs',QD04:'motion-completeness.mjs',QD05:'global-spatial-composition.mjs'};
const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
const text=v=>typeof v==='string'&&v.trim().length>0;
export function specialistRequirements(quality,opportunities){
 return {areas:ids.filter(id=>quality.areas.some(a=>a.id===id&&a.applicable)),integrated:quality.multiRoute&&quality.mixedModes&&quality.semanticInteraction&&quality.richScene,
 flags:{multiRoute:quality.multiRoute,mixedModes:quality.mixedModes,semanticInteraction:quality.semanticInteraction,richScene:quality.richScene},
 inventory:opportunities.inventory.map(({id,page})=>({id,page}))};
}
export function atlasIdentityDiff(atlas,requirements){
 const expected=requirements.inventory.map(x=>[x.id,x.page]);
 const actual=Array.isArray(atlas?.slices)?atlas.slices.map(x=>[x?.id,x?.pageId]):[];
 const key=x=>JSON.stringify(x);
 const expectedKeys=new Set(expected.map(key)),actualKeys=new Set(actual.map(key));
 const seen=new Set(),duplicates=[];
 for(const pair of actual){const k=key(pair);if(seen.has(k))duplicates.push(pair);seen.add(k)}
 return {missing:expected.filter(x=>!actualKeys.has(key(x))),unexpected:actual.filter(x=>!expectedKeys.has(key(x))),duplicates};
}
function bindAtlas(atlas,requirements){
 const diff=atlasIdentityDiff(atlas,requirements);
 ensure(Object.values(diff).every(x=>x.length===0),'spatial atlas must cover the production inventory with the same slice/page IDs; '+JSON.stringify(diff)+'; repair atlas.slices using the verified inventory');
}
export function runSpecialists(input,plan,prior){
 const r=plan.specialists;
 ensure(input?.revision===plan.revision,'specialist revision mismatch');
 ensure(r.areas.length>0,'no applicable specialist area');
 ensure(plan.designEligible,'production plan blocked');
 if(plan.selectedMechanisms.length){
  const v=prior['vmi-packet'];
  ensure(hasVmiPreview(v?.output)&&!v.output.issues?.length,'VMI preview unavailable');
  ensure(input.vmiOutputSha256===v.receipt.outputSha256,'specialist/VMI evidence mismatch');
 }
 const outputs={},executions=[],blockers=[];
 const executed=(id,out,via)=>{outputs[id]=out;executions.push({id,engine:names[id],status:'executed',via});};
 const check=(id,ok)=>{if(!ok)blockers.push(id+' planning output not ready')};
 if(r.integrated){
  ensure(input.workspace&&!input.routes,'integrated route requires one workspace spec, not independent routes');
  ensure(ids.every(id=>r.areas.includes(id)),'integrated route requires all five applicable areas');
  bindAtlas(input.workspace.atlas,r);
  const w=compileWorkspace(input.workspace);
  for(const [id,key] of [['QD01','director'],['QD02','choreography'],['QD03','concept'],['QD04','motion'],['QD05','spatial']])executed(id,w[key],'workspace-integration.mjs');
  executions.push({id:'workspace',engine:'workspace-integration.mjs',status:'executed',via:'direct'});
  outputs.workspace=w;check('workspace',w.planningReady);
 }else{
  ensure(input.routes&&typeof input.routes==='object'&&!Array.isArray(input.routes)&&!input.workspace,'independent route requires routes');
  ensure(Object.keys(input.routes).length===r.areas.length&&Object.keys(input.routes).every(id=>r.areas.includes(id)),'route coverage must match applicable areas');
  for(const id of ids.filter(id=>r.areas.includes(id))){
   const route=input.routes[id];
   ensure(route&&['compile','static'].includes(route.mode),'missing specialist disposition '+id);
   if(route.mode==='static'){
    ensure((id==='QD01'&&!r.flags.mixedModes)||(id==='QD02'&&!r.flags.semanticInteraction&&!r.flags.mixedModes),'static disposition not permitted for '+id);
    ensure(text(route.reason)&&text(route.evidenceRef),'static disposition needs rationale and evidence reference');
    executions.push({id,engine:names[id],status:'not-applicable-to-runtime',reason:route.reason,evidenceRef:route.evidenceRef});continue;
   }
   const spec=route.spec;
   ensure(spec&&typeof spec==='object','missing specialist spec '+id);
   if(id==='QD01')executed(id,compileDirector(spec.story,spec.scene),'direct');
   if(id==='QD02')executed(id,compileChoreography(spec),'direct');
   if(id==='QD03'){const p=compileConceptArt(spec);executed(id,p,'direct');check(id,p.productionDeclaredReady)}
   if(id==='QD04'){
    ensure(outputs.QD03,'motion requires compiled concept; review QD03 applicability');
    const p=compileMotionCompleteness(spec,outputs.QD03,outputs.QD02??{channels:[],states:[],transitions:[]});
    executed(id,p,'direct');check(id,p.complete);
   }
   if(id==='QD05'){bindAtlas(spec.atlas,r);const p=compileSpatialComposition(spec.atlas,spec.spec);executed(id,p,'direct');check(id,p.planningReady)}
  }
 }
 return {revision:plan.revision,executions,outputs,blockers,planningReady:blockers.length===0,rendered:false,releaseAuthorized:false,scope:'actual renderer-neutral compiler execution over authored specs; not visual quality or final output verification'};
}
