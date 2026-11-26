import {readFileSync} from 'node:fs';
import {inspectRuntime} from './artifact-runtime-inspector.mjs';
const [flag,file,plan,dir]=process.argv.slice(2);
if(flag!=='--trusted'||!dir)throw Error('usage: --trusted artifact.html plan.json new-capture-directory');
console.log(JSON.stringify(await inspectRuntime(file,JSON.parse(readFileSync(plan,'utf8')),{trusted:true,captureDir:dir}),null,2));
