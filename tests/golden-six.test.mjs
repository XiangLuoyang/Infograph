import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {runInNewContext} from "node:vm";

const root=resolve(import.meta.dirname,"..");
const source=readFileSync(resolve(root,"examples/golden-six/infograph-gold.js"),"utf8");
const sandbox={};
runInNewContext(source,sandbox,{filename:"infograph-gold.js",timeout:4000});
const api=sandbox.InfographGold;

assert.ok(api,"renderer exported via globalThis");
assert.equal(api.info.length,6,"six registered visual types");
assert.equal(new Set(api.info.map(x=>x.id)).size,6,"type ids unique");
const summary=api.verify();
assert.equal(summary.checked,14,"the expected 14 semantic checks are present");
assert.equal(summary.pass,true,"semantic checks pass");
for(const test of summary.tests){assert.equal(test.pass,true,test.name)}

for(const entry of api.info){
  const html=api.render(entry.id);
  assert.ok(html.startsWith("<svg"),entry.id+" returned SVG");
  assert.ok(html.includes('viewBox="0 0 980 550"'),entry.id+" has common viewBox");
  assert.ok(html.includes("</svg>"),entry.id+" has closing root");
  assert.ok(html.includes('data-key='),entry.id+" has selectable parts");
  assert.equal(/(?:NaN|undefined|Infinity)/.test(html),false,entry.id+" has invalid computed values");
  assert.equal(html.includes("<script"),false,entry.id+" injects script");
}
const explodeClosed=api.render("exploded",{progress:0});
const explodeOpen=api.render("exploded",{progress:1});
assert.notEqual(explodeClosed,explodeOpen,"explosion changes positions");
const hr=api.render("hr");
assert.match(hr,/decreases/, "H-R displays reversed temperature semantics");
assert.match(hr,/Luminosity/, "H-R displays luminosity units");
const strata=api.render("stratigraphy");
assert.match(strata,/14 m/, "stratigraphy preserves total depth in synthetic fixture");
const attack=api.render("attack");
for(const id of ["T1595","T1566","T1059","T1547","T1486"])assert.ok(attack.includes(id),"ATT&CK missing "+id);
const schematic=api.render("circuit");
for(const name of ["V1","R1","C1","N1","N2","N3"])assert.ok(schematic.includes(name),"schematic missing "+name);
const rail=api.render("rail");
assert.match(rail,/09:00/);assert.match(rail,/10:30/);
const index=readFileSync(resolve(root,"examples/golden-six/index.html"),"utf8");
assert.ok(index.includes('<script src="./infograph-gold.js"></script>'),"offline gallery loads local script");
assert.ok(index.includes('id="export"'),"gallery has SVG export action");
const registry=JSON.parse(readFileSync(resolve(root,"catalog/verified/golden-six.json"),"utf8"));
assert.equal(registry.entries.length,6,"registry six records");
assert.equal(JSON.stringify(registry.entries.map(x=>x.id).sort()),JSON.stringify(api.info.map(x=>x.id).sort()),"type ids match across VM realms");
assert.ok(registry.entries.every(x=>x.definition_sources.length>0),"each record has sources");
assert.ok(registry.entries.every(x=>x.implementation_claim!=="production_standard"),"no false compliance");
console.log("PASS: "+summary.checked+" semantic checks; 6 SVG renderers; gallery+registry integrity.");
