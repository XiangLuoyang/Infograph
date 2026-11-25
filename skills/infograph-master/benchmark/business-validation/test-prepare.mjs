import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prepare} from './prepare.mjs';
const read=n=>JSON.parse(readFileSync(new URL(n,import.meta.url),'utf8'));
const f=read('fixtures.json'),t=read('tasks.json'),k=read('answer-key.json');
const sum=(a,key)=>a.reduce((s,r)=>s+r[key],0);
const m=f.markets, p=f.pricing, i=f.inventory, a=f.assembly, g=f.process;
const revenue=sum(m,'revenue'),target=sum(m,'target'),displayed=sum(m,'displayed'),stores=sum(m,'stores');
const retail=p.rrp*(1-p.retailMargin),buy=retail*(1-p.distributorMargin);
const score=r=>[r.sales,r.coverage,r.compliance,r.service].every(Number.isFinite)?(r.sales+r.coverage+r.compliance+r.service)/4:null;
const expected={
 T01:[`total revenue ${revenue}`,`total target ${target}`,`attainment ${(100*revenue/target).toFixed(6)}%`,`display coverage ${displayed}/${stores}`,`TH WOS ${m[0].stock/m[0].weeklySales}`,`VN attainment ${100*m[2].revenue/m[2].target}%`],
 T02:[`P1 WOS ${i[0].stock/i[0].weeklySales}; with inbound ${(i[0].stock+i[0].inbound)/i[0].weeklySales}`,`P2 WOS ${i[1].stock/i[1].weeklySales}`,'P3 zero denominator undefined','P4 missing sales undefined','no forecast claim'],
 T03:[`retail buy price ${retail}`,`retail gross profit ${p.rrp-retail}`,`distributor buy price ${buy}`,`distributor gross profit ${retail-buy}`,`distributor contribution ${retail-buy-p.freight-p.service}`],
 T04:[`A ${score(f.partners[0])}`,`B ${score(f.partners[1])}`,'C incomplete not ranked',`B compliance ${f.partners[1].compliance}`],
 T05:[`${g.nodes.length} nodes`,`${g.edges.length} directed edges`,'no invented transitions','all lane ownership preserved'],
 T06:[`${a.parts.length} parts`,`at multiplier 2 z offsets ${a.parts.map(x=>2*x.offset[2]).join(',')}`,`reset offsets ${a.parts.map(x=>x.offset[2]).join(',')}`,'no invented parts']
};
assert.equal(i[2].weeklySales,0);assert.equal(i[3].weeklySales,null);assert.equal(score(f.partners[2]),null);
const ids=new Set(g.nodes.map(x=>x[0]));assert.equal(ids.size,g.nodes.length);for(const [u,v] of g.edges){assert(ids.has(u)&&ids.has(v));}
assert.deepEqual(k,expected);
const runs=prepare(t,f);assert.equal(runs.length,18);assert.equal(new Set(runs.map(r=>r.id)).size,18);assert.deepEqual(runs,prepare(t,f));assert.notDeepEqual(runs.map(r=>r.id),prepare(t,f,'other').map(r=>r.id));
for(const task of t){const rows=runs.filter(r=>r.task===task.id);assert.equal(rows.length,3);assert.equal(new Set(rows.map(r=>r.promptHash)).size,1);assert.equal(new Set(rows.map(r=>r.prompt)).size,1);assert(!rows[0].prompt.includes('answer-key.json'));assert(!rows[0].prompt.includes('PRIVATE-schedule'));}
assert.throws(()=>prepare(t.map(x=>({...x,checks:[]})),f));assert.throws(()=>prepare(t,{...f,synthetic:false}));
console.log('Business fixture arithmetic and 18-run prompt regression passed');
