export function scheduleExperiment(plan,{seed=42}={}){
 if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw Error('invalid seed');
 for(const k of ['tasks','arms','modelSlots'])if(!Array.isArray(plan[k])||!plan[k].length||new Set(plan[k]).size!==plan[k].length)throw Error('invalid '+k);
 if(!Number.isInteger(plan.repetitions)||plan.repetitions<1)throw Error('invalid repetitions');
 let s=seed>>>0;const random=()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296};
 const rows=[];for(const model of plan.modelSlots)for(const task of plan.tasks)for(let rep=1;rep<=plan.repetitions;rep++){const arms=[...plan.arms];for(let i=arms.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[arms[i],arms[j]]=[arms[j],arms[i]]}for(const arm of arms)rows.push({runId:'R'+String(rows.length+1).padStart(4,'0'),model,task,rep,arm,status:'not-run'});}
 return rows;
}
