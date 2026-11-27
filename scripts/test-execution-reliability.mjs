import assert from 'node:assert/strict';
import {authoringTask,spatialScaffold,specialistScaffold} from './execution-authoring.mjs';
import {compileSpatialComposition} from '../skills/infograph-master/engine/global-spatial-composition.mjs';

import {atlasIdentityDiff} from './execution-specialists.mjs';
const inventory=[{id:'summary',page:'overview'},{id:'trend',page:'overview'},{id:'detail',page:'analysis'}];
const requirements={inventory,areas:['QD05'],integrated:false};
const scaffold=spatialScaffold(requirements);
assert.deepEqual(scaffold.conflicts,[]);
assert.deepEqual(scaffold.invalidIds,[]);
assert.deepEqual(scaffold.atlas.slices.map(x=>[x.id,x.pageId]),inventory.map(x=>[x.id,x.page]));
assert.deepEqual(scaffold.spec.pages[0].sliceOrder,['summary','trend']);
assert.equal(new Set(scaffold.atlas.inventory.map(x=>x.id)).size,5);
assert.deepEqual(spatialScaffold({inventory:[{id:'overview',page:'overview'}]}).conflicts,['overview']);
assert.deepEqual(spatialScaffold({inventory:[{id:'bad id',page:'overview'}]}).invalidIds,['bad id']);
assert.throws(()=>compileSpatialComposition(scaffold.atlas,scaffold.spec),/missing spatial contract/);
const prior={'production-plan':{output:{revision:1,specialists:requirements,selectedMechanisms:[]},receipt:{outputSha256:'synthetic'}}};
for(const stage of ['reconstruction-prepare','production-plan','specialist-plan']){
 const task=authoringTask(stage,{},prior,[]);
 for(const ref of ['context-guide.md','acceptance.md','design-principles.md']){
  assert(task.references.includes('skills/infograph-master/references/'+ref));
 }
 assert.equal(new Set(task.references).size,task.references.length);
}
const task=authoringTask('specialist-plan',{},prior,[]);
assert.deepEqual(task.template.routes.QD05.spec.atlas,scaffold.atlas);
assert.deepEqual(task.template.routes.QD05.spec.spec,scaffold.spec);
assert.equal(task.template.routes.QD05.spec.atlas.coverage,null);
assert.deepEqual(atlasIdentityDiff(scaffold.atlas,requirements),{missing:[],unexpected:[],duplicates:[]});
assert.deepEqual(atlasIdentityDiff({slices:[{id:'summary',pageId:'overview'},{id:'summary',pageId:'overview'},{id:'trend',pageId:'analysis'}]},requirements),{missing:[['trend','overview'],['detail','analysis']],unexpected:[['trend','analysis']],duplicates:[['summary','overview']]});
const integrated=structuredClone(prior);
integrated['production-plan'].output.specialists={...requirements,integrated:true,areas:['QD01','QD02','QD03','QD04','QD05']};
const workspace=authoringTask('specialist-plan',{},integrated,[]).template.workspace;
assert.deepEqual(workspace.atlas,scaffold.atlas);
assert.deepEqual(workspace.spatial,scaffold.spec);
assert.deepEqual(workspace.story,specialistScaffold('QD01').story);
assert.deepEqual(workspace.choreography,specialistScaffold('QD02'));
assert.deepEqual(workspace.concept,specialistScaffold('QD03'));
assert.deepEqual(workspace.motion,specialistScaffold('QD04'));
assert.equal(workspace.concept.source,null);
console.log('execution reliability scaffold regression passed');

import {activationSignals,auditActivation} from './execution-activation.mjs';
const prepared={ir:{nodes:[{id:'t',kind:'table',ref:'source#t',label:'Table'},{id:'c',kind:'chart',ref:'source#c',label:'Chart'},{id:'i',kind:'control',ref:'source#i',label:'Filter'}]}};
const signals=activationSignals(prepared);
assert.equal(signals.length,3);
const slices=[{id:'s',expression:'retain',mechanism:'none'}];
const quality={semanticInteraction:false};
const reviews=signals.map(s=>({observationId:s.id,ref:s.ref,disposition:'mapped',sliceId:'s',reason:'retain exact lookup',mechanismReason:'ordinary monitoring chart',staticReason:'filter only'}));
assert.equal(auditActivation(signals,reviews,slices,quality).eligible,true);
assert.equal(auditActivation(signals,[],slices,quality).eligible,false);
assert.equal(auditActivation(signals,reviews,[{...slices[0],expression:'none'}],quality).eligible,false);
assert.equal(auditActivation(signals,reviews.map(r=>({...r,ref:'wrong'})),slices,quality).eligible,false);
assert.equal(auditActivation([],undefined,slices,quality).eligible,true);
const sourcePrior={'reconstruction-prepare':{output:prepared,receipt:{outputSha256:'synthetic'}}};
assert.equal(authoringTask('production-plan',{},sourcePrior,[]).template.activationReviews.length,3);
console.log('activation regression assertions passed');

const scenePrepared={ir:{nodes:[{id:'m',kind:'region',label:'视觉隐喻',ref:'source#m'},{id:'ordinary',kind:'chart',label:'Sales trend',ref:'source#ordinary'}]}};
const sceneSignals=activationSignals(scenePrepared);
assert.equal(sceneSignals.filter(s=>s.review==='mechanism-candidate').length,1);
const hint=sceneSignals.find(s=>s.kind==='scene-hint');
const review={observationId:hint.id,ref:hint.ref,evidenceRefs:hint.evidenceRefs,disposition:'mapped',sliceId:'s',reason:'assess existing scene',mechanismReason:'compare conventional alternative',mechanismDecision:'reviewed'};
assert.equal(auditActivation([hint],[review],slices,quality).eligible,true);
assert.equal(auditActivation([hint],[{...review,mechanismDecision:'selected'}],slices,quality).eligible,false);
assert.equal(auditActivation([hint],[{...review,mechanismDecision:'selected'}],[{...slices[0],mechanism:'selected'}],quality).eligible,true);
assert.equal(auditActivation([hint],[{...review,evidenceRefs:[]}],slices,quality).eligible,false);
assert.equal(auditActivation([hint],[],slices,quality).eligible,false);

const depthSignal=sceneSignals.find(s=>s.review==='scene-depth');
assert.ok(depthSignal);
const depthReview={...review,observationId:depthSignal.id,artDecision:'simple',motionDecision:'static',artReason:'flat diagram sufficient',motionReason:'no state change'};
assert.equal(auditActivation([depthSignal],[depthReview],slices,quality).eligible,true);
assert.equal(auditActivation([depthSignal],[{...depthReview,artDecision:'rich'}],slices,quality).eligible,false);
const richQuality={...quality,richScene:true,areas:[{id:'QD03',applicable:true},{id:'QD04',applicable:true}]};
assert.equal(auditActivation([depthSignal],[{...depthReview,motionDecision:'physical'}],slices,richQuality).eligible,true);
assert.equal(auditActivation([depthSignal],[{...depthReview,motionDecision:'semantic'}],slices,richQuality).eligible,false);
console.log('scene depth regression assertions passed');

import {bridgeVmiReference} from '../skills/infograph-master/engine/vmi-reference-bridge.mjs';
const bridgeFixture={semantic:{conceptId:'fixture',evidenceRef:'fixture#evidence',objects:[{id:'a',label:'Supply'},{id:'b',label:'Demand'}],mappings:[{id:'edge',from:'a',to:'b',relation:'transfer'}]},scene:{staticSummary:'Qualitative fixture',objects:[{id:'a',desktop:[80,44,160,88],mobile:[36,62,72,124],shapes:[{type:'circle'}]},{id:'b',desktop:[400,44,160,88],mobile:[36,310,72,124],shapes:[{type:'rect'}]}],states:[{id:'base'}]},design:{id:'fixture'}};
for(const viewport of ['desktop','mobile']){
 const b=bridgeVmiReference(bridgeFixture,{viewport});
 assert.deepEqual(b.semantic,bridgeFixture.semantic);
 assert.deepEqual(b.manifest.objects[0].bounds,[.1,.1,.2,.2]);
 assert.equal(b.compiled.planningReady,true);
 assert.equal(b.manifest.links[0].from.object,b.identity[0].referenceId);
 assert.equal(b.rendered,false);
 assert.equal(b.releaseAuthorized,false);
 assert.deepEqual(b.primitiveAssets[0].shapes,bridgeFixture.scene.objects[0].shapes);
}
assert.throws(()=>bridgeVmiReference(bridgeFixture,{viewport:'unknown'}));
const brokenBridge=structuredClone(bridgeFixture);brokenBridge.semantic.mappings[0].to='missing';
assert.throws(()=>bridgeVmiReference(brokenBridge));
console.log('VMI reference bridge regression passed');

import {renderVmiReferencePreview} from '../skills/infograph-master/engine/vmi-reference-bridge.mjs';
import {renderStructuredPrimitives} from '../skills/infograph-master/engine/reference-renderer.mjs';
const previewFixture=structuredClone(bridgeFixture);
previewFixture.design.colors={surface:'#ffffff',metal:'#778899',accent:'#446688',warning:'#aa4400',line:'#333333',highlight:'#eeeeee'};
Object.assign(previewFixture.design.colors,{background:'#f5f3ee',ink:'#222222',muted:'#555555'});
Object.assign(previewFixture.design,{font:'serif',radius:8});
previewFixture.scene.title='Bridge fixture';
previewFixture.scene.states=[{id:'base',label:'Base',explanation:'Normal supply',highlight:[]},{id:'pressure',label:'Pressure',explanation:'Supply constraint',highlight:['b']}];
previewFixture.scene.initialState='pressure';

previewFixture.scene.objects[0].shapes=[{type:'circle',cx:50,cy:50,r:30,fill:'accent',stroke:'none',sw:0}];
previewFixture.scene.objects[1].shapes=[{type:'rect',x:10,y:10,w:80,h:80,rx:4,fill:'metal',stroke:'line',sw:1}];
for(const viewport of ['desktop','mobile']){
 const p=renderVmiReferencePreview(previewFixture,{viewport});
 assert.ok(p.html.includes('<circle cx="50" cy="50" r="30" fill="#446688"'));
 assert.ok(p.html.includes('<rect x="10" y="10" width="80" height="80"'));
 assert.equal(p.report.renderedHTML,true);
 assert.equal(p.report.browserVerified,false);
 assert.equal(p.releaseAuthorized,false);
}
const asset={colors:previewFixture.design.colors,shapes:previewFixture.scene.objects[0].shapes};
assert.throws(()=>renderStructuredPrimitives({...asset,shapes:[{...asset.shapes[0],r:90}]}));
assert.throws(()=>renderStructuredPrimitives({...asset,colors:{accent:'"><script>'}}));
assert.throws(()=>renderStructuredPrimitives({...asset,shapes:[{type:'path',d:'M0 0<script>',fill:'accent',stroke:'none',sw:0}]}));
console.log('VMI reference HTML regression passed');

import {boundaryPort} from '../skills/infograph-master/engine/vmi-reference-bridge.mjs';
assert.deepEqual(boundaryPort([0,0,.2,.2],[.6,0,.2,.2]),[1,.5]);
assert.deepEqual(boundaryPort([.6,0,.2,.2],[0,0,.2,.2]),[0,.5]);
assert.deepEqual(boundaryPort([0,0,.2,.2],[0,.6,.2,.2]),[.5,1]);
assert.deepEqual(boundaryPort([0,.6,.2,.2],[0,0,.2,.2]),[.5,0]);
assert.throws(()=>boundaryPort([0,0,.2,.2],[0,0,.2,.2]));
assert.throws(()=>boundaryPort([0,0,0,.2],[.6,0,.2,.2]));
for(const viewport of ['desktop','mobile']){
 const b=bridgeVmiReference(bridgeFixture,{viewport});
 const l=b.manifest.links[0],a=b.manifest.objects[0],z=b.manifest.objects[1];
 assert.deepEqual(a.ports[l.from.port],viewport==='desktop'?[1,.5]:[.5,1]);
 assert.deepEqual(z.ports[l.to.port],viewport==='desktop'?[0,.5]:[.5,0]);
}
console.log('Boundary port regression passed');

import {referenceDesignCSS} from '../skills/infograph-master/engine/reference-renderer.mjs';
const inheritedCSS=referenceDesignCSS(previewFixture.design);
assert.ok(inheritedCSS.includes('body{background:#f5f3ee;color:#222222;font-family:Georgia,serif'));
assert.ok(inheritedCSS.includes('border-radius:8px'));
assert.equal(referenceDesignCSS(undefined),'');
assert.throws(()=>referenceDesignCSS({...previewFixture.design,font:'invalid'}));
assert.throws(()=>referenceDesignCSS({...previewFixture.design,radius:100}));
assert.throws(()=>referenceDesignCSS({...previewFixture.design,colors:{...previewFixture.design.colors,background:'red;display:none'}}));
assert.ok(renderVmiReferencePreview(previewFixture).html.includes(inheritedCSS));
console.log('Reference design inheritance regression passed');

const statePreview=renderVmiReferencePreview(previewFixture);
assert.equal(statePreview.bridge.previewManifest.staticScene,'state-2');
assert.ok(statePreview.html.includes('data-scene="state-2"'));
assert.match(statePreview.html,/id="obj-object-2" class="[^"]*state-emphasis/);
assert.ok(statePreview.html.includes('Pressure — Supply constraint'));
const badState=structuredClone(previewFixture);badState.scene.states[1].highlight=['unknown'];
assert.throws(()=>renderVmiReferencePreview(badState));
badState.scene.initialState='missing';
assert.throws(()=>renderVmiReferencePreview(badState));
console.log('State mapping static HTML regression passed');

import {routeVisualFidelity} from '../skills/infograph-master/engine/visual-fidelity-router.mjs';
const fidelityFixture=['flat','surface','photoreal','spatial'].map((fidelity,i)=>({objectId:'f-'+i,fidelity,dynamic:false,reason:'fixture requirement',evidenceRef:'fixture#design'}));
const routed=routeVisualFidelity(fidelityFixture);
assert.deepEqual(routed.map(r=>r.renderer),['svg','css','raster','webgl']);
assert.deepEqual(routed.map(r=>r.status),['route-ready','production-required','production-required','production-required']);
assert.ok(routed[2].workOrders.some(w=>w.kind==='renderer-capability'));
assert.ok(routeVisualFidelity([fidelityFixture[2]],{raster:true})[0].workOrders.some(w=>w.kind==='verified-raster-asset'));
assert.equal(routeVisualFidelity([{...fidelityFixture[2],dynamic:true}])[0].renderer,'webgl');
assert.ok(routed.every(r=>!r.rendered&&!r.releaseAuthorized));
assert.throws(()=>routeVisualFidelity([fidelityFixture[0],fidelityFixture[0]]));
assert.throws(()=>routeVisualFidelity([{...fidelityFixture[0],reason:''}]));
console.log('Visual fidelity routing regression passed');

import {auditVisualProduction,verifyVisualProduction} from '../skills/infograph-master/engine/visual-fidelity-router.mjs';
import {createHash as productionHash} from 'node:crypto';
const surfaceRoutes=routeVisualFidelity([fidelityFixture[1]]);
const productionBytes=new TextEncoder().encode('fixture surface asset');
const productionRecord={objectId:fidelityFixture[1].objectId,kind:'surface-design',artifactRef:'fixture:surface',evidenceRef:'fixture#design',status:'produced',sha256:productionHash('sha256').update(productionBytes).digest('hex')};
const productionAudit=auditVisualProduction(surfaceRoutes,[productionRecord]);
assert.equal(productionAudit.declaredComplete,true);
assert.equal(productionAudit.verified,false);
assert.equal(auditVisualProduction(surfaceRoutes).missing.length,1);
assert.throws(()=>auditVisualProduction(surfaceRoutes,[productionRecord,productionRecord]));
assert.throws(()=>auditVisualProduction(surfaceRoutes,[{...productionRecord,sha256:'bad'}]));
assert.equal(verifyVisualProduction(productionAudit,new Map()).verified,false);
assert.equal(verifyVisualProduction(productionAudit,new Map([['fixture:surface',new Uint8Array([1])]])).ledger[0].verification,'digest-mismatch');
const verifiedProduction=verifyVisualProduction(productionAudit,new Map([['fixture:surface',productionBytes]]));
assert.equal(verifiedProduction.verified,true);
assert.equal(verifiedProduction.formatVerified,false);
assert.equal(verifiedProduction.releaseAuthorized,false);
console.log('Visual production digest regression passed');

import {validateVisualFormats} from '../skills/infograph-master/engine/visual-fidelity-router.mjs';
function formatFixture(routes,record,asset){
 const bytes=new TextEncoder().encode(JSON.stringify(asset));
 const audit=auditVisualProduction(routes,[{...record,sha256:productionHash('sha256').update(bytes).digest('hex')}]);
 return validateVisualFormats(audit,new Map([[record.artifactRef,bytes]]));
}
const matte={family:'matte',roughness:.5,metalness:0,opacity:1};
assert.equal(formatFixture(surfaceRoutes,productionRecord,{material:matte}).formatVerified,true);
for(const material of [{...matte,metalness:.5},{...matte,opacity:.5},{...matte,roughness:2},{...matte,family:'unknown'}]){
 assert.equal(formatFixture(surfaceRoutes,productionRecord,{material}).formatVerified,false);
}
const rasterRoutes=routeVisualFidelity([fidelityFixture[2]],{raster:true});
const rasterRecord={...productionRecord,objectId:fidelityFixture[2].objectId,kind:'verified-raster-asset'};
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
const rasterAsset={data:'data:image/png;base64,'+png,source:'synthetic regression fixture',permission:'cleared',sha256:productionHash('sha256').update(Buffer.from(png,'base64')).digest('hex')};
assert.equal(formatFixture(rasterRoutes,rasterRecord,rasterAsset).formatVerified,true);
assert.equal(formatFixture(rasterRoutes,rasterRecord,{...rasterAsset,permission:'unknown'}).formatVerified,false);
assert.equal(formatFixture(rasterRoutes,rasterRecord,{...rasterAsset,sha256:'0'.repeat(64)}).formatVerified,false);
console.log('Visual asset format regression passed');

const mixedRequirements=[{...fidelityFixture[1],objectId:'a'},{...fidelityFixture[2],objectId:'b'}];
const mixedAssets=new Map([['surface:a',new TextEncoder().encode(JSON.stringify({material:matte}))],['raster:b',new TextEncoder().encode(JSON.stringify(rasterAsset))]]);
const mixedRecords=[{...productionRecord,objectId:'a',artifactRef:'surface:a'},{...rasterRecord,objectId:'b',artifactRef:'raster:b'}].map(r=>({...r,sha256:productionHash('sha256').update(mixedAssets.get(r.artifactRef)).digest('hex')}));
const mixedOptions={visualRequirements:mixedRequirements,productionRecords:mixedRecords,artifacts:mixedAssets};
const mixedPreview=renderVmiReferencePreview(previewFixture,mixedOptions);
assert.equal(mixedPreview.bridge.production.formatVerified,true);
assert.deepEqual(mixedPreview.bridge.previewManifest.objects.map(o=>o.fidelity),['surface','photoreal']);
assert.ok(mixedPreview.html.includes('data:image/png;base64,'+png));
assert.equal(mixedPreview.releaseAuthorized,false);
assert.throws(()=>renderVmiReferencePreview(previewFixture,{...mixedOptions,artifacts:new Map()}));
assert.throws(()=>renderVmiReferencePreview(previewFixture,{visualRequirements:[{...fidelityFixture[0],objectId:'unknown'}]}));
console.log('Mixed backend asset bridge regression passed');

const spatialAsset={id:'a',fidelity:'spatial',material:{...matte,family:'metal',metalness:.7},geometry:{preset:'assembly',parts:[{id:'base',type:'box',center:[0,0,0],size:[1,.2,1],color:[.3,.4,.5],metalness:.7,roughness:.4}]}};
const spatialBytes=new TextEncoder().encode(JSON.stringify(spatialAsset));
const spatialOptions={webgl:true,visualRequirements:[{...fidelityFixture[3],objectId:'a'}],productionRecords:[{...productionRecord,objectId:'a',kind:'validated-geometry-material',artifactRef:'spatial:a',sha256:productionHash('sha256').update(spatialBytes).digest('hex')}],artifacts:new Map([['spatial:a',spatialBytes]])};
const spatialPreview=renderVmiReferencePreview(previewFixture,spatialOptions);
assert.equal(spatialPreview.bridge.production.formatVerified,true);
assert.equal(spatialPreview.bridge.previewManifest.objects[0].fidelity,'spatial');
assert.ok(spatialPreview.html.includes('<canvas'));
assert.throws(()=>renderVmiReferencePreview(previewFixture,{...spatialOptions,webgl:false}));
assert.equal(formatFixture(routeVisualFidelity(spatialOptions.visualRequirements,{webgl:true}),spatialOptions.productionRecords[0],{...spatialAsset,geometry:{preset:'assembly',parts:[]}}).formatVerified,false);
console.log('WebGL bridge contract regression passed');

const fourScene=structuredClone(previewFixture);
fourScene.scene.title='Allocation mechanism — mixed backend fixture';
for(const [i,id] of ['c','d'].entries()){
 fourScene.semantic.objects.push({id,label:i?'Allocation indicator':'Distribution assembly'});
 fourScene.scene.objects.push({id,desktop:[80+i*320,264,160,88],mobile:[216,62+i*248,72,124],shapes:structuredClone(previewFixture.scene.objects[0].shapes)});
 fourScene.semantic.mappings.push({id:'edge-'+id,from:'b',to:id,relation:'transfer'});
}
const fourOptions={webgl:true,visualRequirements:[...mixedRequirements,{...fidelityFixture[3],objectId:'c'},{...fidelityFixture[0],objectId:'d'}],productionRecords:[...mixedRecords,{...spatialOptions.productionRecords[0],objectId:'c'}],artifacts:new Map([...mixedAssets,...spatialOptions.artifacts])};
for(const viewport of ['desktop','mobile']){
 const p=renderVmiReferencePreview(fourScene,{...fourOptions,viewport});
 assert.equal(p.bridge.production.formatVerified,true);
 assert.deepEqual(p.bridge.previewManifest.objects.map(o=>o.fidelity),['surface','photoreal','spatial','flat']);
 assert.ok(p.html.includes('<canvas'));
 assert.ok(p.html.includes('data:image/png;base64,'+png));
 assert.ok(p.html.includes('<circle cx="50"'));
 assert.equal(p.releaseAuthorized,false);
}
console.log('Four-backend responsive scene HTML regression passed');

import {mkdirSync as previewMkdir,writeFileSync as previewWrite} from 'node:fs';
import {join as previewJoin} from 'node:path';
if(process.env.INFOGRAPH_PREVIEW_DIR){
 const dir=process.env.INFOGRAPH_PREVIEW_DIR;
 previewMkdir(dir,{recursive:true});
 for(const viewport of ['desktop','mobile']){
  const mixed=renderVmiReferencePreview(fourScene,{...fourOptions,viewport});
  const baseline=renderVmiReferencePreview(fourScene,{viewport});
  previewWrite(previewJoin(dir,'mixed-'+viewport+'.html'),mixed.html);
  previewWrite(previewJoin(dir,'baseline-'+viewport+'.html'),baseline.html);
 }
}
