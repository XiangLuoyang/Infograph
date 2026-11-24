const clone=x=>JSON.parse(JSON.stringify(x));
export function createInteraction({entities,scenes,initialScene,parameters={}}){
if(!Array.isArray(entities)||!entities.length||!Array.isArray(scenes)||!scenes.includes(initialScene)||new Set(scenes).size!==scenes.length)throw Error('invalid configuration');
const ids=new Map();for(const e of entities){if(typeof e.id!=='string'||!e.id.trim()||ids.has(e.id))throw Error('invalid entity');ids.set(e.id,{...e})}
for(const e of entities){const seen=new Set([e.id]);let p=e.parent;while(p!=null){if(!ids.has(p)||seen.has(p))throw Error('invalid hierarchy');seen.add(p);p=ids.get(p).parent}}
for(const p of Object.values(parameters))if(![p.min,p.max,p.initial].every(Number.isFinite)||p.min>p.initial||p.initial>p.max)throw Error('invalid parameter');
const initial={scene:initialScene,selected:null,focus:null,scope:null,filter:null,compare:[],parameters:Object.fromEntries(Object.entries(parameters).map(([k,p])=>[k,p.initial]))};
let state=clone(initial),history=[];
const entity=id=>{if(!ids.has(id))throw Error('unknown entity');return ids.get(id)};
function dispatch(event){const next=clone(state);switch(event.type){
case 'select':case 'focus':entity(event.id);next[event.type==='select'?'selected':'focus']=event.id;break;
case 'filter':if(event.ids!==null&&(!Array.isArray(event.ids)||new Set(event.ids).size!==event.ids.length))throw Error('invalid filter');if(event.ids)event.ids.forEach(entity);next.filter=event.ids===null?null:[...event.ids];break;
case 'drill':if((entity(event.id).parent??null)!==state.scope)throw Error('not a direct child');next.scope=event.id;break;
case 'rollup':next.scope=state.scope===null?null:entity(state.scope).parent??null;break;
case 'compare':if(!Array.isArray(event.ids)||event.ids.length!==2||new Set(event.ids).size!==2)throw Error('two distinct entities required');event.ids.forEach(entity);if((entity(event.ids[0]).parent??null)!==(entity(event.ids[1]).parent??null))throw Error('comparison requires peers');next.compare=[...event.ids];break;
case 'navigate':if(!scenes.includes(event.scene))throw Error('unknown scene');next.scene=event.scene;break;
case 'parameter':if(!Object.hasOwn(parameters,event.key)||!Number.isFinite(event.value)||event.value<parameters[event.key].min||event.value>parameters[event.key].max)throw Error('invalid parameter');next.parameters[event.key]=event.value;break;
case 'undo':if(history.length)state=history.pop();return snapshot();
case 'reset':history.push(state);state=clone(initial);return snapshot();
default:throw Error('unsupported event')}
history.push(state);state=next;return snapshot()}
function snapshot(){return clone(state)}
return {dispatch,snapshot,canUndo:()=>history.length>0};
}