import {inspectArtifact} from './artifact-inspector.mjs';
if(process.argv.length!==3)throw Error('usage: node artifact-inspector-cli.mjs input.html');
console.log(JSON.stringify(await inspectArtifact(process.argv[2]),null,2));
