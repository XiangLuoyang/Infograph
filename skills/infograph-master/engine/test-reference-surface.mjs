import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileReference} from './reference-scene.mjs';
import {previewReferenceSurfaces} from './reference-surface.mjs';
const fixture=JSON.parse(readFileSync(new URL('./reference-scene.example.json',import.meta.url),'utf8'));
const output=previewReferenceSurfaces(compileReference(fixture,{webgl:true,raster:true}));
assert.equal(output.renderedScene,false);assert.equal(output.objects[0].requirementMet,false);assert.equal(output.objects[0].preview.actual,'svg');assert.ok(output.objects[0].unmet.includes('physical metalness not implemented'));assert.ok(output.lighting.levels.length>0);console.log('Reference surface checks: 5');
