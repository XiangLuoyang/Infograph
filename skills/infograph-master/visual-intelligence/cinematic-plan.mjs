export function cinematicPlan({scenes,transitions,reducedMotion=false}={}){
const shots=["extreme-wide","wide","medium","close","extreme-close"],moves=["static","push","pull","pan","tilt","track","orbit","rack-focus"],cuts=["cut","match","cross-cut","dissolve","continuous"];
if(!Array.isArray(scenes)||!scenes.length||!Array.isArray(transitions)||typeof reducedMotion!=='boolean')throw Error('invalid plan');
const map=new Map();for(const s of scenes){if(typeof s.id!=='string'||!s.id.trim()||map.has(s.id)||!shots.includes(s.shot)||typeof s.question!=='string'||!s.question.trim()||!Array.isArray(s.objects)||!s.objects.length||s.objects.some(x=>typeof x!=='string'||!x.trim())||new Set(s.objects).size!==s.objects.length||!s.objects.includes(s.focus))throw Error('invalid scene');map.set(s.id,s)}
if(transitions.length!==scenes.length-1)throw Error('incomplete sequence');
const steps=transitions.map((t,i)=>{if(t.from!==scenes[i].id||t.to!==scenes[i+1].id||!moves.includes(t.move)||!cuts.includes(t.cut)||!Number.isFinite(t.duration)||t.duration<0||t.duration>10000||typeof t.purpose!=='string'||!t.purpose.trim())throw Error('invalid transition');
if(['match','continuous'].includes(t.cut)&&(!map.get(t.from).objects.includes(t.anchor)||!map.get(t.to).objects.includes(t.anchor)))throw Error('shared anchor required');
return {...t,effectiveDuration:reducedMotion?0:t.duration,effectiveMove:reducedMotion?'static':t.move,effectiveCut:reducedMotion?'cut':t.cut}});
return {scenes,steps,reducedMotion,requirements:{manualNavigation:true,essentialFactsStatic:true,stableIdentity:true},scope:'semantic storyboard only; no camera geometry or playback'};
}