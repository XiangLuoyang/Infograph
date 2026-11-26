import {readFileSync} from 'node:fs';
import {diffArtifactIR} from './artifact-semantic-ir.mjs';
if(process.argv.length<4||process.argv.length>5)throw Error('usage: node artifact-diff-cli.mjs before.json after.json [aliases.json]');
const read=p=>JSON.parse(readFileSync(p,'utf8'));console.log(JSON.stringify(diffArtifactIR(read(process.argv[2]),read(process.argv[3]),process.argv[4]?read(process.argv[4]):[]),null,2));
