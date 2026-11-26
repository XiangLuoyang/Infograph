import {readFileSync,writeFileSync} from "node:fs";
import {compileScene,renderSceneHTML} from "./scene.mjs";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const {target,concept,review}=load("../benchmark/creative-fixture.json"),{styles,scene}=load("../benchmark/scene-fixture.json"),objects=load("../ontology/objects.json"),ontology=load("../ontology/mechanisms.json");
const plans=styles.map(style=>compileScene({target,concept,review,objects,ontology,style,scene}));
const output=process.argv[2];if(!output)throw Error("usage: node engine/scene-demo.mjs output.html");writeFileSync(output,renderSceneHTML(plans));
