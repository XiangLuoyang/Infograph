import {readFileSync} from 'node:fs';
import {buildContactSheet} from './cross-page-review.mjs';
const [input,out]=process.argv.slice(2);if(!out)throw Error('usage: pairs.json new-review.html');
const pairs=JSON.parse(readFileSync(input,'utf8')).map(p=>({before:{dir:p.before.dir,report:JSON.parse(readFileSync(p.before.report,'utf8'))},after:{dir:p.after.dir,report:JSON.parse(readFileSync(p.after.report,'utf8'))}}));
console.log(JSON.stringify(await buildContactSheet(pairs,out),null,2));
