export function inspectSemantic(task,key,observations){
 const expected=key[task];if(!expected||!['B02','B03','B07','B10'].includes(task))throw Error('unknown task');
 if(!Array.isArray(observations))throw Error('observations required');
 const map=new Map();for(const o of observations){if(!o.field||map.has(o.field)||typeof o.ref!=='string'||!o.ref.trim())throw Error('invalid observation');map.set(o.field,o)}
 const checks=[];const check=(field,test)=>{const o=map.get(field);checks.push({field,status:!o?'not-run':test(o)?'observed-match':'mismatch',ref:o?.ref??null})};
 const units={target:'million',actual:'million',supply:'thousand',sellThrough:'thousand',endStock:'thousand',gap:'thousand',attainment:'ratio',wos:'weeks',thailandStockShare:'ratio',thailandGapShare:'ratio',at80:'thousand',at100:'thousand',at120:'thousand'};
 const numeric=field=>check(field,o=>o.unit===units[field]&&typeof o.value==='number'&&Number.isFinite(o.value)&&Math.abs(o.value-expected[field])<=(units[field]==='ratio'?.0005:units[field]==='weeks'?.01:1e-8));
 const setEqual=(a,b)=>Array.isArray(a)&&a.length===b.length&&new Set(a.map(x=>JSON.stringify(x))).size===a.length&&b.every(x=>a.some(y=>JSON.stringify(x)===JSON.stringify(y)));
 if(task==='B07'){check('nodes',o=>setEqual(o.value,expected.nodes));check('edges',o=>setEqual(o.value,expected.edges))}
 else for(const field of Object.keys(expected).filter(k=>typeof expected[k]==='number'))numeric(field);
 return {task,checks,status:checks.some(c=>c.status==='mismatch')?'mismatch':checks.some(c=>c.status==='not-run')?'incomplete':'observed-match',claims:'not-run',visualEncoding:'not-run',releaseAuthorized:false,scope:'reviewer-transcribed observations; not independent extraction'};
}
