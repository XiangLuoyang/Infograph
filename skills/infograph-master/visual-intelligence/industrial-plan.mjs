export function industrialPlan({preset,edge='chamfer',assembly='inset',radius=4,gap=8,texture=.2}={},catalog){
const p=catalog.find(x=>x.id===preset);if(!p)throw Error('unknown preset');
if(!['square','chamfer','rounded'].includes(edge)||!['flush','inset','stacked','seamed'].includes(assembly))throw Error('unknown geometry');
if(!Number.isFinite(radius)||radius<0||radius>24||!Number.isFinite(gap)||gap<0||gap>32||!Number.isFinite(texture)||texture<0||texture>1)throw Error('invalid dimensions');
const warnings=['decorative surface only; verify text contrast and focus independently'];
if(p.substance==='glass')warnings.push('opaque fallback; no transmission or refraction');
if(edge==='chamfer')warnings.push('chamfer metadata only; no clipping of content');
const image=p.finish==='brushed'?`repeating-linear-gradient(0deg, transparent 0px 2px, rgba(30,45,50,${texture*.12}) 2px 3px)`:p.finish==='blasted'?`radial-gradient(circle at 1px 1px, rgba(30,45,50,${texture*.15}) .5px, transparent .8px)`:'none';
return {preset,edge,assembly,css:{backgroundColor:p.bg,color:p.ink,backgroundImage:image,backgroundSize:p.finish==='blasted'?'4px 5px':'auto',borderRadius:(edge==='rounded'?radius:0)+'px',gap:gap+'px',border:'1px solid rgba(70,85,90,.3)',boxShadow:assembly==='inset'?'inset 0 1px 3px rgba(0,0,0,.12)':assembly==='stacked'?'0 3px 6px rgba(0,0,0,.15)':'none'},warnings,scope:'opaque CSS approximation; no physical reflectance, chamfer geometry or calibrated machining'};}