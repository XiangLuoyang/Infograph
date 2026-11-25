import {validateIR,reviseIR} from './design-v3.mjs';
const types={color:'Color',typography:'Typography',composition:'Layout',material:'Material',motion:'Motion',representation:'Representation'};
const clone=x=>JSON.parse(JSON.stringify(x));
export function fromStoryboard(s,id,model){
 if(!s||!Array.isArray(s.evidence)||!Array.isArray(s.acts)||!s.acts.length)throw Error('invalid storyboard');
 const objects=[{id:'brief',type:'Brief',audience:s.audience,purpose:s.purpose,thesis:s.thesis,spine:s.spine}],links=[];
 const link=(from,type,to)=>links.push({from,type,to});
 for(const e of s.evidence)objects.push({...clone(e),id:'e:'+e.id,type:'Evidence'});
 let previous=null;
 for(const a of s.acts){const scene='s:'+a.id,claim='c:'+a.id,block='b:'+a.id;
 objects.push({id:scene,type:'Scene',question:a.question,before:a.before,after:a.after,transition:a.transition},{id:claim,type:'Claim',text:a.claim},{id:block,type:'Block',role:'primary',task:a.visual_task,interactionNote:a.interaction});
 link(scene,'serves','brief');link(scene,'contains',block);link(block,'expresses',claim);
 if(!Array.isArray(a.evidence_ids))throw Error('evidence_ids required');
 for(const e of a.evidence_ids)link('e:'+e,'supports',claim);
 if(previous)link(previous,'advances',scene);previous=scene;
 }
 const d={version:'3.0',id,revision:0,graph:{version:'0.1',objects,links},outputs:[],validation:{required:['browser','semantic'],results:[]},migration:{source:'storyboard',original:clone(s),assumptions:['one primary block per act; thesis retained as brief metadata, not certified claim']}};
 const a=validateIR(d,model);if(a.errors.length)throw Error(a.errors.join('; '));return d;
}
export function attachStudio(d,model,{blockId,targetId,contract,strategy}){
 if(!contract||!Object.hasOwn(types,contract.studio)||typeof strategy!=='string'||!strategy.trim()||typeof targetId!=='string'||!targetId.trim())throw Error('invalid attachment');
 if(!d.graph.objects.some(o=>o.id===blockId&&o.type==='Block'))throw Error('unknown block');
 const type=types[contract.studio];
 if(d.graph.objects.some(o=>o.id===targetId))throw Error('target already exists');
 const next=reviseIR(d,model,n=>{n.graph.objects.push({id:targetId,type,[type==='Representation'?'form':'strategy']:strategy});n.graph.links.push({from:blockId,type:'uses',to:targetId})});
 // Attachment adds a new object only. Older outputs are not carried forward automatically.
 next.outputs.push({targetId,contract:clone(contract)});
 const a=validateIR(next,model);if(a.errors.length)throw Error(a.errors.join('; '));return next;
}
export function attachBatch(d,model,items){
 if(!Array.isArray(items)||!items.length)throw Error('empty batch');
 let next=d;const outputs=[];
 for(const item of items){next=attachStudio(next,model,item);outputs.push(...next.outputs)}
 next.outputs=outputs;const a=validateIR(next,model);if(a.errors.length)throw Error(a.errors.join('; '));return next;
}
