import {designControls} from './studio-controls.mjs';
import {repairLoop} from './repair-loop.mjs';
import {executeSpecialist} from './specialist-execution.mjs';
import {renderUnified} from './unified-renderer.mjs';
export function runMaster({designId,revision=0,rows,unit,title,subtitle,claim,note,width=800,height=400,hue=150,chroma=.08,dark=false,direction='editorial',base=16,density='normal',material='paper',patches=[]},run=executeSpecialist){
 designControls({hue,chroma,dark,direction,base,density,material,width,height});
 const tasks=[{id:'color',studio:'color',dependsOn:[],input:{hue,chroma,dark}},{id:'type',studio:'typography',dependsOn:[],input:{direction,base,density}},{id:'material',studio:'material',dependsOn:[],input:{material}},{id:'layout',studio:'composition',dependsOn:[],input:{width,height,root:{id:'main'}}},{id:'chart',studio:'representation',dependsOn:['layout'],input:{id:'VIZ-0002',data:{unit,rows}},bindings:[{from:'layout',path:['boxes','0','width'],to:'width',type:'number'},{from:'layout',path:['boxes','0','height'],to:'height',type:'number'}]}];
 const repair=repairLoop({designId,revision,tasks,scopes:[{blockId:'main',layoutTask:'layout',boxId:'main',chartTask:'chart',colorTask:'color'}],patches},run);
 const state=repair.history.find(x=>x.revision===repair.acceptedRevision);
 if(!state||state.report.status!=='generated')return {status:'blocked',repair,releaseAuthorized:false};
 const payload=id=>state.report.results.find(x=>x.id===id).output.payload;
 const html=renderUnified({title,subtitle,claim,note,color:payload('color'),type:payload('type'),material:payload('material'),layout:payload('layout'),chart:payload('chart')});
 return {status:'rendered-unverified',repair,html,releaseAuthorized:false};
}
