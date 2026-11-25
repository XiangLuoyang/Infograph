import assert from 'node:assert/strict';
import {cameraBasis,projectPoint,projectedObjectPorts,validateGeometry} from './reference-geometry.mjs';
import {buildReferenceHTML} from './reference-renderer.mjs';
import {assemblyDemo} from './reference-assembly-fixture.mjs';
const {manifest,options}=assemblyDemo(),hub=manifest.objects.find(o=>o.id==='hub');
assert.doesNotThrow(()=>validateGeometry(hub));
assert.equal(hub.geometry.parts.length,26);
assert.equal(Object.keys(hub.geometry.ports3d).length,14);
const b=cameraBasis(hub.geometry.camera),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
assert.ok(Math.abs(dot(b.right,b.up))<1e-10);assert.ok(Math.abs(dot(b.right,b.depth))<1e-10);assert.ok(Math.abs(dot(b.up,b.depth))<1e-10);
assert.deepEqual(projectPoint([0,0,0],hub.geometry.camera,1.5),[.5,.5,0]);
const a=projectPoint([.5,0,0],{azimuth:0,elevation:30,zoom:.8},2);assert.ok(Math.abs(a[0]-.6)<1e-9);
const mapped=projectedObjectPorts(hub,1.5);assert.notDeepEqual(mapped.ports.p0,hub.ports.p0);assert.ok(Math.abs(hub.ports.p0[0]-.5)<1e-9&&Math.abs(hub.ports.p0[1]-.02)<1e-9); // authored fallback untouched
assert.ok(buildReferenceHTML(manifest,options).report.renderers.includes('webgl'));
const invalid=structuredClone(hub);invalid.geometry.parts[0].radius=-1;assert.throws(()=>validateGeometry(invalid));
invalid.geometry.parts[0].radius=1;invalid.geometry.ports3d.unknown=[0,0,0];assert.throws(()=>validateGeometry(invalid));
assert.throws(()=>cameraBasis({elevation:90}));
console.log('Reference assembly and projection checks passed');
