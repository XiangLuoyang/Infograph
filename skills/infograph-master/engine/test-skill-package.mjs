import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {packageSkill} from './skill-package.mjs';
const f=JSON.parse(readFileSync(new URL('./skill-package.example.json',import.meta.url),'utf8'));const assets=f.inline.inline.map(a=>({...a,...f.inline.manifest.find(m=>m.path===a.path)}));assert.deepEqual(packageSkill(assets,f.inline.capabilities,{family:f.inline.family}),f.inline);assert.deepEqual(packageSkill(assets,f.repository.capabilities,{family:f.repository.family}),f.repository);assert.throws(()=>packageSkill(assets.slice(1),f.inline.capabilities));
