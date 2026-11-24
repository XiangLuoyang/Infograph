export const registry=Object.freeze([
 Object.freeze({id:'native-ranking',task:'ranking',mode:'deterministic',constraints:'nonnegative finite numeric rows'}),
 Object.freeze({id:'native-lookup',task:'lookup',mode:'deterministic',constraints:'numeric rows'}),
 Object.freeze({id:'custom-slot',task:'*',mode:'generative',constraints:'reviewed external implementation; no automatic execution'})
]);
export function routeBlock(block,data){
 if(!block||typeof block.id!=='string'||!block.id||typeof block.task!=='string')throw Error('invalid block');
 const native=registry.find(r=>r.task===block.task);
 const valid=data&&typeof data.unit==='string'&&data.unit.trim()&&Array.isArray(data.rows)&&data.rows.length&&data.rows.every(r=>typeof r.label==='string'&&Number.isFinite(r.value)&&(block.task!=='ranking'||r.value>=0));
 return {blockId:block.id,renderer:native&&valid?native.id:'custom-slot',mode:native&&valid?'deterministic':'generative',reason:!native?'unsupported native task':!valid?'native input contract unmet':'native contract matched'};
}
export function planHybrid(plan,data){
 if(!plan||!Array.isArray(plan.scenes)||!data||typeof data!=='object')throw Error('invalid plan or data');
 const ids=new Set(),slots=[];for(const scene of plan.scenes)for(const b of scene.blocks){if(ids.has(b.id))throw Error('duplicate block');ids.add(b.id);slots.push({...routeBlock(b,Object.hasOwn(data,b.id)?data[b.id]:undefined),sceneId:scene.id,evidenceIds:[...b.evidenceIds]})}
 return {slots,requiresReview:slots.filter(s=>s.mode==='generative').map(s=>s.blockId),runtimeReady:slots.every(s=>s.mode==='deterministic')&&!plan.interaction.transitions.length&&!plan.spatial.objects.length};
}
export function createState(initial,allowed){
 if(!Array.isArray(allowed)||!allowed.includes(initial))throw Error('invalid initial state');
 const states=new Set(allowed);let current=initial;const listeners=new Set();
 return {get:()=>current,set(next){if(!states.has(next))throw Error('unknown state');if(next===current)return false;current=next;for(const fn of [...listeners])fn(current);return true},subscribe(fn){if(typeof fn!=='function')throw Error('listener required');listeners.add(fn);return ()=>listeners.delete(fn)}};
}
export function repairPlan(issues,slots){
 const ids=new Set(slots.map(s=>s.blockId));return issues.map(i=>({scope:ids.has(i.blockId)?'block':'document',blockId:ids.has(i.blockId)?i.blockId:null,issue:String(i.message),action:'review and regenerate affected scope; revalidate whole document'}));
}
