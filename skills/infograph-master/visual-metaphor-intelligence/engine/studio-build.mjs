import {readFileSync,writeFileSync} from "node:fs";
import {studioShell} from "../studio/shell.mjs";
const read=p=>readFileSync(new URL(p,import.meta.url),"utf8"),load=p=>JSON.parse(read(p));
const strip=s=>s.replace(/^import[^\n]*\n/gm,"").replace(/export function /g,"function ");
const files=["./exploration.mjs","./creative.mjs","./scene.mjs","../../engine/reference-scene.mjs","./pipeline.mjs","./handoff.mjs","./evaluation.mjs"];
const bundle=files.map(p=>strip(read(p))).join("\n");
const packet=load("../benchmark/studio-packet.json"),objects=load("../ontology/objects.json"),ontology=load("../ontology/mechanisms.json");
if(!process.argv[2])throw Error("usage: node engine/studio-build.mjs output.html");writeFileSync(process.argv[2],studioShell(bundle,packet,objects,ontology));
