// Controlled synthetic comparison; all variants use the same canonical VMI compiler.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {evaluatePacket} from '../skills/infograph-master/visual-metaphor-intelligence/engine/pipeline.mjs';
import {geometryTemplate} from '../skills/infograph-master/visual-metaphor-intelligence/engine/physical-geometry.mjs';
const load=p=>JSON.parse(readFileSync(new URL('../skills/infograph-master/visual-metaphor-intelligence/'+p,import.meta.url),'utf8'));
const packet=load('benchmark/studio-packet.json'),objects=load('ontology/objects.json'),ontology=load('ontology/mechanisms.json');
export function buildComparison(){
 const baseline=evaluatePacket(packet,objects,ontology);
 const materialPacket=structuredClone(packet),rotor=geometryTemplate('rotor');
 materialPacket.scene.objects.find(o=>o.id==='b').shapes=rotor.shapes;
 materialPacket.scene.surfaceRendering={version:1,rationale:'Matched reaction-wheel rotor morphology; materials decorative, not measured.',parts:[...rotor.parts.map(([shapeIndex,material])=>({objectId:'b',shapeIndex,material,encoding:'decorative-only',ref:'synthetic rotor template'})),...[['s',3,'brushed-metal'],['c',1,'brushed-metal'],['i',0,'brushed-metal'],['i',3,'matte-enamel']].map(([objectId,shapeIndex,material])=>({objectId,shapeIndex,material,encoding:'decorative-only',ref:'synthetic fixture, unified metal cues'}))],motions:[]};
 const material=evaluatePacket(materialPacket,objects,ontology);
 const composedPacket=structuredClone(materialPacket);
 delete composedPacket.scene.waypoints;
 for(const o of composedPacket.scene.objects){delete o.desktop;delete o.mobile}
 composedPacket.scene.composition={version:1,mode:'auto',focalObject:'b',intent:'Compare buffer and conditional relief while keeping separate symbolic edges',ref:'synthetic:buffer',minSize:64,focalScale:1.6};
 const composed=evaluatePacket(composedPacket,objects,ontology);
 const variants=[['baseline',baseline],['material',material],['composed',composed]];
 for(const [id,r] of variants){
  assert.equal(r.issues.length,0,id+': '+r.issues.join('; '));
  assert.ok(r.html&&r.plans.length===2,id+' missing preview');
  for(let i=0;i<2;i++)assert.deepEqual(r.plans[i].semantic,baseline.plans[i].semantic,id+' semantic drift');
 }
 assert.equal(material.plans[0].surfaceRendering.parts.length,8);
 assert.ok(composed.plans[0].compositionManifest?.selectedId);
 assert.deepEqual(material.plans[0].scene.objects.map(o=>[o.desktop,o.mobile]),baseline.plans[0].scene.objects.map(o=>[o.desktop,o.mobile]));
 return variants;
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function comparisonHTML(variants){
 const titles={baseline:'A · Original scene',material:'B · Rotor + decorative materials',composed:'C · B + generated composition'};
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VMI controlled composition comparison</title><style>body{margin:0;background:#f1f0ea;color:#24392f;font:15px/1.5 system-ui,sans-serif}main{max-width:1500px;margin:auto;padding:24px}h1{font-size:26px;margin:0}h2{font-size:18px;margin:0 0 8px}p{max-width:78ch}section{margin:24px 0;border-top:1px solid #b9c2b8;padding-top:16px}iframe{display:block;width:100%;height:900px;border:1px solid #b9c2b8;border-radius:8px;box-sizing:border-box}@media(max-width:700px){main{padding:12px}iframe{height:1400px}}</style><main><h1>VMI / controlled scene comparison</h1><p>Synthetic buffer fixture. All three variants preserve the same reviewed concept, relationships, states and style tokens. B changes rotor geometry and materials together; C changes layout only. No quantitative physics, business data or independent aesthetic approval. Compare both style buttons and both state controls in each original engine document.</p>'+variants.map(([id,r])=>'<section><h2>'+titles[id]+'</h2><iframe title="'+titles[id]+'" sandbox="allow-scripts" srcdoc="'+esc(r.html)+'"></iframe></section>').join('')+'</main></html>';
}
export function reportComparison(variants){
 return {version:1,fixture:'synthetic studio-packet.json',semanticParity:true,variants:variants.map(([id,r])=>({id,htmlSha256:createHash('sha256').update(r.html).digest('hex'),bytes:Buffer.byteLength(r.html),plans:r.plans.length,materials:r.plans[0].surfaceRendering?.parts.length??0,composition:r.plans[0].compositionManifest?.selectedId??null,feasibleCandidates:r.plans[0].compositionManifest?.candidates.filter(c=>c.status==='feasible').length??0})),browserVerified:false,independentVisualReview:false,releaseAuthorized:false,scope:'controlled compilation; visual, accessibility and business acceptance not established'};
}
const dir=process.argv[2];if(dir){const variants=buildComparison();const out=resolve(dir);mkdirSync(out,{recursive:true});for(const [id,r] of variants)writeFileSync(join(out,id+'.html'),r.html,{flag:'wx'});writeFileSync(join(out,'comparison.html'),comparisonHTML(variants),{flag:'wx'});writeFileSync(join(out,'report.json'),JSON.stringify(reportComparison(variants),null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(reportComparison(variants),null,2));}
