import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {posix} from 'node:path';
const tracked=new Set(execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean));
const base='skills/infograph-master/';
const docs=['SKILL.md','references/context-guide.md','references/modes.md','references/acceptance.md','references/engineering-assets.md','references/execution-gates.md','references/critique-protocol.md'];
const rows=[];
for(const doc of docs){
 const content=await readFile(base+doc,'utf8');
 const refs=[...new Set(content.match(/(?:repo:)?(?:references|engine|visual-intelligence|skills|benchmark)\/[\w./-]+\.(?:md|mjs|json|html|css|py)\b/g)||[])];
 for(const ref of refs){
 const path=posix.normalize(ref.startsWith('repo:')?ref.slice(5):base+ref);
 rows.push({document:base+doc,reference:ref,path,exists:tracked.has(path)});
 }}
const missing=rows.filter(r=>!r.exists);
console.log(JSON.stringify({version:1,documents:docs.length,references:rows.length,missing,rows,limitations:'Explicit qualified paths only; shorthand, indirect references and host-specific loading require separate review.'},null,2));
if(missing.length)process.exitCode=1;
