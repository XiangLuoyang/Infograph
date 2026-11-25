import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderUnified} from './unified-renderer.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const input=JSON.parse(read('./unified-renderer.example.json'));
assert.equal(renderUnified(input),read('./unified-renderer.example.html'));
assert.ok(renderUnified({...input,title:'<script>'}).includes('&lt;script&gt;'));
assert.throws(()=>renderUnified({...input,chart:{...input.chart,svg:'<svg/>'}}));
assert.throws(()=>renderUnified({...input,color:{tokens:{...input.color.tokens,canvas:'red;}'}}}));
