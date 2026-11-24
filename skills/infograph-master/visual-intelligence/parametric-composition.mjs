export function solveComposition({width,height,margin=16,gap=12,breakpoint=600,root}){
for(const v of [width,height,margin,gap,breakpoint])if(!Number.isFinite(v)||v<0)throw Error('invalid dimensions');
if(width<=2*margin||height<=2*margin)throw Error('insufficient canvas');
const ids=new Set(),boxes=[];
function walk(n,x,y,w,h,depth){
if(depth>20||!n||typeof n.id!=='string'||!n.id||ids.has(n.id))throw Error('invalid tree');
ids.add(n.id);if(w<=0||h<=0||w<(n.minWidth??0)||h<(n.minHeight??0))throw Error('infeasible bounds: '+n.id);
for(const v of [n.minWidth??0,n.minHeight??0])if(!Number.isFinite(v)||v<0)throw Error('invalid minimum');
boxes.push({id:n.id,x,y,width:w,height:h,depth,leaf:!n.children});
if(!n.children)return;
if(!Array.isArray(n.children)||!n.children.length||!['row','column'].includes(n.axis))throw Error('invalid group');
const axis=width<breakpoint&&n.stackOnNarrow!==false?'column':n.axis;
const horizontal=axis==='row',length=horizontal?w:h,available=length-gap*(n.children.length-1);
const weights=n.children.map(c=>c.weight??1),mins=n.children.map(c=>horizontal?(c.minWidth??0):(c.minHeight??0));
if(weights.some(v=>!Number.isFinite(v)||v<=0)||mins.some(v=>!Number.isFinite(v)||v<0)||available<=0||mins.reduce((a,b)=>a+b,0)>=available)throw Error('infeasible allocation');
const remaining=available-mins.reduce((a,b)=>a+b,0),total=weights.reduce((a,b)=>a+b,0);if(!Number.isFinite(total))throw Error('invalid total weight');
let cursor=horizontal?x:y;
n.children.forEach((c,i)=>{const size=mins[i]+remaining*weights[i]/total;walk(c,horizontal?cursor:x,horizontal?y:cursor,horizontal?size:w,horizontal?h:size,depth+1);cursor+=size+gap});
}
walk(root,margin,margin,width-2*margin,height-2*margin,0);
return {width,height,boxes,scope:'rectangular geometry only'};
}