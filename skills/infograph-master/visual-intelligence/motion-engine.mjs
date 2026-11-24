import {createInteraction} from './interaction-state.mjs';
import {explore,scenario} from './exploratory-analysis.mjs';
import {disclosurePlan} from './disclosure-plan.mjs';
import {recommendMotion} from './motion-selection.mjs';
import {sharedTransitions} from './spatial-motion.mjs';
export function createMotionEngine(config){
const c=JSON.parse(JSON.stringify(config)), plan=disclosurePlan(c.disclosure), rows=c.rows;
explore(rows);
if(rows.some(r=>!c.entities.some(e=>e.id===r.id))||c.entities.some(e=>e.parent!=null))throw Error('flat market entities required');
const machine=createInteraction({entities:c.entities,scenes:plan.steps.map(s=>s.id),initialScene:plan.steps[0].id,parameters:c.parameters});
let revision=0,reduced=Boolean(c.reduced),visited=new Set([plan.steps[0].id]);
function view(){const state=machine.snapshot(),scopeRows=rows.filter(r=>state.scope===null||r.id===state.scope),projection=explore(scopeRows,{filters:state.filter===null?{}:{id:state.filter},focus:state.focus});
const step=plan.steps.find(s=>s.id===state.scene),index=plan.steps.indexOf(step);
const context=plan.steps.slice(0,index+1).flatMap(s=>s.visible);
const row=rows.find(r=>r.id===state.selected&&projection.ids.includes(r.id));
const simulation=row&&Number.isFinite(state.parameters.supply)&&Number.isFinite(state.parameters.sales)?scenario({stock:row.stock,supply:state.parameters.supply,sales:state.parameters.sales}):null;
return {revision,state,projection,simulation,visible:[...new Set(context)],visited:[...visited],staticOrder:[...plan.staticOrder],reduced,canUndo:machine.canUndo()}}
function dispatch(event){if(event.type==='motion-preference'){if(typeof event.reduced!=='boolean')throw Error('invalid preference');reduced=event.reduced}else{machine.dispatch(event);visited.add(machine.snapshot().scene)}revision++;return view()}
function transition(before,after,{goal='identity',frequent=false}={}){const policy=recommendMotion({goal,frequent,reduced,hasTimeSeries:false,hasModel:false});return {revision,policy,geometry:policy.animation==='optional'?sharedTransitions(before,after):null}}
return {view,dispatch,transition,isCurrent:r=>r===revision};
}