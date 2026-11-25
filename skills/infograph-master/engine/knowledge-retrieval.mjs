export function retrieveKnowledge(index,{query='',budget=6000,requiredPaths=[]}={}){
 if(typeof query!=='string'||!Number.isInteger(budget)||budget<0||!Array.isArray(requiredPaths))throw Error('invalid retrieval request');
 const s=query.toLowerCase(),required=new Set(requiredPaths),selected=[],deferred=[];let used=0,mandatoryBytes=0;
 const ranked=index.units.map(u=>({...u,required:u.mandatory||required.has(u.path),matches:u.tags.filter(t=>s.includes(t.toLowerCase()))})).sort((a,b)=>Number(b.required)-Number(a.required)||b.matches.length-a.matches.length||a.id.localeCompare(b.id));
 for(const u of ranked){if(u.required){selected.push(u);mandatoryBytes+=u.bytes}else if(u.matches.length){if(used+u.bytes<=budget){selected.push(u);used+=u.bytes}else deferred.push({id:u.id,path:u.path,reason:'budget'})}}
 const missingRequired=[...required].filter(p=>!index.units.some(u=>u.path===p));
 return {selected,deferred,missingRequired,optionalBytes:used,mandatoryBytes,status:missingRequired.length?'incomplete':'advisory',validation:'not-run'};
}
