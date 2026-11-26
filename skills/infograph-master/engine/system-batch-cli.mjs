import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {initBatchLoop,beginBatch,finishBatch,rejectBatch,resumeBatch} from './system-batch-loop.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));const hash=p=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex');
const [mode,...a]=process.argv.slice(2);let out;
if(mode==='init'&&a.length===4){out=initBatchLoop(read(a[0]),read(a[1]),hash(a[2]));writeFileSync(a[3],JSON.stringify(out,null,2),{flag:'wx'})}
else if(mode==='begin'&&a.length===5){out=beginBatch(read(a[0]),read(a[1]),{currentRef:hash(a[2]),limit:Number(a[3])});writeFileSync(a[4],JSON.stringify(out.state,null,2),{flag:'wx'})}
else if(mode==='finish'&&a.length===6){const s=read(a[1]),r=read(a[4]);if(hash(a[2])!==s.currentRef||hash(a[3])!==r.outputRef)throw Error('actual file hash mismatch');out=finishBatch(read(a[0]),s,r);if(out.accepted)writeFileSync(a[5],JSON.stringify(out.state,null,2),{flag:'wx'});else process.exitCode=1}
else if(mode==='reject'&&a.length===5){out=rejectBatch(read(a[0]),read(a[1]),a[3],hash(a[2]));writeFileSync(a[4],JSON.stringify(out,null,2),{flag:'wx'})}
else if(mode==='resume'&&a.length===3)out=resumeBatch(read(a[0]),read(a[1]),hash(a[2]));
else throw Error('usage: init plan ledger original next-state | begin plan state current limit next-state | finish plan state current candidate result next-state | reject plan state current reason next-state | resume plan state current');
console.log(JSON.stringify(out,null,2));
