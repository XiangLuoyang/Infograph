import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
const hex=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const fields=['caseId','browser','browserVersion','platform','fontFingerprint','fixtureHash','stateHash','viewportWidth','viewportHeight','deviceScaleFactor','reducedMotion','captureMode'];
export function validateCapture(c){
 for(const k of fields)if(c[k]===undefined||c[k]===null||c[k]==='')throw Error('missing capture field: '+k);
 for(const k of ['fontFingerprint','fixtureHash','stateHash'])if(!hex(c[k]))throw Error('invalid hash: '+k);
 for(const k of ['viewportWidth','viewportHeight','deviceScaleFactor'])if(!Number.isFinite(c[k])||c[k]<=0)throw Error('invalid dimension: '+k);
 if(!['reduce','no-preference'].includes(c.reducedMotion)||!['http','offline'].includes(c.captureMode))throw Error('invalid capture mode');
 if(typeof c.revision!=='string'||!/^[a-f0-9]{40}$/.test(c.revision))throw Error('invalid source revision');
 return c;
}
export function compareCapture(a,b){validateCapture(a);validateCapture(b);const differences=fields.filter(k=>a[k]!==b[k]);return {status:differences.length?'incompatible':'comparable',differences}}
export function registerBaseline(registry,capture,png,approval){
 validateCapture(capture);
 if(!approval||typeof approval.reviewer!=='string'||!approval.reviewer.trim()||typeof approval.reason!=='string'||!approval.reason.trim()||!Number.isFinite(Date.parse(approval.timestamp)))throw Error('explicit approval metadata required');
 if(!(png instanceof Uint8Array)||png.length<8||Buffer.from(png.subarray(0,8)).toString('hex')!=='89504e470d0a1a0a')throw Error('invalid PNG signature');
 const screenshotHash=hash(png),previous=registry.entries.filter(e=>e.capture.caseId===capture.caseId&&compareCapture(e.capture,capture).status==='comparable').at(-1);
 const entry={capture:{...capture},screenshotHash,approval:{...approval},supersedes:previous?.id??null};
 entry.id=hash(JSON.stringify(entry));
 if(registry.entries.some(e=>e.id===entry.id))throw Error('duplicate baseline');
 return {version:1,entries:[...registry.entries,entry]};
}
export function verifyBaseline(entry,png){if(hash(png)!==entry.screenshotHash)throw Error('baseline screenshot hash mismatch');return true}
