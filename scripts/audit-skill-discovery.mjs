import {readFileSync,readdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {auditDiscovery} from './skill-discovery.mjs';
const root=resolve(process.argv[2]??'.');
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):e.isFile()?[relative(root,resolve(dir,e.name)).replaceAll('\\','/')]:[])}
const paths=walk(resolve(root,'skills'));
const read=p=>readFileSync(resolve(root,p),'utf8');
const report=auditDiscovery(paths,read,JSON.parse(read('skills/manifest.json')));
console.log(JSON.stringify(report,null,2));
if(!report.pass)process.exitCode=1;
