import {mineOpportunities,auditExploration} from './design-opportunity.mjs';
function test(mine,audit){
 let n=0;const ok=(x,m)=>{if(!x)throw Error(m);n++};
 const p={assets:[{id:"a",status:"observed",ref:"source:#a"},{id:"b",status:"observed",ref:"source:#b"}],intents:[{id:"i",status:"inferred"}],findings:[{id:"f",status:"defect",level:3,intentIds:["i"],ref:"source:render",taskImpact:"hard to compare"}],relationships:[{id:"r",type:"flow_constraint",status:"hypothesis",statement:"possible bottleneck",ref:"source:comparison",limit:"confirm allocation and periods",assetIds:["a","b"],intentId:"i",findingIds:["f"]}]};
 const result=mine(p);ok(result.errors.length===0,"valid");ok(result.opportunities[0].status==="candidate-needs-validation","hypothesis");ok(result.opportunities[0].routes.includes("references/dynamic-visual-metaphor.md"),"route");
 const noDefect=mine({...p,findings:[{...p.findings[0],status:"adequate"}]});ok(noDefect.opportunities[0].status==="retain-or-test","negative control");
 ok(mine({...p,relationships:[{...p.relationships[0],assetIds:["a","missing"]}]}).errors.length===1,"missing evidence");
 ok(mine({...p,relationships:[{...p.relationships[0],status:"unknown"}]}).opportunities[0].status==="investigate","unknown");
 ok(mine({...p,intents:[{id:"i",status:"explicit"}],relationships:[{...p.relationships[0],status:"observed"}]}).opportunities[0].status==="candidate","observed candidate");
 const options=["refine","restructure","reinvent"].map((mode,i)=>({id:mode,mode,architecture:["existing cards","aligned comparison","mechanism sequence"][i],representation:["existing charts","common scale","flow scene and chart"][i],interaction:["same","linked detail","state toggle"][i],readerPath:["lookup","compare","mechanism then evidence"][i],benefit:"reader task",tradeoff:"implementation effort",evidencePlan:"same data",preservationPlan:"stable IDs",readerTest:"retell with evidence",opportunityIds:i?["r"]:[],routes:["representation"]}));
 const plan={options,selected:"reinvent",reason:"show mechanism conditionally"};
 ok(audit(plan,result.opportunities).eligible,"valid exploration");ok(!audit({...plan,selected:"refine"},result.opportunities).eligible,"cosmetic default");ok(audit({...plan,selected:"refine",highLevelDisposition:"scope restricted"},result.opportunities).eligible,"bounded refine");
 ok(!audit({...plan,options:options.map((o,i)=>i===2?{...o,architecture:options[1].architecture,representation:options[1].representation,interaction:options[1].interaction,readerPath:options[1].readerPath}:o)},result.opportunities).eligible,"cosmetic alternatives");
 ok(!audit({...plan,options:options.map((o,i)=>i===2?{...o,opportunityIds:["fake"]}:o)},result.opportunities).eligible,"fake trace");
 const no=options.map(o=>({...o,opportunityIds:[]}));ok(!audit({...plan,options:no},noDefect.opportunities).eligible,"unjustified overhaul");
 ok(audit({...plan,options:no,selected:"refine"},noDefect.opportunities).eligible,"good baseline retained");return n;
}
console.log('design opportunity assertions:',test(mineOpportunities,auditExploration));
