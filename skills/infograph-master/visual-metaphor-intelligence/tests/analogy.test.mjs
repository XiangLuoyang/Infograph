import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {rankCandidates,critiqueMapping} from "../engine/analogy.mjs";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const objects=load("../ontology/objects.json"),ontology=load("../ontology/mechanisms.json"),graph=load("../benchmark/feedback-task.json");
function assertions(check,rankCandidates,critiqueMapping,objects,ontology,graph){
 const r=rankCandidates(graph,objects,ontology);
 check(r.results[0].id==="thermostat","structural retrieval");
 check(r.results[0].coverage===1,"complete coverage");
 check(Object.keys(r.results[0].nodeMapping).length===4,"injective node mapping");
 check(r.results[0].missingEssential.length===0,"essential relations");
 check(r.results[0].source.url.startsWith("https:"),"provenance");
 const reversed=JSON.parse(JSON.stringify(graph));reversed.edges[0].from="state";reversed.edges[0].to="measure";check(rankCandidates(reversed,objects,ontology).results[0].coverage<1,"direction matters");
 const no=JSON.parse(JSON.stringify(graph));no.edges=[{id:"x",from:"state",predicate:"limit",to:"control"}];check(rankCandidates(no,objects,ontology).status==="open-discovery-required","no match fallback");
 check(rankCandidates(graph,objects,ontology,{budget:1}).searchTruncated,"bounded search");
 const review={evidenceRef:"synthetic",boundary:"qualitative only",plainAlternative:"feedback diagram",styleRef:"test design contract",unsupportedCausality:false,falseQuantification:false,sourceMechanismVerified:true,evidenceKind:"conceptual"};
 check(critiqueMapping(graph,r.results[0],review).eligibleForConcept,"declared concept gate");
 check(!critiqueMapping(graph,r.results[0],{...review,falseQuantification:true}).eligibleForConcept,"false quantitative encoding blocked");
 check(!critiqueMapping(graph,r.results[0],{...review,unsupportedCausality:true}).eligibleForConcept,"unsupported causality blocked");
 check(!critiqueMapping(graph,{...r.results[0],missingEssential:["t1"]},review).eligibleForConcept,"missing core relation blocked");
 let rejected=false;try{rankCandidates(graph,[...objects,objects[0]],ontology)}catch{rejected=true}check(rejected,"duplicate IDs rejected");
}
assertions((ok,msg)=>assert.ok(ok,msg),rankCandidates,critiqueMapping,objects,ontology,graph);
console.log("13 VMI seed assertions passed");
