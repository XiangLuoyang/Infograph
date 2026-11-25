import {PNG} from 'pngjs';
import {diffRGBA} from './visual-diff.mjs';
import {compareCapture,verifyBaseline} from './visual-baseline.mjs';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
export function compareScreenshots({entry,baseline,candidate,capture,policy}){
 verifyBaseline(entry,baseline);
 const compatibility=compareCapture(entry.capture,capture);
 if(compatibility.status!=='comparable')return {report:{status:'incompatible',compatibility},mask:null};
 const a=PNG.sync.read(baseline),b=PNG.sync.read(candidate);
 const {mask,...report}=diffRGBA(a,b,policy);
 return {report:{...report,compatibility,baselineId:entry.id,baselineRevision:entry.capture.revision,candidateRevision:capture.revision},mask:mask?PNG.sync.write({width:a.width,height:a.height,data:Buffer.from(mask)}):null};
}
async function main(){
 const [entryFile,baselineFile,captureFile,candidateFile,out]=process.argv.slice(2);
 if(!out)throw Error('usage: visual-compare.mjs entry.json baseline.png capture.json candidate.png output-directory');
 const [entry,baseline,capture,candidate]=await Promise.all([readFile(entryFile,'utf8').then(JSON.parse),readFile(baselineFile),readFile(captureFile,'utf8').then(JSON.parse),readFile(candidateFile)]);
 const {report,mask}=compareScreenshots({entry,baseline,candidate,capture});
 await mkdir(out,{recursive:true});await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2),{flag:'wx'});
 if(mask)await writeFile(resolve(out,'difference.png'),mask,{flag:'wx'});
 if(report.status!=='within-tolerance')process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
