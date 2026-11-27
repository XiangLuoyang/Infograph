import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {integrationContract,integrationTask,assembleArtifact,verifyIntegratedHTML} from './execution-integration.mjs';
import {compileArtDirections,selectArtDirection,artDirectionCSS} from '../skills/infograph-master/engine/art-direction-production.mjs';
import {compileSpatialComposition} from '../skills/infograph-master/engine/global-spatial-composition.mjs';
import {evaluatePacket} from '../skills/infograph-master/visual-metaphor-intelligence/engine/pipeline.mjs';
const load=p=>JSON.parse(readFileSync(new URL('../skills/infograph-master/'+p,import.meta.url),'utf8'));
const art=compileArtDirections({purpose:'report',theme:'Synthetic test',readerTask:'Compare',density:'normal',evidenceRef:'fixture'},load('engine/art-directions.json'),load('engine/styles.json'));
const selected=selectArtDirection(art,'editorial','fixture rationale');
const {atlas,spec}=load('engine/global-spatial-composition.example.json');
const slice=spec.slices[0];
slice.composition={ref:'fixture',regions:[{id:'hero',priority:5,minWidth:320,minHeight:180,ref:'fixture'},{id:'facts',priority:3,minWidth:180,minHeight:120,ref:'fixture'}]};
for(const v of slice.variants){delete v.columns;delete v.rows;delete v.rowSizes;v.candidateId=v.id==='desktop'?'lead-split':'stack'}
const spatial=compileSpatialComposition(atlas,spec);
const base='visual-metaphor-intelligence/';
const vmi=evaluatePacket(load(base+'benchmark/studio-packet.json'),load(base+'ontology/objects.json'),load(base+'ontology/mechanisms.json'));assert.ok(vmi.html);
const contract=integrationContract({'production-plan':{artDirection:{selected,css:artDirectionCSS(selected)}},'specialist-plan':{outputs:{QD05:spatial}},'vmi-packet':{...vmi,sliceId:'overview'}});
assert.equal(integrationTask(contract).slots.length,3);
const template='<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}</style><!--IG:ART--><!--IG:SPATIAL--><body data-ig-art="editorial"><main data-ig-workspace data-ig-tier="desktop"><header data-ig-shell="header">Header</header><nav data-ig-shell="nav">Nav</nav><div data-ig-shell="filters">Filter</div><div data-ig-shell="work"><section data-ig-slice="overview"><div data-ig-region="hero"><h2 id="metric">Fixture</h2><!--IG:VMI-1--></div><aside data-ig-region="facts">Evidence</aside></section></div></main><script>const tier=()=>document.querySelector("[data-ig-workspace]").dataset.igTier=innerWidth>=1100&&innerHeight>=700?"desktop":innerWidth>=800&&innerHeight>=500?"compact":"mobile";tier();addEventListener("resize",tier)</script>';
const html=assembleArtifact(template,contract);
assert.equal(verifyIntegratedHTML(html,contract).slots.length,3);
for(const id of ['ART','SPATIAL','VMI-1']){assert.throws(()=>assembleArtifact(template.replace('<!--IG:'+id+'-->',''),contract));const s=contract.slots.find(x=>x.id===id);assert.throws(()=>verifyIntegratedHTML(html.replace(s.fragment,''),contract));assert.throws(()=>verifyIntegratedHTML(html+s.fragment,contract))}
assert.throws(()=>assembleArtifact(template+'<!--IG:UNKNOWN-->',contract));
assert.match(html,/sandbox="allow-scripts"/);
if(process.argv.includes('--browser')){
 const {auditProductionHTML}=await import('../skills/infograph-master/engine/production-browser-audit.mjs');
 const dir=mkdtempSync(join(tmpdir(),'ig-integration-'));
 try{
  const file=join(dir,'test.html'),plan={viewports:[{id:'desktop',width:1440,height:900},{id:'mobile',width:390,height:844}],cases:[{id:'overview',sliceId:'overview',kind:'baseline',steps:[],checks:[{selector:'#metric',textIncludes:'Fixture'}]}]};
  // This fixture isolates application checks; it is not a full artifact/delivery acceptance.
  writeFileSync(file,html);
  const out=await auditProductionHTML(file,plan,dir,{trusted:true,integration:contract.runtime});
  for(const c of out.cases){assert.deepEqual(c.integration.map(x=>[x.id,x.status]),[['ART','pass'],['SPATIAL','pass'],['VMI-1','pass']],JSON.stringify(c.integration));}
  const badDir=join(dir,'bad');mkdirSync(badDir);
  writeFileSync(file,html.replace('data-ig-art="editorial"','data-ig-art="unused"'));
  const bad=await auditProductionHTML(file,plan,badDir,{trusted:true,integration:contract.runtime});
  assert.ok(bad.cases.every(c=>c.issues.some(i=>i.kind==='engine-application-failed'&&i.id==='ART')));
 }finally{rmSync(dir,{recursive:true,force:true})}
}
console.log('Engine integration fragments, slots, and optional browser application checks passed');
