import {auditQualityDepth} from "./quality-depth.mjs";
function runQualityDepthTests(audit) {
  const assert=(v,label)=>{if(!v)throw Error(label);return label;};
  const input={revision:2,purpose:"decision",substantial:true,multiRoute:true,mixedModes:true,semanticInteraction:true,richScene:true,areas:["QD01","QD02","QD03","QD04","QD05","QD06"].map(id=>({id,applicable:true,design:{revision:2,status:"pass",ref:"synthetic:"+id+":design"},review:{revision:2,status:"pass",ref:"synthetic:"+id+":render"}}))};
  const clone=()=>JSON.parse(JSON.stringify(input));
  let a, results=[];
  results.push(assert(audit(input).depthComplete&&!audit(input).releaseAuthorized,"complete declarations never authorize release"));
  a=clone();a.areas[0].review.status="not-run";results.push(assert(audit(a).buildEligible&&!audit(a).depthComplete,"coverage does not imply depth"));
  a=clone();a.areas[3]={id:"QD04",applicable:false,reason:"skip"};results.push(assert(!audit(a).buildEligible,"required motion cannot be waived"));
  a=clone();a.areas[4].review.revision=1;results.push(assert(!audit(a).depthComplete,"stale review blocks completion"));
  a=clone();a.areas[2].design.ref="";results.push(assert(!audit(a).buildEligible,"design evidence reference required"));
  a=clone();a.areas.pop();results.push(assert(!audit(a).buildEligible,"missing area blocks completion"));
  a=clone();a.purpose="monitor";a.multiRoute=false;a.mixedModes=false;a.semanticInteraction=false;a.richScene=false;a.areas=a.areas.map(x=>x.id==="QD06"?x:{id:x.id,applicable:false,reason:"synthetic single-view monitoring"});results.push(assert(audit(a).depthComplete,"task-led nonapplicability permitted"));
  a.areas[0].reason="";results.push(assert(!audit(a).buildEligible,"nonapplicability needs rationale"));
  a=clone();a.areas.push(a.areas[0]);let rejected=false;try{audit(a)}catch{rejected=true}results.push(assert(rejected,"duplicate area rejected"));
  return results;
}
for(const result of runQualityDepthTests(auditQualityDepth)) console.log('PASS',result);
