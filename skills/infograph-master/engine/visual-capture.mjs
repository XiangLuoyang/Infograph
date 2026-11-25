import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {validateCapture} from './visual-baseline.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
export async function captureVisual(page,browser,{caseId,fixture,state,captureMode,path}){
 const revision=process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const fonts=execFileSync('fc-list',['--format','%{file}\\n'],{encoding:'utf8'}).split('\n').filter(Boolean);
 const inventory=await Promise.all([...new Set(fonts)].sort().map(async p=>[p,hash(await readFile(p))]));
 await page.evaluate(()=>document.fonts.ready);
 const env=await page.evaluate(()=>({viewportWidth:innerWidth,viewportHeight:innerHeight,deviceScaleFactor:devicePixelRatio,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches?'reduce':'no-preference'}));
 const capture=validateCapture({caseId,browser:'chromium',browserVersion:browser.version(),platform:process.platform+'-'+process.arch+'-'+execFileSync('uname',['-r'],{encoding:'utf8'}).trim(),fontFingerprint:hash(JSON.stringify(inventory)),fixtureHash:hash(JSON.stringify(fixture)),stateHash:hash(JSON.stringify(state)),captureMode,revision,...env});
 const png=await page.screenshot({fullPage:true,animations:'disabled',caret:'hide'});
 await writeFile(path,png,{flag:'wx'});await writeFile(path+'.json',JSON.stringify({...capture,screenshotHash:hash(png)},null,2),{flag:'wx'});
 return capture;
}
