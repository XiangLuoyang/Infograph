import {compileDesign} from './design-v2.mjs';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderDesign(d,c,data){
 const p=compileDesign(d,c),s=c['styles.json'].find(x=>x.id===p.visual.style);
 const hex=v=>{if(!/^#[0-9a-f]{6}$/i.test(v))throw Error('invalid color token');return v};
 const evidence=new Map(p.evidence.map(e=>[e.id,e]));
 const seen=new Set();
 const sections=p.scenes.map(scene=>'<section class="scene"><h2>'+esc(scene.question)+'</h2><div class="grid">'+scene.blocks.map(b=>{
 if(!Object.hasOwn(data,b.id))throw Error('missing block data '+b.id);seen.add(b.id);const v=data[b.id];if(!v||!Array.isArray(v.rows)||!v.rows.length||typeof v.unit!=='string'||!v.unit.trim())throw Error('rows and unit required '+b.id);
 if(b.task!=='ranking'&&b.task!=='lookup')throw Error('unsupported renderer '+b.task);
 if(v.rows.some(r=>typeof r.label!=='string'||!Number.isFinite(r.value)))throw Error('invalid row '+b.id);
 if(b.task==='ranking'&&v.rows.some(r=>r.value<0))throw Error('ranking renderer requires nonnegative values');
 const max=Math.max(1,...v.rows.map(r=>r.value));
 const rows=v.rows.map(r=>'<tr><th scope="row">'+esc(r.label)+'</th><td>'+esc(r.value)+'</td></tr>').join('');
 const bars=b.task==='ranking'?'<div aria-hidden="true">'+v.rows.map(r=>'<div class="barrow"><span>'+esc(r.label)+'</span><div class="track"><div class="bar" style="width:'+100*r.value/max+'%"></div></div><span>'+esc(r.value)+'</span></div>').join('')+'</div>':'';
 const sources=b.evidenceIds.map(id=>{const e=evidence.get(id);return esc(e.source)+' · '+esc(e.period)+' · '+esc(e.unit)}).join('; ');
 if(b.evidenceIds.some(id=>evidence.get(id).unit!==v.unit))throw Error('unit mismatch '+b.id);
 return '<article data-ig-block="'+esc(b.id)+'" style="--span:'+b.span.desktop+'"><h3>'+esc(v.title||b.role)+'</h3><p>Unit: '+esc(v.unit)+'</p>'+bars+'<div class="scroll"><table><thead><tr><th>Category</th><th>Value</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="source">'+sources+'</p></article>'
 }).join('')+'</div></section>').join('');
 if(Object.keys(data).some(k=>!seen.has(k)))throw Error('unused block data');
 if(p.interaction.transitions.length||p.spatial.objects.length)throw Error('runtime does not implement transitions or spatial objects');
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(d.brief.purpose)+'</title><style>:root{--canvas:'+hex(s.canvas)+';--surface:'+hex(s.surface)+';--text:'+hex(s.text)+';--accent:'+hex(s.accent)+'}*{box-sizing:border-box}body{margin:0;background:var(--canvas);color:var(--text);font-family:'+({serif:'Georgia,serif',sans:'system-ui,sans-serif',mono:'monospace'}[p.visual.type])+'}main{max-width:1200px;margin:auto;padding:clamp(16px,4vw,48px)}h1{font-size:clamp(24px,4vw,44px)}.grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px}article{grid-column:span var(--span);min-width:0;background:var(--surface);padding:16px;border:1px solid #8885}.barrow{display:grid;grid-template-columns:minmax(70px,1fr) 2fr auto;gap:8px;align-items:center;margin:8px 0}.track{background:#8882;height:14px}.bar{background:var(--accent);height:100%}table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:8px;border-bottom:1px solid #8885}td{text-align:right}.scroll{overflow:auto}.source{font-size:.875rem} @media(max-width:700px){article{grid-column:span 12}}</style><main><p>Infograph runtime prototype · material recipe not applied</p><h1>'+esc(d.narrative.thesis)+'</h1>'+sections+'<p>Validation status: not certified. Source references are supplied metadata, not independently verified.</p></main></html>';
}
