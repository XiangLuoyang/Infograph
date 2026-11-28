// Extract the exact synthetic shared-scene fixture without network or external packages.
import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const fixture=JSON.parse(readFileSync(new URL('../skills/infograph-master/visual-metaphor-intelligence/benchmark/shared-scene-study.json',import.meta.url),'utf8'));
assert.equal(fixture.encoding,'gzip+base64');
const bytes=gunzipSync(Buffer.from(fixture.payload,'base64'));
assert.equal(bytes.length,fixture.bytes);
assert.equal(createHash('sha256').update(bytes).digest('hex'),fixture.artifactSha256);
if(process.argv[2])writeFileSync(process.argv[2],bytes,{flag:'wx'});
console.log(JSON.stringify({bytes:bytes.length,sha256:fixture.artifactSha256,priorEvidence:fixture.evidence,scope:'fixture byte integrity only, not a fresh browser run',releaseAuthorized:false},null,2));
