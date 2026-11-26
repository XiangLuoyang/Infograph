import {auditVisualOpportunity} from '../skills/infograph-master/engine/visual-opportunity.mjs';
import {auditQualityDepth} from '../skills/infograph-master/engine/quality-depth.mjs';
import {auditExecution} from '../skills/infograph-master/engine/execution-gates.mjs';
import {prepareReconstruction,planReconstruction} from '../skills/infograph-master/engine/reconstruction-orchestrator.mjs';
import {readFileSync} from 'node:fs';
import {specialistRequirements,runSpecialists} from './execution-specialists.mjs';
const rules=JSON.parse(readFileSync(new URL('../skills/infograph-master/references/execution-gates.json',import.meta.url),'utf8'));
const ensure=(ok,msg)=>{if(!ok)throw Error(msg)};
export const productionStages=['reconstruction-prepare','reconstruction-plan','production-plan','specialist-plan'];
export const productionEngines={'reconstruction-prepare':'reconstruction-orchestrator.mjs:prepareReconstruction','reconstruction-plan':'reconstruction-orchestrator.mjs:planReconstruction','production-plan':'visual-opportunity.mjs+quality-depth.mjs+execution-gates.mjs','specialist-plan':'execution-specialists.mjs'};
export function dependencies(stage,run){
 if(run.workflow!=='production')return stage==='vmi-packet'?['vmi-explore']:[];
 if(stage==='reconstruction-prepare'){ensure(run.task==='redesign'||run.task==='critique','reconstruction only for existing artifacts');return []}
 if(stage==='reconstruction-plan'){ensure(run.task!=='create','reconstruction only for existing artifacts');return ['reconstruction-prepare']}
 if(stage==='production-plan'){ensure(run.task!=='critique','critique is read-only');return run.task==='redesign'?['reconstruction-plan']:[]}
 if(stage==='vmi-explore'){ensure(run.task!=='critique','critique is read-only');return ['production-plan']}
 if(stage==='vmi-packet')return ['production-plan','vmi-explore'];
 if(stage==='specialist-plan'){ensure(run.task!=='critique','critique is read-only');return ['production-plan']}
 throw Error('unknown production stage');
}
export function additionalDependencies(stage,run,prior){
 return run.workflow==='production'&&stage==='specialist-plan'&&prior['production-plan'].output.selectedMechanisms.length?['vmi-packet']:[];
}
export function checkDependencies(stage,input,run,prior){
 if(run.workflow!=='production')return;
 if(stage==='reconstruction-plan')ensure(input.inputFingerprint===prior['reconstruction-prepare'].output.inputFingerprint,'reconstruction evidence mismatch');
 if(stage==='production-plan'&&run.task==='redesign')ensure(prior['reconstruction-plan'].output.buildEligible===true,'reconstruction plan blocked');
 if(stage==='vmi-explore'||stage==='vmi-packet'){
  const plan=prior['production-plan'].output;
  ensure(plan.designEligible,'production plan blocked');
  ensure(plan.selectedMechanisms.length===1,'P1a supports one selected metaphor slice; zero or multiple require another route');
  ensure(input.sliceId===plan.selectedMechanisms[0],'VMI input must bind selected slice ID');
 }
}
export function evaluateProduction(stage,input,run,prior){
 if(stage==='reconstruction-prepare'){
  ensure(input.ir?.sourceRef==='sha256:'+run.source.sha256,'IR/source bytes mismatch');
  return prepareReconstruction(input.ir,input.runtime??null);
 }
 if(stage==='reconstruction-plan'){
  const result=planReconstruction(prior['reconstruction-prepare'].output,input);
  ensure((input.packet?.scope==='critique')===(run.task==='critique'),'reconstruction scope mismatch');
  return result;
 }
 if(stage==='specialist-plan')return runSpecialists(input,prior['production-plan'].output,prior);
 if(stage==='production-plan'){
  const {revision,purpose,opportunities,quality,execution}=input;
  ensure(Number.isInteger(revision)&&revision>=1,'revision required');
  ensure(opportunities?.revision===revision&&quality?.revision===revision&&execution?.revision===revision,'all plan revisions must match');
  ensure(quality.purpose===purpose&&execution.purpose===purpose,'plan purpose mismatch');
  ensure(quality.substantial===true&&execution.substantial===true,'production route requires substantial review');
  const opportunity=auditVisualOpportunity(opportunities);
  const depth=auditQualityDepth(quality);
  const gates=auditExecution(execution,rules);
  const selectedMechanisms=opportunities.slices.filter(s=>s.mechanism==='selected').map(s=>s.id);
  const blockers=[];
  if(!opportunity.designEligible)blockers.push('visual-opportunity');
  if(!depth.buildEligible)blockers.push('quality-depth');
  if(!gates.buildEligible)blockers.push('execution-gates');
  if(new Set(opportunities.inventory.map(s=>s.page)).size>1&&!quality.multiRoute)blockers.push('multi-route quality context required');
  if(selectedMechanisms.length>1)blockers.push('multiple metaphor slices not supported by P1a');
  return {revision,purpose,selectedMechanisms,specialists:specialistRequirements(quality,opportunities),opportunity,depth,gates,blockers,designEligible:blockers.length===0,releaseAuthorized:false,scope:'structural audit of authored inputs, not factual or aesthetic verification'};
 }
 throw Error('unknown production stage');
}
export function productionStatus(run,stages){
 const result={workflow:'production',task:run.task,releaseAuthorized:false,buildEligible:false,scope:'pre-build structural eligibility only; no final artifact or independent visual review'};
 const next=(stage,blockers=[])=>({...result,status:blockers.length?'blocked':'pending',next:stage,blockers});
 if(run.task!=='create'){
  if(!stages['reconstruction-prepare'])return next('reconstruction-prepare');
  if(!stages['reconstruction-plan'])return next('reconstruction-plan');
  const p=stages['reconstruction-plan'];
  if(run.task==='critique')return p.critiqueReady?{...result,status:'critique-ready',next:null,blockers:[]}:next('reconstruction-plan',p.errors);
  if(!p.buildEligible)return next('reconstruction-plan',p.errors.length?p.errors:['reconstruction not eligible']);
 }
 const p=stages['production-plan'];
 if(!p)return next('production-plan');
 if(!p.designEligible)return next('production-plan',p.blockers);
 if(p.selectedMechanisms.length){
  if(!stages['vmi-explore'])return next('vmi-explore');
  const v=stages['vmi-packet'];
  if(!v)return next('vmi-packet');
  if(!v.html||v.issues?.length)return next('vmi-packet',['VMI preview unavailable or unresolved issues']);
  if(v.openDiscoveryRequired)return next('vmi-packet',['open-domain discovery requires review; P1a cannot certify resolution']);
 }
 if(p.specialists.areas.length){
  const s=stages['specialist-plan'];
  if(!s)return {...next('specialist-plan'),requiredAreas:p.specialists.areas,integrated:p.specialists.integrated};
  if(!s.planningReady)return next('specialist-plan',s.blockers);
 }
 return {...result,status:'build-eligible',buildEligible:true,next:'build and independently render/review; P1b does not authorize delivery',blockers:[]};
}
