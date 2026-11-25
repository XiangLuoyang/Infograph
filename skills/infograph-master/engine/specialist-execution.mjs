import {palette} from '../visual-intelligence/color.mjs';
import {typographyPlan} from '../visual-intelligence/typography.mjs';
import {solveComposition} from '../visual-intelligence/parametric-composition.mjs';
import {renderMaterial} from '../visual-intelligence/material-renderer.mjs';
import {createMotionEngine} from '../visual-intelligence/motion-engine.mjs';
import {renderRepresentation} from '../visual-intelligence/specialist-adapter.mjs';
import {studioOutput} from '../visual-intelligence/studio-output.mjs';
export function executeSpecialist(studio,input){
 const engines={color:palette,typography:typographyPlan,composition:solveComposition,material:renderMaterial,motion:x=>createMotionEngine(x).view(),representation:renderRepresentation};
 if(!Object.hasOwn(engines,studio))throw Error('unknown specialist');
 if(!input||typeof input!=='object'||Array.isArray(input))return studioOutput(studio,{}, {status:'invalid-data',limitations:['object input required']});
 try{const payload=engines[studio](JSON.parse(JSON.stringify(input)));
 const status=payload.status==='unsupported'||payload.requirementMet===false?'unsupported':'generated';
 return studioOutput(studio,payload,{status,limitations:[payload.scope||'computed output; not browser validated',...(payload.warnings||[])]});
 }catch(e){return studioOutput(studio,{}, {status:'invalid-data',limitations:[String(e.message)]})}
}
