import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {referenceDirectionIds,referenceDirection,directionContrast,applyReferenceDirection} from './reference-art-direction.mjs';
import {artDirectionDemo} from './reference-art-fixture.mjs';
import {buildReferenceHTML} from './reference-renderer.mjs';
import {assemblyDemo} from './reference-assembly-fixture.mjs';
const base=assemblyDemo(),catalog=JSON.parse(readFileSync(new URL('./art-directions.json',import.meta.url),'utf8')),signatures=new Set();
for(const id of referenceDirectionIds){
 const d=referenceDirection(id),a=artDirectionDemo(id),r=buildReferenceHTML(a.manifest,a.options);
 assert.ok(catalog.some(x=>x.id===d.catalogId));assert.ok(directionContrast(id).every(x=>x.pass));
 assert.deepEqual(a.manifest.links,base.manifest.links);assert.deepEqual(a.manifest.scenes,base.manifest.scenes);assert.deepEqual(a.manifest.objects.map(o=>[o.id,o.label]),base.manifest.objects.map(o=>[o.id,o.label]));
 assert.equal(r.report.artDirection,id);assert.equal(r.report.linkCount,14);assert.equal(r.report.browserVerified,false);
 signatures.add(JSON.stringify([d.camera,d.materials,d.scaleY,d.palette,d.duration]));
}
assert.equal(signatures.size,3);assert.throws(()=>referenceDirection('invalid'));assert.throws(()=>applyReferenceDirection(base.manifest,base.options,'industrial',{objectId:'hub',partRoles:{}}));assert.throws(()=>buildReferenceHTML(base.manifest,{...base.options,referenceDirection:'</style>'}));assert.equal(base.manifest.objects.find(o=>o.id==='hub').geometry.camera.azimuth,38);
console.log('Reference art direction contracts passed');
