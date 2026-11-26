import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {inspectRuntime} from './artifact-runtime-inspector.mjs';
import {sampleDNA,compareDNA} from './design-dna.mjs';
const dir=await mkdtemp(join(tmpdir(),'ig-dna-'));try{
 const file=join(dir,'fixture.html');await writeFile(file,`<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>.card{color:rgb(20,30,40);font-size:16px;border-radius:8px;background:#eee;padding:12px} @media(max-width:500px){#b{color:rgb(255,255,255)}}</style><section id="a" class="card">First</section><section id="b" class="card">Second</section>`);
 const probes=['a','b'].map(id=>({id,selector:'#'+id,kind:'style'}));
 const reports=[];for(const width of [1440,390])reports.push(await inspectRuntime(file,{version:1,viewport:{width,height:900},probes,scenarios:[]},{trusted:true}));
 assert.equal(reports[0].states[0].probes[0].value.computed['font-size'],'16px');
 assert.equal(reports[0].states[0].probes[0].value.computed['border-radius'],'8px');
 const bindings=[1440,390].flatMap(width=>['a','b'].map(id=>({sliceId:id,roleId:'text',viewport:width+'x900',state:'baseline',probeId:id,property:'color'})));
 const dna=sampleDNA(reports,bindings);assert.equal(dna.candidates[0].status,'variant-review');
 const contract={roles:[{id:'text',target:'rgb(20, 30, 40)',computedProperty:'color',requiredStates:[{viewport:'1440x900',state:'baseline'},{viewport:'390x900',state:'baseline'}]}]};
 const diff=compareDNA(dna,contract,['a','b'].map(sliceId=>({sliceId,roleIds:['text']})));
 assert.equal(diff.checks[0].status,'observed-match');assert.equal(diff.checks[1].status,'mismatch');console.log('computed DNA browser fixture passed');
}finally{await rm(dir,{recursive:true,force:true})}
