import {readFileSync} from 'node:fs';
import {inspectRuntime} from './artifact-runtime-inspector.mjs';
if(process.argv.length!==5||process.argv[2]!=='--trusted')throw Error('usage: node artifact-runtime-cli.mjs --trusted input.html plan.json');
console.log(JSON.stringify(await inspectRuntime(process.argv[3],JSON.parse(readFileSync(process.argv[4],'utf8')),{trusted:true}),null,2));
