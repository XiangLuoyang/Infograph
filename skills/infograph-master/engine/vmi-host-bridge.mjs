// Host-owned input snapshots. The sandbox has an opaque origin; authenticate replies by WindowProxy.
export function createVmiBridge(frame,initial,onStatus=()=>{}){
 if(!frame||typeof frame.addEventListener!=='function')throw Error('iframe required');
 let values={...initial},revision=0,disposed=false;
 const keys=Object.keys(values);
 const valid=v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k)&&typeof v[k]==='number'&&Number.isFinite(v[k]));
 if(!keys.length||!valid(values))throw Error('numeric snapshot required');
 const send=()=>{if(!disposed)frame.contentWindow?.postMessage({type:'ig:vmi:inputs:v1',revision,values},'*')};
 const receive=e=>{if(disposed||e.source!==frame.contentWindow)return;const m=e.data;if(m?.type==='ig:vmi:ready:v1')send();else if(m?.type==='ig:vmi:ack:v1'&&m.revision===revision&&typeof m.ok==='boolean')onStatus({revision,ok:m.ok})};
 window.addEventListener('message',receive);frame.addEventListener('load',send);send();
 return {setInputs(next){if(disposed||!valid(next))throw Error('invalid host snapshot');values={...next};revision++;send();return revision},dispose(){disposed=true;window.removeEventListener('message',receive);frame.removeEventListener('load',send)}};
}
