import {readFileSync} from 'node:fs';
import {compareRuntime} from './reconstruction-runtime-core.mjs';
if(process.argv.length!==5)throw Error('usage: node runtime-diff-cli.mjs old.json new.json required-probes.json');
const read=p=>JSON.parse(readFileSync(p,'utf8'));console.log(JSON.stringify(compareRuntime(read(process.argv[2]),read(process.argv[3]),read(process.argv[4])),null,2));
