import {readFileSync} from 'node:fs';
import {auditReconstruction} from './reconstruction.mjs';
if(process.argv.length!==3)throw Error('usage: node reconstruction-cli.mjs packet.json');
const result=auditReconstruction(JSON.parse(readFileSync(process.argv[2],'utf8')));console.log(JSON.stringify(result,null,2));if(!result.planEligible)process.exitCode=1;
