import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const paths=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const rows=[];
for(const path of paths){
 if(!/\.(html|svg|css|mjs|js|json|ya?ml|md|png|jpg|woff2?)$/i.test(path))continue;
 const bytes=await readFile(path),sha256=createHash('sha256').update(bytes).digest('hex');
 const binary=/\.(png|jpg|woff2?)$/i.test(path),s=binary?'':bytes.toString('utf8');
 const urls=[...new Set(s.match(/https?:\/\/[^\s"'<>\x60\\)]+/g)||[])].sort();
 const markers=s.split('\n').flatMap((line,i)=>/SPDX-License-Identifier|copyright|licensed under|all rights reserved/i.test(line)?[{line:i+1,text:line.trim().slice(0,240)}]:[]);
 const imports=[...new Set(s.match(/(?:import|export)\s+[^;\n]*?\sfrom\s*['"][^'"]+['"]|(?:src|href)\s*=\s*['"](?:https?:)?\/\/[^'"]+['"]/g)||[])];
 rows.push({path,bytes:bytes.length,sha256,binary,urls,markers,imports});
}
console.log(JSON.stringify({version:1,revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),tracked:paths.length,scanned:rows.length,excluded:paths.filter(p=>!rows.some(r=>r.path===p)),rows,limitations:['Static lexical inventory only; dynamic URLs, bundled/minified code, binary metadata and ownership require separate review.','URLs include citations and namespace identifiers; presence does not establish runtime use or licensing.']},null,2));
