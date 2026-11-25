import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
export function auditArm(out){
 const m=JSON.parse(readFileSync(resolve(out,'PRIVATE-manifest.json'),'utf8')),root=resolve(out,'payload'),paths=new Set(m.files.map(f=>f.path)),issues=[],refs=[];
 for(const f of m.files.filter(f=>f.path.endsWith('.md')&&f.path.startsWith('skills/'))){
 const content=readFileSync(resolve(root,f.path),'utf8');
 const matches=content.matchAll(/(?:repo:)?(?:skills|references|engine|catalog|research|assets|examples|docs)\/[A-Za-z0-9_./-]+\.(?:md|json|mjs|js|py|css|html|svg|png|csv)\b/g);
 for(const match of matches){
 const raw=match[0],p=raw.replace(/^repo:/,'');
 const candidates=raw.startsWith('repo:')||/^(skills|catalog|research|assets|examples|docs)\//.test(p)?[p]:[relative(root,resolve(root,dirname(f.path),p)),relative(root,resolve(root,'skills/infograph-master',p))];
 if(f.path==='skills/infograph-master/references/router.md'&&p==='references/atlas.md'&&content.includes('within that skill')&&content.includes('skills/narrative-design/SKILL.md'))candidates.push('skills/narrative-design/'+p);
 const found=candidates.find(x=>paths.has(x));
 const row={source:f.path,reference:raw,resolved:found??null};
 refs.push(row);if(!found)issues.push(row);
 }
 }
 return {arm:m.arm,revision:m.revision,referenceCount:refs.length,issues,scope:'lexical explicit references only; indirect dependencies, optional references and embedded answer content require review',closure:issues.length?'review-required':'lexical-pass',sandbox:'not-run'};
}
if(process.argv[2])console.log(JSON.stringify(auditArm(process.argv[2]),null,2));
