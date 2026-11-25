export const defaults={hue:150,chroma:.08,dark:false,direction:'editorial',base:16,density:'normal',material:'paper',width:800,height:400};
export function designControls(input={}){
 const d=Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,input[k]===undefined?v:input[k]]));
 const range=(k,a,b)=>Number.isFinite(d[k])&&d[k]>=a&&d[k]<=b;
 if(!range('hue',0,359)||!range('chroma',0,.2)||typeof d.dark!=='boolean'||!['editorial','swiss','technical'].includes(d.direction)||!range('base',12,24)||!['compact','normal','reading'].includes(d.density)||!['paper','metal','stone','glass','matte'].includes(d.material)||!range('width',320,1600)||!range('height',240,800)||!Number.isInteger(d.width)||!Number.isInteger(d.height))throw Error('invalid design controls');
 return d;
}
