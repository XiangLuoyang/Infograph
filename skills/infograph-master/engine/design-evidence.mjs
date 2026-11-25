const own=(o,k)=>o!=null&&Object.hasOwn(o,k);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function extractEvidence({designId,revision,report,scopes}){
 if(typeof designId!=='string'||!designId||!Number.isSafeInteger(revision)||revision<0||!Array.isArray(report?.results)||!Array.isArray(scopes))throw Error('invalid evidence request');
 const map=new Map();for(const r of report.results){if(!r.id||map.has(r.id))throw Error('duplicate or missing task');map.set(r.id,r)}
 const blocks=Object.create(null),observations=[],seen=new Set();
 for(const s of scopes){if(typeof s.blockId!=='string'||!s.blockId||seen.has(s.blockId))throw Error('invalid scope');seen.add(s.blockId);const facts=Object.create(null);blocks[s.blockId]=facts;
 const emit=(field,value,task,path,scope,eligible=false)=>{observations.push({blockId:s.blockId,field,value,source:'algorithm-output',task,path,scope,eligible});if(eligible)facts[field]=value};
 const layout=map.get(s.layoutTask),chart=map.get(s.chartTask),color=map.get(s.colorTask);
 if(layout?.status==='generated'){const boxes=layout.output?.payload?.boxes;const box=Array.isArray(boxes)?boxes.find(x=>x.id===s.boxId):null;if(box&&finite(box.width)&&box.width>0)emit('availableWidth',box.width,layout.id,['boxes',s.boxId,'width'],'planned geometry, not measured text space',true)}
 if(chart?.status==='generated'&&finite(chart.input?.width))emit('requestedChartWidth',chart.input.width,chart.id,['input','width'],'renderer request, not minimum required width');
 if(color?.status==='generated'){const a=color.output?.payload?.audit;if(Array.isArray(a)&&a.length&&a.every(x=>finite(x.ratio)&&x.ratio>=1&&x.ratio<=21))emit('paletteMinContrast',Math.min(...a.map(x=>x.ratio)),color.id,['audit'],'opaque palette pairs only, not effective page contrast')}
 for(const id of [s.layoutTask,s.chartTask,s.colorTask].filter(x=>x!==undefined)){const r=map.get(id);if(r)emit('taskStatus',r.status,id,['status'],'execution status, not visual validation')}
 }
 return {designId,revision,blocks,observations,limitations:['task-to-block scope is caller supplied','algorithm outputs are not browser measurements','no cryptographic provenance or semantic truth verification']};
}
