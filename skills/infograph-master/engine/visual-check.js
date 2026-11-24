/* Run in target page browser console. Heuristic diagnostics, not certification. */
function infographVisualCheck(root=document){
 const issues=[]; const nodes=[...root.querySelectorAll('[data-ig-block]')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
 for(const e of nodes){const r=e.getBoundingClientRect();if(e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2)issues.push({kind:'overflow-review',id:e.dataset.igBlock});if(r.left< -2||r.right>document.documentElement.clientWidth+2)issues.push({kind:'viewport-review',id:e.dataset.igBlock});}
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];if(a.contains(b)||b.contains(a)||a.dataset.igOverlay==='true'||b.dataset.igOverlay==='true')continue;const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();if(Math.min(x.right,y.right)-Math.max(x.left,y.left)>2&&Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)>2)issues.push({kind:'overlap-review',ids:[a.dataset.igBlock,b.dataset.igBlock]});}
 return {checked:nodes.length,issues,scope:'visible tagged blocks only; manual review required'};
}
