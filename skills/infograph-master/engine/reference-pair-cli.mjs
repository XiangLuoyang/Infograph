import {readFile,writeFile} from 'node:fs/promises';
import {reviewReferencePair} from './reference-pair-review.mjs';
const [manifest,reference,candidate,referenceImage,candidateImage,output,observations]=process.argv.slice(2);
if(!output)throw Error('usage: node reference-pair-cli.mjs manifest.json reference-annotation.json candidate-annotation.json reference-image candidate-image report.json [observations.json]');
const json=p=>readFile(p,'utf8').then(JSON.parse);
const report=reviewReferencePair({manifest:await json(manifest),reference:await json(reference),candidate:await json(candidate),referenceBytes:await readFile(referenceImage),candidateBytes:await readFile(candidateImage),observations:observations?await json(observations):[]});
await writeFile(output,JSON.stringify(report,null,2),{flag:'wx'});
console.log(report.status);
