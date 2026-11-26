import {readFileSync} from "node:fs";
import {compileConceptArt,reviewConceptArt} from "./concept-art-pipeline.mjs";
import {compileReference} from "./reference-scene.mjs";
const base=JSON.parse(readFileSync(new URL("./concept-art-pipeline.example.json",import.meta.url),"utf8"));
function tests(base,compileConceptArt,reviewConceptArt){
 const pass=[],ok=(v,s)=>{if(!v)throw Error(s);pass.push(s)},throws=(f,s)=>{let b=false;try{f()}catch{b=true}ok(b,s)},copy=x=>JSON.parse(JSON.stringify(x));
 const p=compileConceptArt(base);ok(p.referenceManifest.objects[1].fidelity==="raster"&&p.referenceManifest.objects[1].dynamic&&p.assetsDeclaredReady&&!p.rendered,"independent moving raster handoff, not rendered");
 let b=copy(base);b.directions.pop();throws(()=>compileConceptArt(b),"alternative directions required");
 b=copy(base);b.layers[1].bakedOriginal=true;throws(()=>compileConceptArt(b),"baked duplicate blocked");
 b=copy(base);delete b.layers[1].maskId;throws(()=>compileConceptArt(b),"missing mask blocked");
 b=copy(base);b.assets[0].parentSha="c".repeat(64);throws(()=>compileConceptArt(b),"stale asset revision rejected");
 b=copy(base);b.layers[2].backend="raster";throws(()=>compileConceptArt(b),"live labels protected");
 b=copy(base);b.semanticObjects.push({id:"missing",meaning:"unmapped"});throws(()=>compileConceptArt(b),"semantic coverage required");
 b=copy(base);b.scenes[0].visible.pop();throws(()=>compileConceptArt(b),"static evidence layer required");
 b=copy(base);b.assets[0].status="planned";ok(!compileConceptArt(b).assetsDeclaredReady,"pending assets do not count ready");
 b=copy(base);b.layers[1].backend="custom-hybrid";throws(()=>compileConceptArt(b),"essential custom backend needs fallback");
 b.assets.push({...b.assets[0],id:"fallback",kind:"static-fallback"});b.layers[1].fallbackAssetId="fallback";ok(compileConceptArt(b).referenceManifest===null,"custom hybrid must not pretend reference adapter support");
 const outputSha="d".repeat(64);
 const empty=reviewConceptArt(p,{outputSha});ok(!empty.complete,"review cannot be inferred");
 const records=empty.checks.map(({key})=>({key,status:"pass",conceptSha:p.source.sha256,outputSha,ref:"synthetic declared evidence",reviewer:"synthetic tester"}));
 ok(reviewConceptArt(p,{outputSha,records}).complete&&!reviewConceptArt(p,{outputSha,records}).releaseAuthorized,"declared review never authorizes release");
 records[0].outputSha="e".repeat(64);ok(!reviewConceptArt(p,{outputSha,records}).complete,"stale render review rejected");
 return pass;
}
for(const name of tests(base,compileConceptArt,reviewConceptArt))console.log('PASS',name);
const p=compileConceptArt(base);const routed=compileReference(p.referenceManifest,{raster:true});if(!routed.planningReady||routed.slots.find(s=>s.id==='wheel').renderer!=='raster')throw Error('reference handoff failed');console.log('PASS reference compiler integration');
