import {readFileSync} from 'node:fs';
import {mineOpportunities,auditExploration} from './design-opportunity.mjs';
if(process.argv.length<3||process.argv.length>4)throw Error('usage: node design-opportunity-cli.mjs packet.json [exploration.json]');
const read=p=>JSON.parse(readFileSync(p,'utf8'));const result=mineOpportunities(read(process.argv[2]));const exploration=process.argv[3]?auditExploration(read(process.argv[3]),result.opportunities):null;console.log(JSON.stringify({result,exploration},null,2));if(result.errors.length||exploration&&!exploration.eligible)process.exitCode=1;
