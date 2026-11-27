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
