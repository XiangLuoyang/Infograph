import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
const root=process.cwd(),base=resolve(root,'skills/infograph-master');
const load=async p=>JSON.parse(await readFile(resolve(base,p),'utf8'));
const context=await load('references/context-index.json'),knowledge=await load('references/knowledge-units.json');
const rows=[];
for(const [kind,entries] of [['context',Object.values(context.groups).flat()],['knowledge',knowledge.units]]){
 for(const e of entries){
  const path=e.path.startsWith('repo:')?resolve(root,e.path.slice(5)):resolve(base,e.path);
  if(relative(root,path).startsWith('..'))throw Error('outside repository');
  const b=await readFile(path),sha=createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
  const bytes=kind==='context'?b.length:Buffer.byteLength(e.content);
  const excerpt=kind==='knowledge'?b.toString('utf8').split(/\r?\n/).slice(e.startLine-1,e.endLine).join('\n'):null;
  rows.push({kind,path:e.path,id:e.id??null,shaMatch:sha===e.sha,bytesMatch:bytes===e.bytes,excerptMatch:kind==='context'||excerpt===e.content});
 }}
const issues=rows.filter(r=>!r.shaMatch||!r.bytesMatch||!r.excerptMatch);
console.log(JSON.stringify({version:1,rows,issues},null,2));
if(issues.length)process.exitCode=1;
