import {explorePerspectives} from "./exploration.mjs";
import {enumerateCreativeRoutes,compareConcepts} from "./creative.mjs";
import {compileScene,renderSceneHTML} from "./scene.mjs";
import {renderVmiReferencePreview} from "../../engine/vmi-reference-bridge.mjs";

export function evaluatePacket(packet,objects,ontology){
 if(!packet||!Array.isArray(packet.perspectives)||!Array.isArray(packet.concepts)||!Array.isArray(packet.reviews)||!Array.isArray(packet.styles)||packet.perspectives.length>8||packet.concepts.length>12||packet.reviews.length>12||packet.styles.length>4)throw Error("invalid workbench packet");
 const exploration=explorePerspectives(packet.perspectives,objects,ontology,{shortlist:8,budget:4000});
 const target=packet.perspectives.find(p=>p.id===packet.targetId);
 if(!target)throw Error("select a valid target perspective");
 const view=exploration.views.find(v=>v.perspectiveId===target.id);
 const routes=enumerateCreativeRoutes(target,view,{max:16});
 const candidates=packet.concepts.filter(c=>c.targetId===target.id);
 const critique=candidates.length?compareConcepts(target,candidates,objects,ontology,packet.reviews.filter(r=>candidates.some(c=>c.id===r.conceptId))):null;
 const selected=candidates.find(c=>c.id===packet.selectedConceptId);
 const issues=[];let html=null,plans=[],referencePreviews=[];
 if(!selected)issues.push("No selected authored concept.");
 else if(!critique?.eligibleIds.includes(selected.id))issues.push("Selected concept fails P3 review.");
 else if(!packet.scene||!packet.styles.length)issues.push("Author scene and styles before preview.");
 else try{
  const review=packet.reviews.find(r=>r.conceptId===selected.id);
  plans=packet.styles.map(style=>compileScene({target,concept:selected,review,objects,ontology,style,scene:packet.scene}));
  if(packet.referencePreview!==undefined){
   const opt=packet.referencePreview;
   if(!opt||!["desktop","mobile"].includes(opt.viewport)||!Number.isInteger(opt.styleIndex)||!plans[opt.styleIndex]||Object.keys(opt).some(k=>!["viewport","styleIndex"].includes(k)))throw Error("invalid reference preview options");
   const preview=renderVmiReferencePreview(plans[opt.styleIndex],{viewport:opt.viewport});
   referencePreviews=[{viewport:opt.viewport,styleIndex:opt.styleIndex,report:preview.report,limitations:preview.limitations,releaseAuthorized:false}];
   html=preview.html;
  }else html=renderSceneHTML(plans);
 }catch(e){issues.push(String(e.message??e));plans=[];referencePreviews=[];html=null}
 return {exploration,routes,critique,issues,html,plans,referencePreviews,openDiscoveryRequired:exploration.openDiscoveryRequired,releaseAuthorized:false,scope:"authored JSON inputs; actual bounded engines; no model invocation, autonomous source search or independent approval"};
}
