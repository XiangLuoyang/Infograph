import {readFileSync} from "node:fs";
import {compileDirector,initialDirector,reduceDirector,directorView,staticDirectorOutline} from "./narrative-director.mjs";
const {story,scene}=JSON.parse(readFileSync(new URL("./narrative-director.example.json",import.meta.url),"utf8"));
function tests(story,scene,compileDirector,initialDirector,reduceDirector,directorView,staticDirectorOutline){
 const pass=[];const ok=(b,s)=>{if(!b)throw Error(s);pass.push(s);};const throws=(f,s)=>{let yes=false;try{f()}catch{yes=true}ok(yes,s);};const clone=x=>JSON.parse(JSON.stringify(x));const p=compileDirector(story,scene);let s=initialDirector(p,"filters-v1");
 ok(p.acts.length===2&&staticDirectorOutline(p).acts[1].evidence.length===2,"compile and static evidence outline");
 let bad=clone(story);bad.acts[0].evidence_ids=["unknown"];throws(()=>compileDirector(bad,scene),"reject dangling evidence");
 bad=clone(scene);bad.cues[0].visible=["input"];throws(()=>compileDirector(story,bad),"reject invisible focus");
 bad=clone(story);bad.acts[0].after=bad.acts[0].before;throws(()=>compileDirector(bad,scene),"reject no cognitive change");
 bad=clone(scene);delete bad.cues[1].stateMeaning;throws(()=>compileDirector(story,bad),"state-change needs meaning");
 s=reduceDirector(p,s,{type:"play"});const epoch=s.epoch;ok(directorView(p,s).nextTimer.epoch===epoch,"play timer token");
 s=reduceDirector(p,s,{type:"inspect",objectId:"expense"});ok(!s.playing&&s.inspection==="expense"&&directorView(p,s).visible.length===4&&directorView(p,s).narrativeFocus[0]==="net","inspection separate from narrative");
 ok(reduceDirector(p,s,{type:"tick",epoch})===s,"stale tick ignored");
 s=reduceDirector(p,s,{type:"next"});ok(s.index===1&&!s.inspection&&!s.playing,"manual advance clears inspection");
 s=reduceDirector(p,s,{type:"mode",mode:"explorer"});s=reduceDirector(p,s,{type:"context",revision:"filters-v2"});s=reduceDirector(p,s,{type:"mode",mode:"director"});ok(s.index===1&&s.contextRevision==="filters-v2"&&!s.playing,"mode roundtrip preserves act and shared context token");
 s=reduceDirector(p,s,{type:"reset"});ok(s.index===0&&s.contextRevision==="filters-v2","reset preserves external context");
 s=reduceDirector(p,s,{type:"motion",reduced:true});s=reduceDirector(p,s,{type:"play"});ok(!s.playing&&directorView(p,s).transition==="cut","reduced motion manual only");
 s=reduceDirector(p,s,{type:"motion",reduced:false});s=reduceDirector(p,s,{type:"play"});s=reduceDirector(p,s,{type:"tick",epoch:s.epoch});ok(s.index===1&&!s.playing&&!directorView(p,s).nextTimer,"stop on final act");
 throws(()=>reduceDirector(p,s,{type:"inspect",objectId:"unknown"}),"reject hidden/unknown inspection");
 ok(directorView(p,s).claimStatus==="scenario"&&directorView(p,s).evidence[1].limitation.includes("behavioral"),"scenario status and caveats preserved");
 return pass;
}
for(const name of tests(story,scene,compileDirector,initialDirector,reduceDirector,directorView,staticDirectorOutline))console.log('PASS',name);
