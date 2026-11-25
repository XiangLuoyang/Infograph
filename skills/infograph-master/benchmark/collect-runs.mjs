export function collectRuns(schedule,records){
 const byId=new Map(schedule.map(x=>[x.runId,x]));if(byId.size!==schedule.length)throw Error('duplicate schedule id');
 const seen=new Set(),accepted=[];
 for(const x of records){const p=byId.get(x.runId);if(!p||seen.has(x.runId)||x.task!==p.task||x.arm!==p.arm||x.modelSlot!==p.model)throw Error('run identity mismatch');seen.add(x.runId);
 if(!['completed','failed'].includes(x.status)||typeof x.modelVersion!=='string'||!x.modelVersion.trim()||typeof x.settingsRef!=='string'||!x.settingsRef.trim()||typeof x.promptRef!=='string'||!x.promptRef.trim())throw Error('missing run metadata');
 if(x.status==='completed'&&(typeof x.artifactRef!=='string'||!x.artifactRef.trim()))throw Error('missing artifact');
 if(x.status==='failed'&&(typeof x.failure!=='string'||!x.failure.trim()))throw Error('missing failure');
 for(const k of ['elapsedSeconds','inputTokens','outputTokens','toolCalls','repairTurns'])if(x[k]!=null&&(!Number.isFinite(x[k])||x[k]<0))throw Error('invalid metric '+k);
 accepted.push({...x,reviewStatus:'not-run'});}
 return {planned:schedule.length,completed:accepted.filter(x=>x.status==='completed').length,failed:accepted.filter(x=>x.status==='failed').length,pending:schedule.filter(x=>!seen.has(x.runId)).map(x=>x.runId),records:accepted,validation:'metadata-only'};
}
