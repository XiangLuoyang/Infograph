import {createHash} from 'node:crypto';
import {buildIntentGraph,diffArtifactIR} from './artifact-semantic-ir.mjs';
import {proposeIntentCandidates,compareRuntime} from './reconstruction-runtime-core.mjs';
import {auditReconstruction} from './reconstruction.mjs';
import {mineOpportunities,auditExploration} from './design-opportunity.mjs';

const str=x=>typeof x==='string'&&x.trim().length>0;
const canon=v=>Array.isArray(v)?v.map(canon):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])):v;
export const fingerprint=v=>'sha256:'+createHash('sha256').update(JSON.stringify(canon(v))).digest('hex');
const checkIR=ir=>{
 if(ir?.version!==1||!/^sha256:[0-9a-f]{64}$/.test(ir.sourceRef||'')||!Array.isArray(ir.nodes)||!['partial','bounded-snapshot'].includes(ir.coverage?.completeness))throw Error('invalid source IR');
 const seen=new Set();
 for(const n of ir.nodes){if(!str(n?.id)||seen.has(n.id)||!str(n.ref)||!n.ref.startsWith(ir.sourceRef+'#'))throw Error('invalid observation reference');seen.add(n.id)}
 return ir;
};
const checkRuntime=(runtime,ir)=>{
 if(runtime==null)return null;
 if(runtime.version!==1||runtime.sourceRef!==ir.sourceRef||!Array.isArray(runtime.states))throw Error('runtime/source mismatch');
 const ids=new Set();
 for(const s of runtime.states){if(!str(s.id)||ids.has(s.id)||!Array.isArray(s.probes))throw Error('invalid runtime state');ids.add(s.id);const probes=new Set();for(const p of s.probes){if(!str(p.id)||probes.has(p.id)||!str(p.ref)||p.ref!==ir.sourceRef+'#'+s.id+'/'+p.id)throw Error('invalid runtime probe');probes.add(p.id)}}
 if(!ids.has('baseline'))throw Error('runtime baseline missing');
 return runtime;
};
export function prepareReconstruction(ir,runtime=null){
 checkIR(ir);checkRuntime(runtime,ir);
 const hypotheses=proposeIntentCandidates(ir,runtime);
 return {version:1,sourceRef:ir.sourceRef,inputFingerprint:fingerprint({ir,runtime}),ir,runtime,hypotheses,
  next:'Author the design-independent brief, reconstruction packet, intent links and concrete exploration. Do not build yet.',
  limitations:['Static extraction is bounded; actual formulas, hidden data, visual quality and intent are not certified.',...(runtime?[]:['Runtime not collected; disclose behavior limits.'])],
  releaseAuthorized:false};
}
export function planReconstruction(prepared,authored){
 if(prepared?.version!==1||!authored?.packet||!authored?.exploration||!Array.isArray(authored.intentLinks))throw Error('missing authored plan');
 const {ir,runtime}=prepared;checkIR(ir);checkRuntime(runtime,ir);
 if(prepared.sourceRef!==ir.sourceRef||prepared.inputFingerprint!==fingerprint({ir,runtime}))throw Error('prepared evidence changed');
 const p=authored.packet,e=authored.exploration,errors=[];
 if(p.sourceRef!==ir.sourceRef)errors.push('packet/source mismatch');
 if(authored.inputFingerprint!==prepared.inputFingerprint)errors.push('authored plan/evidence mismatch');
 if(!str(authored.brief?.audience)||!str(authored.brief?.readerTask)||!str(authored.brief?.decision)||!str(authored.brief?.constraints)||!str(authored.brief?.unknowns))errors.push('design-independent brief incomplete');
 const graph=buildIntentGraph(ir,{intents:p.intents||[],links:authored.intentLinks});
 errors.push(...graph.errors.map(x=>'intent: '+x));
 const inventory=new Map(ir.nodes.map(n=>[n.id,n]));
 const runtimeRefs=new Set((runtime?.states||[]).filter(s=>s.status==='observed').flatMap(s=>s.probes.filter(q=>q.status==='observed'&&!q.partial).map(q=>q.ref)));
 const bindings=Array.isArray(authored.assetEvidence)?authored.assetEvidence:[],bound=new Set();
 for(const b of bindings){const a=p.assets?.find(x=>x.id===b.assetId);if(!a||bound.has(b.assetId)||!Array.isArray(b.observationIds)||!Array.isArray(b.runtimeRefs)||!b.observationIds.every(id=>inventory.has(id)&&!inventory.get(id).truncated)||!b.runtimeRefs.every(r=>runtimeRefs.has(r))||(!b.observationIds.length&&!b.runtimeRefs.length&&!str(b.manualEvidenceRef))){errors.push('invalid asset evidence: '+b.assetId);continue}bound.add(b.assetId)}
 for(const a of p.assets||[])if(a.essential&&!bound.has(a.id))errors.push('essential asset without evidence binding: '+a.id);
 const r=auditReconstruction(p);errors.push(...r.errors.map(x=>'contract: '+x));
 const o=mineOpportunities(p);errors.push(...o.errors.map(x=>'opportunity: '+x));
 const x=auditExploration(e,o.opportunities);errors.push(...x.errors.map(v=>'exploration: '+v));
 const selected=e.options?.find(q=>q.id===e.selected);
 if(selected?.mode!==p.selected)errors.push('selected design conflicts across stages');
 const packetRoutes=new Set((p.routes||[]).map(q=>q.ref));
 for(const path of selected?.routes||[])if(!packetRoutes.has(path))errors.push('selected route missing in reconstruction packet: '+path);
 const eligibility=errors.length===0;
 return {version:1,sourceRef:ir.sourceRef,inputFingerprint:prepared.inputFingerprint,planFingerprint:fingerprint(authored),selected:p.selected,buildEligible:eligibility&&p.scope!=='critique',critiqueReady:eligibility&&p.scope==='critique',errors,opportunities:o.opportunities,requiredReferences:[...packetRoutes],next:!eligibility?'Repair plan and evidence; do not claim build eligibility.':p.scope==='critique'?'Return critique only; do not edit.':'Load selected references; build actual revised artifact; then review matched evidence.',releaseAuthorized:false};
}
export function reviewReconstruction(prepared,authored,after,review){
 const plan=planReconstruction(prepared,authored);
 if(!plan.buildEligible)throw Error('no eligible build plan');
 checkIR(after.ir);checkRuntime(after.runtime??null,after.ir);
 if(after.ir.sourceRef===prepared.sourceRef)throw Error('revised bytes equal source; report retention/critique rather than reconstructed artifact');
 const errors=[],unverified=[];
 if(review?.planFingerprint!==plan.planFingerprint||review?.outputRef!==after.ir.sourceRef)errors.push('review binding mismatch');
 const p=authored.packet;
 const diff=diffArtifactIR(prepared.ir,after.ir,review?.aliases||[]);
 errors.push(...diff.errors);
 const changed=diff.changes.filter(c=>c.status!=='observed-equal');
 const decisions=Array.isArray(review?.dispositions)?review.dispositions:[];
 // Bind each disposition to the exact observed before/after row. Unmatched layout items can be intentional.
 for(const c of changed){const matches=decisions.filter(d=>(d.before??null)===(c.before??null)&&(d.after??null)===(c.after??null)&&d.status===c.status);
 if(matches.length!==1||!['verified-equivalent','intentional-nonessential','unresolved'].includes(matches[0]?.decision)||!str(matches[0]?.ref)||!str(matches[0]?.reason)||matches[0]?.decision==='unresolved')unverified.push('static change needs review: '+(c.before||c.after||c.key))}
 if(prepared.ir.coverage.completeness==='partial'||after.ir.coverage.completeness==='partial')unverified.push('static inventory partial');
 let runtimeDiff=null;
 const runtimeRequired=p.assets.some(a=>a.essential&&a.layer==='interaction');
 if(prepared.runtime&&after.runtime&&Array.isArray(review?.requiredProbes)&&review.requiredProbes.length){runtimeDiff=compareRuntime(prepared.runtime,after.runtime,review.requiredProbes);if(runtimeDiff.status!=='observed-match')unverified.push('runtime comparison not matched')}
 else if(runtimeRequired)unverified.push('essential interaction runtime not compared');
 const contract=auditReconstruction({...p,review:review?.records||[]});
 unverified.push(...contract.reviewErrors);
 if(p.inspection!=='source-and-render')unverified.push('original render inspection incomplete');
 return {version:1,sourceRef:prepared.sourceRef,outputRef:after.ir.sourceRef,planFingerprint:plan.planFingerprint,staticDiff:diff,runtimeDiff,errors,unverified,reviewComplete:errors.length===0&&unverified.length===0,scope:'declared traceability plus bounded observation comparison; never independent proof of business intent, aesthetic improvement or full parity',releaseAuthorized:false};
}
