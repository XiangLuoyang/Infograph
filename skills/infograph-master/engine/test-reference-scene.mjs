import {readFileSync} from 'node:fs';
import {compileReference,resolveAnchor,planLinks,fidelityReview} from './reference-scene.mjs';
const fixture=JSON.parse(readFileSync(new URL('./reference-scene.example.json',import.meta.url),'utf8'));
function runTests(fixture){
 let checks=0;const eq=(a,b)=>{if(a!==b)throw Error(`expected ${b}, got ${a}`);checks++};const throws=(fn)=>{let t=false;try{fn()}catch{t=true}eq(t,true)};const cp=()=>JSON.parse(JSON.stringify(fixture));
 const p=compileReference(fixture,{raster:true,webgl:true});eq(p.planningReady,true);eq(p.rendered,false);eq(p.releaseReady,false);eq(p.slots.find(x=>x.id==="hub").renderer,"webgl");eq(p.slots.find(x=>x.id==="label").renderer,"html");eq(p.slots.find(x=>x.id==="background").renderer,"raster");
 const fallback=compileReference(fixture);eq(fallback.planningReady,false);eq(fallback.slots.find(x=>x.id==="hub").degraded,true);
 const moved=planLinks(p,{hub:{dx:.1,dy:0}});eq(Math.round(moved[0].to[0]*100),45);eq(Math.round(moved[1].to[0]*100),75);
 const r=resolveAnchor(fixture.objects[1],"left",{rotation:90});eq(Math.round(r[0]*100),50);eq(Math.round(r[1]*100),35);
 eq(fidelityReview(p).reviewComplete,false);eq(fidelityReview(p).unrun>0,true);
 throws(()=>fidelityReview(p,[{objectId:"hub",dimension:"geometry",status:"not-applicable",ref:"test",reviewer:"test",note:"bad"}]));
 let f=cp();f.source.kind="image";throws(()=>compileReference(f));f=cp();f.objects[1].bounds=[.9,.9,.2,.2];throws(()=>compileReference(f));f=cp();f.links[0].to.port="missing";throws(()=>compileReference(f));f=cp();f.scenes[0].visible.push("cableA");throws(()=>compileReference(f));f=cp();f.staticScene="initial";throws(()=>compileReference(f));f=cp();f.objects[4].fidelity="photoreal";throws(()=>compileReference(f));f=cp();f.objects.push(f.objects[0]);throws(()=>compileReference(f));eq(compileReference(fixture,{html:false}).slots.find(x=>x.id==="label").renderer,null);
 return checks;
}
console.log('Reference scene checks:',runTests(fixture));
