import {createHash} from 'node:crypto';
const check=(v,m)=>{if(!v)throw Error(m)};
const finite=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
export function normalizeLighting3D(input={}){
 check(input&&typeof input==='object'&&!Array.isArray(input),'invalid 3D lighting');
 check(Object.keys(input).every(k=>['environment','shadow','keyElevation'].includes(k)),'unknown 3D lighting field');
 const keyElevation=input.keyElevation??38.659808254;check(finite(keyElevation,20,85),'invalid key elevation');
 let environment=null;
 if(input.environment!==undefined&&input.environment!==null){
  const e=input.environment, power=x=>Number.isInteger(x)&&x>=4&&x<=256&&(x&(x-1))===0;
  check(e&&power(e.width)&&power(e.height)&&e.width===2*e.height,'environment requires power-of-two 2:1 dimensions');
  check(e.colorSpace==='srgb'&&e.permission==='cleared'&&typeof e.source==='string'&&e.source.trim(),'environment provenance missing');
  check(Array.isArray(e.rgb)&&e.rgb.length===e.width*e.height*3&&e.rgb.every(x=>Number.isInteger(x)&&x>=0&&x<=255),'invalid environment RGB8');
  check(createHash('sha256').update(Buffer.from(e.rgb)).digest('hex')===e.sha256,'environment hash mismatch');
  check(finite(e.strength??1,0,3),'invalid environment strength');
  environment={width:e.width,height:e.height,rgb:e.rgb.slice(),colorSpace:e.colorSpace,permission:e.permission,source:e.source,sha256:e.sha256,strength:e.strength??1};
 }
 let shadow=null;
 if(input.shadow!==undefined&&input.shadow!==null&&input.shadow!==false){
  const s=input.shadow;check(s&&typeof s==='object'&&!Array.isArray(s),'invalid planar shadow');
  check(Object.keys(s).every(k=>['opacity','groundOffset'].includes(k)),'unknown shadow field');
  check(finite(s.opacity??.46,0,1)&&finite(s.groundOffset??.025,0,.25),'invalid shadow settings');
  shadow={opacity:s.opacity??.46,groundOffset:s.groundOffset??.025};
 }
 return {keyElevation,environment,shadow};
}
export function directionalKey(azimuth,elevation){
 const a=azimuth*Math.PI/180,e=elevation*Math.PI/180;
 return [Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)];
}
export function projectShadowPoint(p,groundY,key){
 check(Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)&&Number.isFinite(groundY)&&groundY<=p[1]&&Array.isArray(key)&&key.length===3&&key.every(Number.isFinite)&&key[1]>0,'invalid planar projection');
 const t=(p[1]-groundY)/key[1];return [p[0]-t*key[0],groundY,p[2]-t*key[2]];
}
// Authored neutral LDR studio map, not captured radiance or HDRI. Texture y=0 is south pole.
export function studioEnvironment({variant='warm',strength=1}={}){
 check(['warm','cool'].includes(variant),'unknown studio environment');
 const width=64,height=32,rgb=[];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const u=(x+.5)/width,v=(y+.5)/height,wrap=(a,b)=>Math.min(Math.abs(a-b),1-Math.abs(a-b));
  const panel=(cx,cy,sx,sy)=>Math.exp(-((wrap(u,cx)/sx)**6+((v-cy)/sy)**6));
  const a=panel(.22,.67,.12,.18),b=panel(.76,.57,.055,.24),c=panel(.52,.87,.19,.055);
  const base=18+18*Math.max(0,Math.sin(v*Math.PI)),colors=variant==='warm'?[[240,196,132],[115,185,245],[200,220,235]]:[[115,210,250],[230,155,125],[180,220,255]];
  for(let k=0;k<3;k++)rgb.push(Math.round(Math.min(255,base+a*colors[0][k]+b*colors[1][k]+c*colors[2][k])));
 }
 return {width,height,rgb,colorSpace:'srgb',permission:'cleared',source:'Procedural neutral studio environment / '+variant,sha256:createHash('sha256').update(Buffer.from(rgb)).digest('hex'),strength};
}
