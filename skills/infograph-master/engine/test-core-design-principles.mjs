import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {planContext} from './context-plan.mjs';
import {retrieveKnowledge} from './knowledge-retrieval.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const index=JSON.parse(read('references/context-index.json')),knowledge=JSON.parse(read('references/knowledge-units.json')),required=['references/acceptance.md','references/design-principles.md'];
const p=planContext(index,{groups:['standard'],budget:0}),r=retrieveKnowledge(knowledge,{budget:0});
for(const path of required){
 const a=p.selected.find(x=>x.path===path),b=r.selected.find(x=>x.path===path),bytes=read(path),sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 assert.ok(a?.mandatory&&b?.required);assert.equal(a.sha,sha);assert.equal(b.sha,sha);assert.equal(a.bytes,bytes.length);assert.equal(b.bytes,Buffer.byteLength(b.content));assert.equal(b.content,bytes.toString('utf8').split(/\r?\n/).slice(b.startLine-1,b.endLine).join('\n'));
}
assert.equal(p.optionalBytes,0);assert.equal(r.optionalBytes,0);
assert.match(read('SKILL.md').toString(),/Always load references\/acceptance.md and references\/design-principles.md/);
console.log('Core principles mandatory loading and provenance checks passed');
