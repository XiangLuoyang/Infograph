import {renderMaterial} from '../visual-intelligence/material-renderer.mjs';
import {lightingPlan} from '../visual-intelligence/lighting-plan.mjs';
export function previewReferenceSurfaces(plan,light={}){
 const lighting=lightingPlan(light);
 return {lighting,objects:plan.slots.filter(s=>s.material).map(s=>{
 const source=s.material,complex=['webgl','raster'].includes(s.preferred),preview=renderMaterial({material:source.family,detail:complex?'3d':'surface',backend:complex?'webgl':'css',strength:1-source.roughness,essential:s.essential});
 return {id:s.id,preview,source,requirementMet:!complex&&source.opacity===1&&source.metalness===0&&preview.requirementMet,unmet:[...(complex?['physical geometry/lighting not rendered']:[]),...(source.opacity!==1?['transmission not implemented']:[]),...(source.metalness!==0?['physical metalness not implemented']:[])],scope:'flat approximation only; CSS shadow heuristic, not PBR'};
 }),renderedScene:false};
}
