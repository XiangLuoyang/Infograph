import {readFileSync} from "node:fs";
import {motionProfiles,compileMotionCompleteness,sampleIllustrativeMotion,reviewMotionCompleteness} from "./motion-completeness.mjs";
const {spec,concept,choreography}=JSON.parse(readFileSync(new URL("./motion-completeness.example.json",import.meta.url),"utf8"));
function tests(spec,concept,choreography,profiles,compileMotionCompleteness,sampleIllustrativeMotion,reviewMotionCompleteness){
 const pass=[],ok=(v,s)=>{if(!v)throw Error(s);pass.push(s)},throws=(f,s)=>{let b=false;try{f()}catch{b=true}ok(b,s)},copy=x=>JSON.parse(JSON.stringify(x));
 const p=compileMotionCompleteness(spec,concept,choreography,profiles);
 ok(p.complete&&p.jobs.length===2&&!p.rendered,"complete inventory and bindings");
 let b=copy(spec);b.inventory[2].implementations=[];let q=compileMotionCompleteness(b,concept,choreography,profiles);ok(!q.planningReady&&q.issues.some(i=>i.kind==="missing-motion"),"detect omitted liquid motion");
 b=copy(spec);b.inventory.pop();q=compileMotionCompleteness(b,concept,choreography,profiles);ok(q.issues.some(i=>i.kind==="unclassified-layer"),"unclassified layer detected");
 b=copy(spec);b.inventory[2].expectations[0].behavior="rotation";throws(()=>compileMotionCompleteness(b,concept,choreography,profiles),"reject incompatible physical behavior");
 b=copy(spec);b.inventory[2].expectations[0].intent="ambient";throws(()=>compileMotionCompleteness(b,concept,choreography,profiles),"ambient cannot be mandatory");
 b=copy(spec);b.inventory[2].implementations[0].mapping="calibrated";throws(()=>compileMotionCompleteness(b,concept,choreography,profiles),"calibrated loop rejected");
 b=copy(spec);b.inventory[1].implementations[0].channel="missing";throws(()=>compileMotionCompleteness(b,concept,choreography,profiles),"missing P2 channel rejected");
 b=copy(spec);b.inventory[2].implementations[0].activeStates=["missing"];throws(()=>compileMotionCompleteness(b,concept,choreography,profiles),"unknown active state rejected");
 b=copy(spec);b.inventory[2].implementations[0].pausePolicy="continue";throws(()=>compileMotionCompleteness(b,concept,choreography,profiles),"pause policy enforced");
 b=copy(spec);b.conceptSha="b".repeat(64);throws(()=>compileMotionCompleteness(b,concept,choreography,profiles),"stale concept rejected");
 let frame=sampleIllustrativeMotion(p,{stateId:"normal",elapsedMs:500})[0];ok(frame.active&&Math.abs(frame.offset-.2)<1e-9,"qualitative oscillator sampled");
 ok(!sampleIllustrativeMotion(p,{stateId:"normal",elapsedMs:500,paused:true})[0].active,"pause static");
 ok(sampleIllustrativeMotion(p,{stateId:"normal",elapsedMs:500,reducedMotion:true})[0].offset===0,"reduced motion static");
 ok(!sampleIllustrativeMotion(p,{stateId:"restricted",elapsedMs:500})[0].active,"state-gated loop");
 const outputSha="c".repeat(64),r=reviewMotionCompleteness(p,{outputSha});ok(!r.complete,"missing rendered evidence blocks review");
 const records=r.checks.map(({key})=>({key,status:"pass",conceptSha:spec.conceptSha,motionRevision:spec.motionRevision,outputSha,ref:"synthetic record",reviewer:"synthetic tester"}));
 ok(reviewMotionCompleteness(p,{outputSha,records}).complete&&!reviewMotionCompleteness(p,{outputSha,records}).releaseAuthorized,"declared review not release authorization");
 records[0].motionRevision="old";ok(!reviewMotionCompleteness(p,{outputSha,records}).complete,"stale motion revision rejected");
 return pass;
}
for(const name of tests(spec,concept,choreography,motionProfiles,compileMotionCompleteness,sampleIllustrativeMotion,reviewMotionCompleteness))console.log('PASS',name);
