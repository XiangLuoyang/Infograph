import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {referenceDirectionIds} from './reference-art-direction.mjs';
import {artDirectionDemo} from './reference-art-fixture.mjs';
import {buildReferenceHTML} from './reference-renderer.mjs';
const target=process.argv[2];if(!target)throw Error('usage: node reference-art-demo.mjs new-directory');await mkdir(target);
for(const id of referenceDirectionIds){const {manifest,options}=artDirectionDemo(id);await writeFile(resolve(target,id+'.html'),buildReferenceHTML(manifest,options).html,{flag:'wx'});}
await writeFile(resolve(target,'index.html'),'<!doctype html><meta charset="utf-8"><title>Reference art directions</title><h1>Same semantic scene, three art directions</h1>'+referenceDirectionIds.map(id=>'<p><a href="'+id+'.html">'+id+'</a></p>').join(''),{flag:'wx'});
