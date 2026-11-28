// Shared deterministic checks used by the canonical scene compiler and authoring diagnostics.
export const sceneDimensions=Object.freeze({desktop:Object.freeze([800,440]),mobile:Object.freeze([360,620])});
export const colorRoles=Object.freeze(['background','surface','ink','muted','accent','warning','line','metal','highlight']);
const txt=x=>typeof x==='string'&&x.trim().length>0;
export const validHex=x=>typeof x==='string'&&/^#[0-9a-f]{6}$/i.test(x);
const luminance=x=>{const a=x.slice(1).match(/../g).map(s=>parseInt(s,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2]};
export function contrastRatio(a,b){const l=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (l[0]+.05)/(l[1]+.05)}
export function styleIssues(style,concept){
 const issues=[],add=(code,path,message,details={})=>issues.push({code,path,message,...details});
 const check=(ok,path,message,details={})=>{if(!ok)add('style.provenance',path,message,details)};
 check(style?.baselineRef===concept?.designDNARef&&txt(concept?.designDNARef),'baselineRef','style provenance required: baselineRef must match selected concept Design DNA');
 check(typeof style?.id==='string'&&/^[\p{L}\p{N}_-]{1,40}$/u.test(style.id),'id','style provenance required: id must be 1–40 letters, digits, underscores or hyphens');
 for(const k of ['rationale','sampleRef'])check(txt(style?.[k]),k,'style provenance required: '+k+' must be authored');
 check(['inherit','variant'].includes(style?.mode),'mode','style provenance required: unsupported mode',{allowed:['inherit','variant']});
 for(const [k,allowed] of Object.entries({material:['editorial','industrial'],font:['sans','serif','mono'],depth:['none','soft']}))
  if(!allowed.includes(style?.[k]))add('style.enum',k,'unsupported style token: '+k,{allowed,actual:style?.[k]??null});
 for(const [k,max] of [['radius',24],['motionMs',400]])if(!Number.isInteger(style?.[k])||style[k]<0||style[k]>max)add('style.range',k,'unsupported style token: '+k,{min:0,max,integer:true,actual:style?.[k]??null});
 const colors=style?.colors;
 if(!colors||typeof colors!=='object'||Array.isArray(colors)||Object.keys(colors).length!==colorRoles.length||Object.keys(colors).some(k=>!colorRoles.includes(k)))add('style.palette','colors','unexpected color token',{allowed:colorRoles});
 for(const k of colorRoles)if(!validHex(colors?.[k]))add('style.hex','colors.'+k,'invalid color '+k,{actual:colors?.[k]??null});
 const pair=(fg,bg,min,kind)=>{if(!validHex(colors?.[fg])||!validHex(colors?.[bg]))return;const actual=contrastRatio(colors[fg],colors[bg]);if(actual<min)add('style.contrast','colors.'+fg,kind+' contrast '+fg+(kind==='text'?'/'+bg:''),{foreground:fg,background:bg,minimum:min,actual})};
 for(const fg of ['ink','muted'])for(const bg of ['background','surface'])pair(fg,bg,4.5,'text');
 for(const fg of ['accent','warning','line'])pair(fg,'surface',3,'nontext');
 return issues;
}
export function validSceneBox(b,d){return Array.isArray(b)&&b.length===4&&b.every((v,i)=>typeof v==='number'&&Number.isFinite(v)&&v>=(i>=2?36:0)&&v<=d[i%2])&&b[0]+b[2]<=d[0]&&b[1]+b[3]<=d[1]-28}
