export function recommendMotion({goal,frequent=false,reduced=false,hasTimeSeries=false,hasModel=false}={}){
const patterns={feedback:'interruptible-feedback',identity:'shared-element',history:'temporal-identity',narrative:'scroll-disclosure',mechanism:'executable-argument',navigation:'context-navigation',comparison:'static-comparison'};
if(!Object.hasOwn(patterns,goal))throw Error('unknown goal');
const blockers=[];if(goal==='history'&&!hasTimeSeries)blockers.push('actual time series required');if(goal==='mechanism'&&!hasModel)blockers.push('explicit computational model required');
return {pattern:patterns[goal],allowed:blockers.length===0,blockers,animation:!blockers.length&&!reduced&&goal!=='comparison'&&!(frequent&&goal==='feedback')?'optional':'none',requirements:['static alternative','manual control','stable identity where applicable'],scope:'heuristic recommendation'};
}