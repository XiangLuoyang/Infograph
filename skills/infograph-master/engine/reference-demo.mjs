import {writeFile} from 'node:fs/promises';
import {buildReferenceHTML} from './reference-renderer.mjs';
import {referenceDemo} from './reference-renderer-fixture.mjs';
const target=process.argv[2];if(!target)throw Error('usage: node reference-demo.mjs output.html');
const {manifest,options}=referenceDemo();const {html}=buildReferenceHTML(manifest,options);await writeFile(target,html,{flag:'wx'});
