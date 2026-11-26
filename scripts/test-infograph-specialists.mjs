import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {runSpecialists,specialistRequirements} from './execution-specialists.mjs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const workspace=load('../skills/infograph-master/engine/workspace-integration.example.json');
const director=load('../skills/infograph-master/engine/narrative-director.example.json');
const rules=load('../skills/infograph-master/references/execution-gates.json');
const dir=mkdtempSync(join(tmpdir(),'infograph-specialists-'));
const cli=fileURLToPath(new URL('./infograph.mjs',import.meta.url));
const source=join(dir,'brief.txt');writeFileSync(source,'synthetic integration fixture only');
const call=(args,ok=true)=>{const r=spawnSync(process.execPath,[cli,...args],{encoding:'utf8'});assert.equal(r.status,ok?0:1,r.stderr||r.stdout);return r.stdout?JSON.parse(r.stdout):null};
const save=(name,value)=>{const path=join(dir,name);writeFileSync(path,JSON.stringify(value));return path};
const makePlan=(purpose,inventory,flags,areas)=>{
 const revision=1;
 return {revision,purpose,opportunities:{revision,inventory,slices:inventory.map(x=>({id:x.id,revision,task:'compare '+x.id,relation:'rank',ref:x.ref,selectedFamily:x.id,candidates:[x.id,'bar'],rationale:'synthetic comparison',rendererPlan:'SVG',mechanism:'none',expression:'none'}))},
 quality:{revision,purpose,substantial:true,multiRoute:false,mixedModes:false,semanticInteraction:false,richScene:false,...flags,areas:Array.from({length:6},(_,i)=>{const id='QD0'+(i+1);return {id,applicable:areas.includes(id)||id==='QD06',reason:'synthetic disposition',design:{revision,status:'pass',ref:'fixture:'+id}}})},
 execution:{revision,purpose,substantial:true,records:[...new Set(rules.flatMap(g=>g.requires))].map(key=>({key,revision,status:'pass',ref:'fixture:'+key}))}};
};
try{
 const inventory=workspace.atlas.slices.map(s=>({id:s.id,page:s.pageId,ref:'fixture:'+s.id}));
 const plan=makePlan('explain',inventory,{multiRoute:true,mixedModes:true,semanticInteraction:true,richScene:true},['QD01','QD02','QD03','QD04','QD05']);
 const run=join(dir,'integrated');call(['start-workflow','create',source,run]);
 call(['run',run,'production-plan',save('plan.json',plan)]);
 const pending=call(['status',run]);assert.equal(pending.next,'specialist-plan');assert.equal(pending.integrated,true);
 call(['run',run,'specialist-plan',save('integrated.json',{revision:1,workspace})]);
 assert.equal(call(['status',run]).buildEligible,true);
 const out=JSON.parse(readFileSync(join(run,'specialist-plan','output.json'),'utf8'));
 assert.equal(out.executions.length,6);assert.equal(out.outputs.workspace.rendered,false);assert.equal(out.releaseAuthorized,false);
 const receipt=JSON.parse(readFileSync(join(run,'specialist-plan','receipt.json'),'utf8'));
 assert.match(receipt.dependencies['production-plan'],/^[a-f0-9]{64}$/);
 const bad=join(dir,'bad');call(['start-workflow','create',source,bad]);call(['run',bad,'production-plan',save('plan2.json',plan)]);
 const wrong=structuredClone(workspace);wrong.atlas.slices[0].id='wrong';
 assert.equal(call(['run',bad,'specialist-plan',save('wrong.json',{revision:1,workspace:wrong})],false).status,'blocked');
 const solo=join(dir,'solo'),single=makePlan('report',[{id:'one',page:'page',ref:'fixture'}],{},['QD01']);
 call(['start-workflow','create',source,solo]);call(['run',solo,'production-plan',save('single.json',single)]);
 assert.equal(call(['status',solo]).next,'specialist-plan');
 call(['run',solo,'specialist-plan',save('director.json',{revision:1,routes:{QD01:{mode:'compile',spec:director}}})]);
 assert.equal(call(['status',solo]).buildEligible,true);
 const splan={revision:1,designEligible:true,selectedMechanisms:[],specialists:specialistRequirements(single.quality,single.opportunities)};
 const staticResult=runSpecialists({revision:1,routes:{QD01:{mode:'static',reason:'static report, no playback needed',evidenceRef:'fixture:storyboard'}}},splan,{});
 assert.equal(staticResult.executions[0].status,'not-applicable-to-runtime');
 assert.throws(()=>runSpecialists({revision:2,routes:{}},splan,{}),/revision/);
 assert.throws(()=>runSpecialists({revision:1,routes:{}},splan,{}),/coverage/);
 const partial=makePlan('monitor',inventory,{multiRoute:true},['QD05']);
 const pplan={revision:1,designEligible:true,selectedMechanisms:[],specialists:specialistRequirements(partial.quality,partial.opportunities)};
 assert.equal(runSpecialists({revision:1,routes:{QD05:{mode:'compile',spec:{atlas:workspace.atlas,spec:workspace.spatial}}}},pplan,{}).planningReady,true);
 assert.throws(()=>runSpecialists({revision:1,routes:{QD05:{mode:'static',reason:'skip',evidenceRef:'fixture'}}},pplan,{}),/not permitted/);
 const full={revision:1,designEligible:true,selectedMechanisms:[],specialists:{...specialistRequirements(plan.quality,plan.opportunities),integrated:false}};
 const direct=runSpecialists({revision:1,routes:{QD01:{mode:'compile',spec:{story:workspace.story,scene:workspace.scene}},QD02:{mode:'compile',spec:workspace.choreography},QD03:{mode:'compile',spec:workspace.concept},QD04:{mode:'compile',spec:workspace.motion},QD05:{mode:'compile',spec:{atlas:workspace.atlas,spec:workspace.spatial}}}},full,{});
 assert.equal(direct.executions.length,5);assert.equal(direct.planningReady,true);
 const vplan={...splan,selectedMechanisms:['one']};
 assert.throws(()=>runSpecialists({revision:1,routes:{}},vplan,{}),/VMI preview/);
 assert.throws(()=>runSpecialists({revision:1,routes:{}},vplan,{'vmi-packet':{output:{html:'preview',issues:[]},receipt:{outputSha256:'a'}}}),/VMI evidence mismatch/);
 console.log('P1b specialist execution tests passed');
}finally{rmSync(dir,{recursive:true,force:true})}
