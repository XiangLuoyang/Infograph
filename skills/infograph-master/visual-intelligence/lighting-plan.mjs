export function lightingPlan({azimuth=315,intensity=.65,softness=.6,ambient=.5,temperature=6500,elevations=[0,1,2,3]}={}){
for(const [k,v] of Object.entries({intensity,softness,ambient}))if(!Number.isFinite(v)||v<0||v>1)throw Error('invalid '+k);
if(!Number.isFinite(azimuth)||azimuth<0||azimuth>=360||!Number.isFinite(temperature)||temperature<2000||temperature>10000)throw Error('invalid light');
if(!Array.isArray(elevations)||!elevations.length||elevations.some((v,i)=>!Number.isFinite(v)||v<0||v>12||(i>0&&v<=elevations[i-1])))throw Error('invalid elevations');
const rad=azimuth*Math.PI/180,round=v=>Math.round(v*1000)/1000;
const levels=elevations.map(e=>{const x=round(-Math.sin(rad)*e*2),y=round(Math.cos(rad)*e*2),blur=round(e*(2+softness*5)),alpha=round(intensity*(1-ambient*.7)*.35),contact=round(alpha*.6);return {elevation:e,x,y,blur,alpha,css:e===0||intensity===0?'none':`0 1px ${round(1+e)}px rgba(0,0,0,${contact}), ${x}px ${y}px ${blur}px rgba(0,0,0,${alpha})`}});
return {azimuth,intensity,softness,ambient,temperature,levels,scope:'CSS shadow heuristic; temperature metadata only; no physical lighting or contrast guarantee'};
}