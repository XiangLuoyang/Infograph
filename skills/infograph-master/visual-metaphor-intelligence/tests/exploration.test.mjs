import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {relationPolicy,inspectPair,alignPerspective,explorePerspectives} from "../engine/exploration.mjs";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const ontology=load("../ontology/mechanisms.json"),objects=load("../ontology/objects.json"),fixtures=load("../benchmark/perspectives.json");
function run(check,relationPolicy,inspectPair,alignPerspective,explorePerspectives,ontology,objects,fixtures){
 const p=relationPolicy(ontology);
 check(p.match("inhibit","limit").kind==="generalized","directional subtype");check(p.match("limit","inhibit")===null,"no reverse");check(p.match("detect","sense").kind==="alias","alias");check(p.match("damp","inhibit")===null,"no sibling entailment");
 check(inspectPair({predicate:"regulate",polarity:"positive"},{predicate:"damp",polarity:"negative"},p)===null,"sign contradiction");check(inspectPair({predicate:"limit",condition:"a"},{predicate:"inhibit",condition:"b"},p)===null,"condition contradiction");check(inspectPair({predicate:"limit",condition:"a"},{predicate:"inhibit"},p).unknown.includes("condition"),"unknown qualifier");
 const a=alignPerspective(fixtures.competition,objects,ontology);check(a.results[0].id==="competitive-enzyme","enzyme retrieval");check(a.results[0].coverage===1,"full structure");check(a.results[0].reviewRequired.length===1,"generalized edge review");check(alignPerspective(fixtures.buffer,objects,ontology).results[0].id==="reaction-wheel","reaction wheel retrieval");check(alignPerspective(fixtures.fallback,objects,ontology).results[0].id==="failover","failover retrieval");
 const bad=JSON.parse(JSON.stringify(fixtures.fallback));bad.edges[1].condition="scheduled-maintenance";check(alignPerspective(bad,objects,ontology).results.find(x=>x.id==="failover").missingEssential.length>0,"wrong switch condition");
 const roles=JSON.parse(JSON.stringify(fixtures.competition));roles.nodes[0].role="actuator";check(alignPerspective(roles,objects,ontology).results.find(x=>x.id==="competitive-enzyme").coverage<1,"role mismatch");
 const v=explorePerspectives([fixtures.competition,fixtures.buffer,fixtures.fallback],objects,ontology);check(v.views.length===3&&v.candidateDomains.length>=3,"batch of separate views");check(v.openDiscoveryRequired,"open discovery flag");check(alignPerspective(fixtures.competition,objects,ontology,{budget:1}).searchTruncated,"search cap");check(alignPerspective(fixtures.broad,objects,ontology,{shortlist:1}).unsearched.length>0,"actual shortlist truncation");
 let reject=false;try{explorePerspectives([fixtures.buffer,fixtures.buffer],objects,ontology)}catch{reject=true}check(reject,"duplicate views");
}
run((ok,msg)=>assert.ok(ok,msg),relationPolicy,inspectPair,alignPerspective,explorePerspectives,ontology,objects,fixtures);
console.log("19 VMI exploration assertions passed");
