// Task-led art direction production. Existing presets are the source, not a style guarantee.
export function compileArtDirections(input,presets,styles){
 const ok=(b,m)=>{if(!b)throw Error(m)},txt=x=>typeof x==='string'&&x.trim().length>0,hex=x=>typeof x==='string'&&/^#[0-9a-f]{6}$/i.test(x);
 const purposes=['explain','report','monitor','explore','lookup'];
 const families={
  editorial:{preset:'editorial',style:'editorial-paper',heading:'serif',body:'sans',frame:'rule',spacing:24,scale:1.3,material:'paper',fit:['report','explain'],tradeoff:'Editorial emphasis and quiet surfaces; less dense for monitoring.'},
  technical:{preset:'industrial',style:'industrial-graphite',heading:'sans',body:'sans',frame:'instrument',spacing:16,scale:1.2,material:'metal',fit:['monitor','explore','explain'],tradeoff:'Instrument-like precision and dark scene coherence; dark surfaces need actual contrast review.'},
  analytical:{preset:'scientific',style:'scientific-neutral',heading:'sans',body:'sans',frame:'open',spacing:16,scale:1.2,material:'matte',fit:purposes,tradeoff:'Neutral evidence and minimal ornament; less expressive for storytelling.'},
  architectural:{preset:'architectural',style:'architectural-stone',heading:'sans',body:'sans',frame:'inset',spacing:24,scale:1.25,material:'clay',fit:['explore','explain','report'],tradeoff:'Spatial grouping and subtle depth; no automatic spatial representation.'},
  swiss:{preset:'swiss',style:'swiss',heading:'sans',body:'sans',frame:'rule',spacing:24,scale:1.4,material:'matte',fit:['report','explain','lookup'],tradeoff:'Strong typographic hierarchy and rules; accent must not imply status.'}
 };
 ok(purposes.includes(input?.purpose)&&txt(input.theme)&&txt(input.readerTask)&&txt(input.evidenceRef),'invalid art direction brief');
 ok(['normal','dense','presentation'].includes(input.density),'density required');
 const requested=input.families??(input.purpose==='monitor'?['technical','analytical','editorial']:input.purpose==='explore'?['architectural','analytical','technical']:['editorial','analytical','swiss']);
 ok(Array.isArray(requested)&&requested.length>=3&&requested.length<=5&&new Set(requested).size===requested.length&&requested.every(x=>Object.hasOwn(families,x))&&requested.includes('analytical'),'compare at least two directions and analytical baseline');
 const lum=s=>{const rgb=s.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]};
 const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 const mix=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
 const candidates=requested.map(id=>{
  const f=families[id],preset=presets.find(x=>x.id===f.preset),s=styles.find(x=>x.id===f.style);
  ok(preset&&s&&['canvas','surface','text','accent'].every(k=>hex(s[k])),'missing or invalid existing direction/style');
  const readable=(target,bgs,min)=>{for(let i=0;i<=20;i++){const c=mix(target,s.text,i/20);if(bgs.every(bg=>ratio(c,bg)>=min))return c}throw Error('no readable color')};
  const bgs=[s.canvas,s.surface],text=readable(s.text,bgs,4.5),muted=readable(mix(s.text,s.surface,.4),bgs,4.5),accent=readable(s.accent,bgs,4.5);
  const positive=readable('#287855',bgs,4.5),negative=readable('#B04438',bgs,4.5),warning=readable('#916000',bgs,4.5);
  const line=mix(s.text,s.surface,.7),controlBorder=readable(s.accent,bgs,3);
  const base=input.density==='presentation'?18:input.density==='dense'?14:16;
  const spacing=Math.max(8,f.spacing+(input.density==='dense'?-8:input.density==='presentation'?8:0));
  const onAccent=ratio('#FFFFFF',accent)>=ratio('#111111',accent)?'#FFFFFF':'#111111';
  const palette={canvas:s.canvas,surface:s.surface,text,muted,accent,positive,negative,warning,line,controlBorder,onAccent};
  const contrast=[...bgs.flatMap((bg,i)=>['text','muted','accent','positive','negative','warning','controlBorder'].map(role=>({role,background:i?'surface':'canvas',ratio:ratio(palette[role],bg),minimum:role==='controlBorder'?3:4.5}))),{role:'onAccent',background:'accent',ratio:ratio(onAccent,accent),minimum:4.5}];
  ok(contrast.every(x=>x.ratio>=x.minimum),'opaque token contrast below threshold');
  return {id,presetId:preset.id,styleId:s.id,purposeFit:f.fit.includes(input.purpose),tradeoff:f.tradeoff,theme:input.theme,readerTask:input.readerTask,palette,typography:{heading:f.heading,body:f.body,bodyPx:base,notePx:Math.max(12,base-2),headingPx:Math.round(base*f.scale**2),displayPx:Math.round(base*f.scale**4),metricPx:Math.round(base*f.scale**3),lineHeight:1.5},geometry:{spacing,radius:f.frame==='inset'?8:f.frame==='instrument'?4:0,frame:f.frame,lineWidth:f.frame==='instrument'?1.5:1},material:{family:f.material,essentialSurface:'opaque',sceneTreatment:f.material==='metal'?'directional tonal depth':f.material==='clay'?'soft relief':f.material==='paper'?'quiet matte surface':'flat neutral surface'},chart:{mark:accent,axis:muted,grid:line,negative,positive,warning,semanticPolicy:'retain relation-driven chart family; explicit labels for status; do not color quantitative data by decorative palette'},contrast};
 });
 return {version:1,purpose:input.purpose,theme:input.theme,readerTask:input.readerTask,evidenceRef:input.evidenceRef,density:input.density,candidates,scope:'bounded authored art-direction families; opaque token contrast only, not rendered visual approval',releaseAuthorized:false};
}

export function selectArtDirection(plan,id,reason){
 if(typeof reason!=='string'||!reason.trim())throw Error('explicit selection rationale required');
 const selected=plan.candidates.find(c=>c.id===id);
 if(!selected)throw Error('unknown direction');
 return {...selected,selectionReason:reason,rejected:plan.candidates.filter(c=>c.id!==id).map(c=>({id:c.id,tradeoff:c.tradeoff})),evidenceRef:plan.evidenceRef,releaseAuthorized:false};
}
export function artDirectionCSS(direction){
 const d=direction,p=d.palette,t=d.typography,g=d.geometry;
 const q='[data-ig-art="'+d.id+'"]';
 const fonts={serif:'Georgia,"Noto Serif CJK SC","Songti SC",serif',sans:'system-ui,"Noto Sans CJK SC","Microsoft YaHei",sans-serif'};
 const variables=Object.entries(p).map(([k,v])=>'--ig-'+k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())+':'+v).join(';');
 const frame=g.frame==='rule'?'border-top:2px solid var(--ig-accent);border-radius:0':g.frame==='instrument'?'border:1px solid var(--ig-line);border-radius:4px':g.frame==='inset'?'border:1px solid var(--ig-line);border-radius:8px;box-shadow:0 3px 12px #0000000c':'border-bottom:1px solid var(--ig-line);border-radius:0';
 return [
 q+'{'+variables+';--ig-space:'+g.spacing+'px;--ig-radius:'+g.radius+'px;--ig-line-width:'+g.lineWidth+'px;background:var(--ig-canvas);color:var(--ig-text);font:'+t.bodyPx+'px/'+t.lineHeight+' '+fonts[t.body]+';color-scheme:'+(d.id==='technical'?'dark':'light')+'}',
 q+' .ig-art-title{font-family:'+fonts[t.heading]+';font-size:clamp('+t.headingPx+'px,3vw,'+t.displayPx+'px);line-height:1.17;font-weight:'+(t.heading==='serif'?500:700)+';margin:0;overflow-wrap:anywhere}',
 q+' .ig-art-heading{font-family:'+fonts[t.heading]+';font-size:'+t.headingPx+'px;line-height:1.25;margin:0}',
 q+' .ig-art-note{font-size:'+t.notePx+'px;color:var(--ig-muted);line-height:1.5}',
 q+' .ig-art-metric{font-size:'+t.metricPx+'px;font-weight:650;line-height:1.15;font-variant-numeric:tabular-nums lining-nums;color:var(--ig-accent)}',
 q+' .ig-art-panel{background:var(--ig-surface);color:var(--ig-text);padding:var(--ig-space);min-width:0;'+frame+'}',
 q+' .ig-art-scene{background:var(--ig-surface);color:var(--ig-text);border:1px solid var(--ig-line);border-radius:var(--ig-radius)}',
 q+' .ig-art-chart{color:var(--ig-text);--ig-mark:var(--ig-accent);--ig-axis:var(--ig-muted);--ig-grid:var(--ig-line)}',
 q+' .ig-art-control{font:inherit;background:var(--ig-surface);color:var(--ig-text);border:1px solid var(--ig-control-border);border-radius:var(--ig-radius);padding:8px 12px}',
 q+' .ig-art-control[aria-pressed="true"],'+q+' .ig-art-primary{background:var(--ig-accent);color:var(--ig-on-accent)}',
 q+' .ig-art-control:focus-visible{outline:2px solid var(--ig-accent);outline-offset:3px}',
 ...['positive','negative','warning'].map(k=>q+' [data-ig-status="'+k+'"]{color:var(--ig-'+k+')}'),
 '@media(prefers-reduced-motion:reduce){'+q+' *{scroll-behavior:auto!important;animation-duration:0.01ms!important;transition-duration:0.01ms!important}}'
 ].join('\n')+'\n';
}
export function artDirectionPreview(plan){
 const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const css=plan.candidates.map(artDirectionCSS).join('\n');
 const cards=plan.candidates.map(d=>{
 const p=d.palette;
 return '<article data-ig-art="'+d.id+'"><div class="specimen"><div class="ig-art-note">DIRECTION / '+esc(d.id.toUpperCase())+' · SYNTHETIC SPECIMEN</div><h2 class="ig-art-title">Capacity is the constraint</h2><p class="ig-art-note">Illustrative data only · same content across directions</p><div class="scene-grid"><div class="ig-art-panel"><div class="ig-art-note">Demand vs. capacity</div><div class="ig-art-metric">120 / 100</div><svg class="ig-art-chart" viewBox="0 0 260 110" role="img" aria-label="Demand 120, capacity 100"><g font-size="12" fill="currentColor"><text x="5" y="24">Demand</text><text x="5" y="70">Capacity</text><rect x="5" y="31" width="200" height="12" fill="var(--ig-mark)"/><rect x="5" y="77" width="166.667" height="12" fill="var(--ig-axis)"/><text x="215" y="42">120</text><text x="181" y="88">100</text></g></svg></div><div class="ig-art-panel"><h3 class="ig-art-heading">20 units</h3><p data-ig-status="warning">Shortfall / warning</p><p class="ig-art-note">Prioritize bottleneck resolution before adding demand.</p><span class="ig-art-control ig-art-primary">Selected state</span></div></div><div class="swatches">'+['canvas','surface','text','accent','positive','negative','warning'].map(k=>'<div><i style="background:'+p[k]+'"></i><small>'+k+'</small></div>').join('')+'</div><p class="ig-art-note">'+esc(d.tradeoff)+'</p></div></article>';
 }).join('');
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Infograph · Art direction comparison</title><style>*{box-sizing:border-box}body{margin:0;background:#e6e6e1;color:#202a28;font:16px/1.5 system-ui,sans-serif}main{max-width:1500px;margin:auto;padding:24px}h1{font-size:30px;margin:0}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:20px}article{min-width:0;border:1px solid #7775}.specimen{padding:var(--ig-space)}.scene-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--ig-space);margin:20px 0}.scene-grid svg{display:block;width:100%;height:auto}.swatches{display:flex;flex-wrap:wrap;gap:8px}.swatches div{min-width:35px}.swatches i{display:block;height:18px;border:1px solid #8886}.swatches small{font-size:11px}.ig-art-primary{display:inline-block}'+css+'</style><main><h1>Art direction comparison</h1><p>'+esc(plan.theme)+' · '+esc(plan.readerTask)+' · '+esc(plan.density)+'</p><p>Same synthetic content and visual encoding; compare actual token application. Not a finished dashboard, reader study or aesthetic ranking.</p><section>'+cards+'</section></main></html>';
}
