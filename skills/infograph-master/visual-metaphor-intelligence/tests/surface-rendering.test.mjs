import assert from 'node:assert/strict';
import {geometryLibrary,geometryTemplate} from '../engine/physical-geometry.mjs';
import {surfaceGradient} from '../engine/surface-rendering.mjs';
const lib=geometryLibrary();
assert.equal(lib.length,3);
for(const t of lib){
 assert.ok(t.shapes.length>=8);
 assert.ok(t.parts.every(([i,m])=>t.shapes[i]&&typeof m==='string'));
 assert.ok(t.movingPart===null||t.shapes[t.movingPart]);
 assert.ok(t.shapes.every(s=>['rect','circle','path'].includes(s.type)));
 for(const [i,m] of t.parts)assert.match(surfaceGradient(m,t.shapes[i].fill,'test-'+i),/<linearGradient/);
}
assert.throws(()=>geometryTemplate('unknown'));
const copy=geometryTemplate('rotor');copy.shapes.pop();assert.notEqual(copy.shapes.length,geometryTemplate('rotor').shapes.length);
assert.throws(()=>surfaceGradient('glass','none','x'));
assert.throws(()=>surfaceGradient('glass','surface','x" onclick="bad'));
console.log('VMI geometry and surface recipe tests passed');
