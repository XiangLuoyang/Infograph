import {readFileSync} from 'node:fs';
import {auditSystemPlan,auditSystemProgress} from './system-refactor.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));const [mode,...args]=process.argv.slice(2);let out;if(mode==='plan'&&args.length===1)out=auditSystemPlan(read(args[0]));else if(mode==='progress'&&args.length===2)out=auditSystemProgress(read(args[0]),read(args[1]));else throw Error('usage: plan plan.json | progress plan.json ledger.json');console.log(JSON.stringify(out,null,2));if(mode==='plan'&&!out.eligible||mode==='progress'&&!out.scopeComplete)process.exitCode=1;
