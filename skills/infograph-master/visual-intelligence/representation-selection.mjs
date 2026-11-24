export function recommendRepresentation({relation,task,available=[]},rules){
if(!Array.isArray(available)||available.some(x=>typeof x!=='string')||!Array.isArray(rules))throw Error('invalid input');
const matches=rules.filter(r=>r.relation===relation&&r.task===task);
return {status:matches.length?'matched':'unsupported',candidates:matches.map(r=>{const missing=r.requires.filter(k=>!available.includes(k));return {forms:r.forms,channels:r.channels,missing,eligible:missing.length===0}}),scope:'advisory; declared field presence is not evidence validation'};
}