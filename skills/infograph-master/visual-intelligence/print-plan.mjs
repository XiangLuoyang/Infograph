export function printPlan({paper,process='offset',finish='none',grainScale=1}={},catalog){
const p=catalog.find(x=>x.id===paper);if(!p)throw Error('unknown paper');
if(!['offset','letterpress','engraving','risograph','screen','digital'].includes(process)||!['none','emboss','deboss','foil','spot-gloss'].includes(finish))throw Error('unknown process or finish');
if(!Number.isFinite(grainScale)||grainScale<0||grainScale>2)throw Error('invalid grain scale');
const grain=p.grain*grainScale;
const warnings=['texture is decorative; keep data and text on stable surfaces'];if(paper==='vellum')warnings.push('opaque fallback only; audit actual translucent backdrop separately');if(finish!=='none')warnings.push('finish is metadata, not rendered');if(process!=='offset')warnings.push('process is metadata, not simulated');
return {paper,process,finish,grain,css:{backgroundColor:p.background,color:p.ink,backgroundImage:grain===0?'none':`radial-gradient(circle at 1px 1px, rgba(60,45,30,${grain*.15}) 0.5px, transparent 0.8px)`,backgroundSize:'5px 7px'},warnings,scope:'decorative CSS paper approximation; no physical ink or print simulation'};
}