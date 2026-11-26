import {sampleDNA,compareDNA} from './design-dna.mjs';
function test(sample,compare){
 let n=0;const ok=(x,m)=>{if(!x)throw Error(m);n++};const report=(width,value,sourceRef="sha256:fixture",status="observed")=>({version:1,sourceRef,viewport:{width,height:900},states:[{id:"baseline",status,probes:["a","b"].map(id=>({id,kind:"style",status:"observed",partial:false,ref:sourceRef+"#"+width+"/"+id,value:{computed:{color:id==="b"?value:"rgb(20, 30, 40)"}}}))}]});
 const bindings=[1440,390].flatMap(width=>["a","b"].map(id=>({sliceId:id,roleId:"text",viewport:width+"x900",state:"baseline",probeId:id,property:"color"})));
 const base=sample([report(1440,"rgb(20, 30, 40)"),report(390,"rgb(20, 30, 40)")],bindings);
 ok(base.candidates[0].status==="uniform-observed"&&base.candidates[0].observed===4,"uniform");
 const drift=sample([report(1440,"rgb(20, 30, 40)"),report(390,"rgb(255, 255, 255)")],bindings);
 ok(drift.candidates[0].status==="variant-review"&&drift.candidates[0].candidate===null,"no forced uniform");
 const contract={roles:[{id:"text",target:"rgb(20, 30, 40)",computedProperty:"color",requiredStates:[{viewport:"1440x900",state:"baseline"},{viewport:"390x900",state:"baseline"}]}],exceptions:[]};
 const decisions=["a","b"].map(sliceId=>({sliceId,roleIds:["text"]}));
 ok(compare(base,contract,decisions).status==="observed-match","match");
 ok(compare(drift,contract,decisions).checks.find(x=>x.sliceId==="b").status==="mismatch","mobile drift");
 ok(compare(sample([report(1440,"rgb(20, 30, 40)")],bindings),contract,decisions).status==="incomplete","missing mobile");
 ok(compare(sample([report(1440,"rgb(20, 30, 40)"),report(390,"rgb(20, 30, 40)","sha256:fixture","limited")],bindings),contract,decisions).status==="incomplete","limited runtime");
 const ex={...contract,exceptions:[{sliceId:"b",roleId:"text",value:"rgb(255, 255, 255)"}]};
 ok(compare(drift,ex,decisions).status==="mismatch","global exception does not silently excuse mixed states");
 ok(compare(base,{roles:[{id:"text",target:"text convention"}]},decisions).status==="incomplete","manual role");
 let rejected=false;try{sample([report(1440,"x"),report(390,"x","sha256:other")],bindings)}catch{rejected=true}ok(rejected,"mixed versions");
 ok(compare(base,contract,decisions).styleObservations.length===2,"ledger bridge");
 return n;
}
console.log('design DNA assertions:',test(sampleDNA,compareDNA));
