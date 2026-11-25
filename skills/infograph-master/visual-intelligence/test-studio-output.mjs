import assert from 'node:assert/strict';
import {studioOutput,studios} from './studio-output.mjs';
for(const n of studios){const x=studioOutput(n,{test:1});assert.equal(x.studio,n);assert.equal(x.payload.test,1);assert.equal(x.validation.browser,'not-run')}
assert.throws(()=>studioOutput('bad',{}));assert.throws(()=>studioOutput('color',[]));assert.throws(()=>studioOutput('color',{},{status:'pass'}));
assert.equal(studioOutput('representation',{},{status:'blocked'}).status,'blocked');
