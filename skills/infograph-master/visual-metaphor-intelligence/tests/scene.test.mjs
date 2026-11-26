import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as api from "../engine/scene.mjs";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const {target,concept,review}=load("../benchmark/creative-fixture.json"),{styles,scene}=load("../benchmark/scene-fixture.json"),objects=load("../ontology/objects.json"),ontology=load("../ontology/mechanisms.json"),input={target,concept,review,objects,ontology,scene};
function test(check,api,input,styles){
 const clone=x=>JSON.parse(JSON.stringify(x)),compile=(s=styles[0],sc=input.scene,rest={})=>api.compileScene({...input,style:s,scene:sc,...rest}),reject=(fn,msg)=>{let bad=false;try{fn()}catch{bad=true}check(bad,msg)};
 const a=compile(),b=compile(styles[1]);check(JSON.stringify(a.semantic)===JSON.stringify(b.semantic),"semantic invariance");check(a.design.colors.background!==b.design.colors.background,"different palette");
 const h=api.renderSceneHTML([a,b]);check(h.includes('data-style-choice="编辑风"')&&h.includes('data-style-choice="工业风"'),"both styles");check(h.includes('prefers-reduced-motion')&&h.includes('<noscript>'),"reduced motion and no JS");check(h.includes('静态状态对照')&&h.includes('NOT TO SCALE'),"static qualitative evidence");
 check((h.match(/data-object="b"/g)||[]).length===2,"stable identity both widths");check(h.includes('data-edge="t2"'),"relation binding");check(!h.includes("http://")&&!h.includes("https://"),"offline demo");
 let s=clone(styles[0]);s.colors.muted=s.colors.surface;reject(()=>compile(s),"contrast rejection");
 s=clone(styles[0]);s.baselineRef="other";reject(()=>compile(s),"style provenance");
 s=clone(styles[0]);s.colors.accent="red;display:none";reject(()=>compile(s),"unsafe token");
 let sc=clone(input.scene);sc.objects.pop();reject(()=>compile(styles[0],sc),"missing object");
 sc=clone(input.scene);sc.objects[0].mobile=[500,0,30,30];reject(()=>compile(styles[0],sc),"out of bounds");
 sc=clone(input.scene);sc.layers[0].renderer="webgl";reject(()=>compile(styles[0],sc),"unsupported renderer not degraded");
 sc=clone(input.scene);sc.objects[0].shapes[0]={type:"path",d:'M0 0" onload="alert(1)',fill:"surface",stroke:"line",sw:1};reject(()=>compile(styles[0],sc),"invalid primitive");
 sc=clone(input.scene);sc.states[1].highlight.push("b");reject(()=>compile(styles[0],sc),"invalid state change");
 reject(()=>compile(styles[0],input.scene,{review:{...input.review,revision:0}}),"stale P3 review");
 const drift=clone(b);drift.semantic.objects[0].targetNode="different";reject(()=>api.renderSceneHTML([a,drift]),"semantic drift");
 sc=clone(input.scene);sc.title='<script>alert(1)</script>';check(api.renderSceneHTML([compile(styles[0],sc)]).includes("&lt;script&gt;"),"escaped labels");
 check(a.releaseAuthorized===false,"no release claim");
}
test((ok,msg)=>assert.ok(ok,msg),api,input,styles);
console.log("20 VMI scene assertions passed");
