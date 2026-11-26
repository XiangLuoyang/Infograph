import {readFileSync} from 'node:fs';
import {proposeIntentCandidates} from './reconstruction-runtime-core.mjs';
if(process.argv.length<3||process.argv.length>4)throw Error('usage: node intent-candidates-cli.mjs source.ir.json [runtime.json]');
const read=p=>JSON.parse(readFileSync(p,'utf8'));console.log(JSON.stringify(proposeIntentCandidates(read(process.argv[2]),process.argv[3]?read(process.argv[3]):null),null,2));
