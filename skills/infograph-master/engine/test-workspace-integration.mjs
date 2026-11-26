import {readFileSync} from "node:fs";
import {compileWorkspace,initialWorkspace,dispatchWorkspace,workspaceFrame,auditWorkspace} from "./workspace-integration.mjs";
const fixture=JSON.parse(readFileSync(new URL("./workspace-integration.example.json",import.meta.url),"utf8"));
function tests(fixture,compileWorkspace,initialWorkspace,dispatchWorkspace,workspaceFrame,auditWorkspace){
 const ok=(v,m)=>{if(!v)throw Error(m);return m},copy=x=>JSON.parse(JSON.stringify(x)),out=[],throws=(f,m)=>{let yes=false;try{f()}catch{yes=true}out.push(ok(yes,m))};
 const p=compileWorkspace(fixture);out.push(ok(p.planningReady&&!p.rendered,"P1–P5 actual compiler chain"));
 let s=initialWorkspace(p,{width:1440,height:900});out.push(ok(workspaceFrame(p,s,0).layout.mode==="fixed","initial layout and act"));
 s=dispatchWorkspace(p,s,{type:"next"},100);let f=workspaceFrame(p,s,300);out.push(ok(f.motion.moving&&f.motion.visualValues["valve.angle"]===45&&f.narrative.actId==="A2","P1 action drives P2 frame"));
 s=dispatchWorkspace(p,s,{type:"inspect",objectId:"valve"},300);f=workspaceFrame(p,s,300);out.push(ok(!f.motion.moving&&f.narrative.inspection==="valve","inspection settles visual endpoint"));
 s=dispatchWorkspace(p,s,{type:"mode",mode:"explorer"},400);out.push(ok(workspaceFrame(p,s,400).route.sliceId==="table","explorer route"));
 s=dispatchWorkspace(p,s,{type:"viewport",width:390,height:844},500);out.push(ok(workspaceFrame(p,s,500).layout.mode==="flow","P5 mobile route recomposes"));
 s=dispatchWorkspace(p,s,{type:"mode",mode:"director"},600);out.push(ok(workspaceFrame(p,s,600).narrative.actId==="A2"&&workspaceFrame(p,s,600).contextRevision===fixture.contextRevision,"mode return preserves act and pinned context"));
 throws(()=>dispatchWorkspace(p,s,{type:"context",revision:"new-data"},700),"stale business claims blocked on context change");
 throws(()=>dispatchWorkspace(p,s,{type:"next"},10),"nonmonotonic event rejected");
 let b=copy(fixture);b.story.acts[0].claim="different";throws(()=>compileWorkspace(b),"P1/P2 claim mismatch rejected");
 b=copy(fixture);b.concept.layers.find(x=>x.id==="wheel").semanticIds=["stream"];throws(()=>compileWorkspace(b),"cross-layer semantic mismatch rejected");
 b=copy(fixture);b.actBindings.A2="missing";throws(()=>compileWorkspace(b),"unknown act state rejected");
 b=copy(fixture);b.routes.explorer.sliceId="missing";throws(()=>compileWorkspace(b),"unknown route rejected");
 const quality={revision:1,purpose:"explain",substantial:true,multiRoute:true,mixedModes:true,semanticInteraction:true,richScene:true,areas:[]};
 const review=auditWorkspace(p,{revision:p.revision,outputSha:"b".repeat(64),quality});out.push(ok(!review.complete&&!review.releaseAuthorized,"missing actual evidence cannot pass"));
 return out;
}
for(const x of tests(fixture,compileWorkspace,initialWorkspace,dispatchWorkspace,workspaceFrame,auditWorkspace))console.log('PASS',x);
