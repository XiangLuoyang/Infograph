export function explore(rows,{filters={},focus=null}={}){
if(!Array.isArray(rows)||new Set(rows.map(r=>r.id)).size!==rows.length)throw Error('invalid rows');
for(const r of rows)if(typeof r.id!=='string'||!r.id||!['stock','sales','supply'].every(k=>Number.isFinite(r[k])&&r[k]>=0))throw Error('invalid row');
for(const [k,v] of Object.entries(filters))if(!['id','region'].includes(k)||!Array.isArray(v)||v.some(x=>typeof x!=='string'))throw Error('invalid filter');
const selected=rows.filter(r=>Object.entries(filters).every(([k,v])=>v.includes(r[k])));
const totals=Object.fromEntries(['stock','sales','supply'].map(k=>[k,selected.reduce((s,r)=>s+r[k],0)]));
return {ids:selected.map(r=>r.id),totals,focus:focus===null?null:selected.find(r=>r.id===focus)?.id??null,shares:selected.map(r=>({id:r.id,stockShare:totals.stock?r.stock/totals.stock:null}))};
}
export function scenario({stock,supply,sales,other=0}){
if(![stock,supply,sales,other].every(Number.isFinite)||Math.min(stock,supply,sales)<0)throw Error('invalid inputs');
const end=stock+supply-sales+other;
return {end,feasible:end>=0,delta:end-stock,assumption:'conditional inventory balance, not forecast'};
}
export function sensitivity(input,values,key='supply'){
if(!['supply','sales','other'].includes(key)||!Array.isArray(values)||!values.length)throw Error('invalid sweep');
return values.map(value=>({value,...scenario({...input,[key]:value})}));
}