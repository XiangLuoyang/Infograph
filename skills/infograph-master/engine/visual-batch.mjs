import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {registerBaseline,compareCapture,validateCapture} from './visual-baseline.mjs';
import {compareScreenshots} from './visual-compare.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const write=async(p,v)=>writeFile(p,JSON.stringify(v,null,2),{flag:'wx'});
async function candidates(dir){
 const rows=[];
 for(const e of await readdir(dir,{withFileTypes:true})){
 const p=join(dir,e.name);
 if(e.isDirectory())rows.push(...await candidates(p));
 else if(e.name.endsWith('-candidate.png.json')){
 const capture=validateCapture(await json(p)),png=await readFile(p.slice(0,-5));
 if(hash(png)!==capture.screenshotHash)throw Error('candidate hash mismatch: '+p);
 rows.push({capture,png});
 }}
 const seen=new Set();for(const r of rows){const key=r.capture.caseId+':'+r.capture.captureMode;if(seen.has(key))throw Error('duplicate candidate: '+key);seen.add(key)}
 return rows.sort((a,b)=>(a.capture.caseId+a.capture.captureMode).localeCompare(b.capture.caseId+b.capture.captureMode));
}
const [command,registryPath,candidateDir,out,approvalPath]=process.argv.slice(2);
if(!out||!['register','compare'].includes(command))throw Error('usage: visual-batch.mjs register|compare registry.json candidate-dir output-dir [approval.json]');
const registry=await json(registryPath);
if(registry.version!==1||!Array.isArray(registry.entries))throw Error('invalid registry');
const rows=await candidates(candidateDir);if(!rows.length)throw Error('no candidates');
await mkdir(out,{recursive:true});
if(command==='register'){
 if(!approvalPath)throw Error('explicit approval file required');
 const approval=await json(approvalPath);let next=registry;
 const identity=c=>JSON.stringify([c.caseId,c.captureMode,c.revision,c.screenshotHash,c.browser,c.browserVersion,c.platform,c.fontFingerprint,c.fixtureHash,c.stateHash,c.viewportWidth,c.viewportHeight,c.deviceScaleFactor,c.reducedMotion]);
 if(!Array.isArray(approval.captures))throw Error('explicit capture approvals required');
 const approved=new Set(approval.captures.map(identity));
 if(approval.captures.length!==rows.length||approved.size!==rows.length||rows.some(r=>!approved.has(identity(r.capture))))throw Error('approval must identify exact candidate captures');
 await mkdir(join(out,'images'),{recursive:true});
 for(const r of rows){next=registerBaseline(next,r.capture,r.png,approval);const e=next.entries.at(-1);await writeFile(join(out,'images',e.screenshotHash+'.png'),r.png,{flag:'wx'}).catch(async err=>{if(err.code!=='EEXIST'||hash(await readFile(join(out,'images',e.screenshotHash+'.png')))!==e.screenshotHash)throw err});}
 for(const e of registry.entries){if(!/^[a-f0-9]{64}$/.test(e.screenshotHash))throw Error('invalid baseline hash');const png=await readFile(join(dirname(registryPath),'images',e.screenshotHash+'.png'));if(hash(png)!==e.screenshotHash)throw Error('old baseline corrupted');await writeFile(join(out,'images',e.screenshotHash+'.png'),png,{flag:'wx'}).catch(async err=>{if(err.code!=='EEXIST'||hash(await readFile(join(out,'images',e.screenshotHash+'.png')))!==e.screenshotHash)throw err});}
 await write(join(out,'registry.json'),next);
}else{
 const reports=[];
 for(const r of rows){
 const matches=registry.entries.filter(e=>e.capture.caseId===r.capture.caseId&&e.capture.captureMode===r.capture.captureMode);
 const entry=matches.filter(e=>compareCapture(e.capture,r.capture).status==='comparable').at(-1);
 const key=hash(JSON.stringify([r.capture.caseId,r.capture.captureMode])).slice(0,16);
 if(!entry){reports.push({caseId:r.capture.caseId,mode:r.capture.captureMode,status:matches.length?'incompatible':'missing-baseline'});continue}
 if(!/^[a-f0-9]{64}$/.test(entry.screenshotHash))throw Error('invalid baseline hash');
 const baseline=await readFile(join(dirname(registryPath),'images',entry.screenshotHash+'.png'));
 const {report,mask}=compareScreenshots({entry,baseline,candidate:r.png,capture:r.capture});
 if(mask)await writeFile(join(out,key+'.png'),mask,{flag:'wx'});
 reports.push({caseId:r.capture.caseId,mode:r.capture.captureMode,...report,mask:mask?key+'.png':null});
 }
 for(const e of registry.entries){if(!rows.some(r=>r.capture.caseId===e.capture.caseId&&r.capture.captureMode===e.capture.captureMode)&&!reports.some(r=>r.caseId===e.capture.caseId&&r.mode===e.capture.captureMode))reports.push({caseId:e.capture.caseId,mode:e.capture.captureMode,status:'missing-candidate'});}
 await write(join(out,'summary.json'),reports);
 if(reports.some(r=>r.status!=='within-tolerance'))process.exitCode=1;
}
