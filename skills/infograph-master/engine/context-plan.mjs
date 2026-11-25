export function planContext(index,{groups=[],budget=24000}={}){
 if(!Number.isInteger(budget)||budget<0)throw Error('invalid budget');
 const selected=[],deferred=[],seen=new Set();let used=0,mandatoryBytes=0;
 for(const g of [...new Set([...index.policy.mandatory,...groups])]){
 if(!Object.hasOwn(index.groups,g))throw Error('unknown group '+g);
 for(const a of index.groups[g]){if(seen.has(a.path))continue;seen.add(a.path);const mandatory=index.policy.mandatory.includes(g);if(!Number.isInteger(a.bytes)||a.bytes<0)throw Error('size unknown');if(mandatory){mandatoryBytes+=a.bytes;selected.push({...a,mandatory});continue}if(used+a.bytes>budget){deferred.push({...a,reason:'budget'});continue}used+=a.bytes;selected.push({...a,mandatory});}
 }
 return {selected,deferred,optionalBytes:used,mandatoryBytes,budget,complete:deferred.length===0,unit:'utf8-bytes'};
}
