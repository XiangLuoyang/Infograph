import assert from 'node:assert/strict';
import {audit} from './audit-dependencies.mjs';
import {resolve} from 'node:path';
const base=resolve('/fixture'),a=resolve(base,'a.mjs'),b=resolve(base,'b.mjs'),c=resolve(base,'test-c.mjs');
const files=new Map([[a,"import {b} from './b.mjs';"],[b,"import fs from 'node:fs';"],[c,"import './a.mjs';"]]);
const run=()=>audit([...files.keys()],p=>files.get(p),p=>files.has(p),base);
let r=run();assert.equal(r.modules,3);assert.equal(r.edges.length,2);assert.equal(r.missing.length,0);assert.equal(r.cycles.length,0);assert.equal(r.external.length,1);assert.equal(r.tests.length,1);
files.set(b,"import './a.mjs'; import './missing.mjs';");r=run();assert.equal(r.missing.length,1);assert.equal(r.cycles.length,1);
console.log('8 dependency audit checks passed');
