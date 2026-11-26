import {buildArtifactIR,diffArtifactIR,buildIntentGraph} from './artifact-semantic-ir.mjs';
function tests(build,diff,graph){
 let n=0;const ok=(v,msg)=>{if(!v)throw Error(msg);n++};
 const mk=(records,truncated=false)=>build({sourceRef:"fixture",records,truncated});
 const rec=(key,value,locator=key,kind="table")=>({kind,locator,key,label:key||"unkeyed",value,truncated:false});
 const a=mk([rec("sales",{rows:[10,20]}),rec("filter",{options:["A","B"]},"filter","control"),rec(null,{text:"x"},"p")]);
 const b=mk([rec("sales",{rows:[10,21]}),rec("filter",{options:["A","B"]},"newfilter","control")]);
 const d=diff(a,b);ok(d.changes.some(x=>x.key==="sales"&&x.status==="observed-changed"),"data change");ok(d.changes.some(x=>x.key==="filter"&&x.status==="observed-equal"),"stable key");ok(d.changes.some(x=>x.status==="unkeyed-review"),"unkeyed");ok(d.semanticParity==="not-run","no semantic claim");
 ok(diff(a,mk([],true)).changes.some(x=>x.status==="unknown-after-truncation"),"truncation");ok(diff(a,mk([])).changes.some(x=>x.status==="not-observed-after"),"missing");ok(diff(a,mk([rec("sales",{},"one"),rec("sales",{},"two")])).changes.some(x=>x.status==="ambiguous-key"),"duplicate");
 const g={intents:[{id:"i",status:"inferred",statement:"compare sales",ref:"fixture",alternative:"monitor",validation:"ask reader"}],links:[{intentId:"i",observationId:a.nodes[0].id,relation:"supports",note:"table has values"}]};
 ok(graph(a,g).valid,"valid graph");ok(!graph(a,{...g,links:[]}).valid,"unsupported inference");ok(!graph(a,{...g,links:[{...g.links[0],observationId:"fake"}]}).valid,"invalid edge");
 const renamed=mk([{...rec("revenue",{rows:[10,20]}),label:"sales"}]);ok(diff(a,renamed,[{from:"sales",to:"revenue",ref:"author mapping"}]).changes.some(x=>x.key==="sales"&&x.status==="observed-equal"),"explicit alias");
 ok(diff(a,renamed,[{from:"sales",to:"nope",ref:"x"}]).errors.length===1,"invalid alias");
 const v=mk([rec("k",{b:2,a:1})]),w=mk([rec("k",{a:1,b:2})]);ok(diff(v,w).changes[0].status==="observed-equal","key ordering");
 return n;
}
console.log('artifact IR assertions:',tests(buildArtifactIR,diffArtifactIR,buildIntentGraph));
