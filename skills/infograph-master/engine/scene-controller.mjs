/* Accessible scene state controller. No automatic playback. */
export function createSceneController({scenes,previous,next,status,onChange=()=>{}}){
 if(!Array.isArray(scenes)||!scenes.length||new Set(scenes).size!==scenes.length)throw new Error('Unique scene elements required');
 let index=0;const original=scenes.map(s=>s.hidden);
 function show(i){if(!Number.isInteger(i)||i<0||i>=scenes.length)return false;index=i;scenes.forEach((s,j)=>s.hidden=j!==i);previous.disabled=i===0;next.disabled=i===scenes.length-1;status.textContent=(i+1)+' / '+scenes.length;onChange(i);return true}
 const back=()=>show(index-1),forward=()=>show(index+1);
 previous.addEventListener('click',back);next.addEventListener('click',forward);status.setAttribute('aria-live','polite');show(0);
 return {show,get index(){return index},destroy(){previous.removeEventListener('click',back);next.removeEventListener('click',forward);scenes.forEach((s,j)=>s.hidden=original[j])}}
}
