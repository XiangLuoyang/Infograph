import {writeFile} from 'node:fs/promises';
import {buildReferenceHTML} from './reference-renderer.mjs';
import {referenceDemo} from './reference-renderer-fixture.mjs';
const target=process.argv[2];if(!target)throw Error('usage: node reference-webgl-demo.mjs output.html');
const {manifest,options}=referenceDemo(),hub=manifest.objects.find(o=>o.id==='hub');hub.fidelity='spatial';hub.geometry={preset:'mechanical-hub'};hub.material.metalness=.75;
await writeFile(target,buildReferenceHTML(manifest,{...options,webgl:true}).html,{flag:'wx'});
