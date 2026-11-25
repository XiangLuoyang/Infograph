import {executeBoundTasks} from './parameter-binding.mjs';
import {extractEvidence} from './design-evidence.mjs';
const clone=x=>JSON.parse(JSON.stringify(x));
export function repairLoop({designId,revision,tasks,scopes,patches=[],maxIterations=3},run){
 if(!Number.isInteger(maxIterations)||maxIterations<0||maxIterations>10||!Number.isSafeInteger(revision)||revision<0||revision>Number.MAX_SAFE_INTEGER-10)throw Error('invalid budget or revision');
 const current=clone(tasks),history=[],seen=new Set();
 const snapshot=()=>JSON.stringify(current);
 function evaluate(rev){const report=executeBoundTasks(current,run);return {revision:rev,report,evidence:extractEvidence({designId,revision:rev,report,scopes})}}
 const finish=status=>({status,tasks:current,acceptedRevision:revision,history,releaseAuthorized:false});
 history.push(evaluate(revision));seen.add(snapshot());
 for(const patch of patches.slice(0,maxIterations)){
 if(patch.revision!==revision)throw Error('stale patch');
 const task=current.find(t=>t.id===patch.taskId);
 if(!task||task.studio!=='composition'||!['width','height'].includes(patch.field)||!Object.hasOwn(task.input,patch.field)||!Number.isFinite(patch.value)||patch.value<240||patch.value>2400)throw Error('patch outside permitted geometry scope');
 const previous=task.input[patch.field];
 if(previous===patch.value)return finish('no-change');
 task.input[patch.field]=patch.value;
 if(seen.has(snapshot())){task.input[patch.field]=previous;return finish('cycle-stopped')}
 const state=evaluate(revision+1);history.push({...state,patch:clone(patch)});
 if(state.report.status!=='generated'){task.input[patch.field]=previous;return finish('candidate-rejected')}
 revision++;seen.add(snapshot());
 }
 return finish(patches.length>maxIterations?'budget-exhausted':'recomputed-unverified');
}
