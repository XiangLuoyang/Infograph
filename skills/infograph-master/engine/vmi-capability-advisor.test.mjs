import test from 'node:test';
import assert from 'node:assert/strict';
import {recommendCapabilities} from './vmi-capability-advisor.mjs';
const templates=[{kind:'tank',roles:['buffer','source'],parts:[[0,'glass']]},{kind:'handwheel-valve',roles:['controller'],parts:[[0,'brushed-metal']]},{kind:'manifold-four',roles:['distribution'],parts:[[0,'brushed-metal']],branchCount:4},{kind:'dial-indicator',roles:['state'],parts:[[0,'matte-enamel']]}];
const p={id:'p',evidenceRef:'fixture',evidenceKind:'conceptual',nodes:[{id:'a',label:'budget'},{id:'b',label:'allocation'},{id:'c',label:'result'}],edges:[{id:'e1',from:'a',to:'b',essential:true},{id:'e2',from:'b',to:'c',essential:true}]};
const corpus=[{id:'s',nodes:[{id:'x',label:'reaction wheel',role:'buffer'},{id:'y',label:'阀门',role:'controller'},{id:'z',label:'仪表盘',role:'state'}],source:{url:'https://example.test'},limits:['synthetic only']}];
const result={id:'s',name:'fixture',coverage:1,missingEssential:[],reviewRequired:[],eligibleForManualComparison:true,nodeMapping:{a:'x',b:'y',c:'z'}};
const exploration={views:[{perspectiveId:'p',results:[result],needsOpenDiscovery:false}]};
const run=(perspective=p,objects=corpus,art=null)=>recommendCapabilities([perspective],exploration,objects,templates,art)[0];
test('role-only matches are not physical recommendations',()=>{
 const r=run(),[a,b,c]=r.candidates[0].components;
 assert.equal(a.geometry[0].status,'role-only-not-recommended');
 assert.equal(a.customGeometryNeeded,true);
 assert.equal(b.geometry[0].status,'inspect-physical-fit');
 assert.equal(c.geometry[0].status,'inspect-physical-fit');
 assert.equal(r.candidates[0].sourceRef,'https://example.test');
 assert.ok(r.advice.dynamic.includes('no numeric'));
 assert.ok(r.advice.art.includes('No upstream ART'));
 assert.ok(run(p,corpus,{selected:{id:'editorial'}}).advice.art.includes('editorial'));
});
test('branch count and layout hints are bounded by essential graph edges',()=>{
 const q=structuredClone(p);q.nodes.push({id:'d',label:'d'},{id:'e',label:'e'},{id:'f',label:'f'});
 q.edges.push(...['d','e','f'].map(to=>({from:'b',to,essential:true})));
 const s=structuredClone(corpus);Object.assign(s[0].nodes[1],{label:'four-way manifold',role:'distribution'});
 assert.equal(run(q,s).candidates[0].components[1].geometry[0].status,'inspect-physical-fit');
 assert.ok(run(q,s).shape.composition.includes('layered'));
 q.edges.pop();assert.equal(run(q,s).candidates[0].components[1].geometry[0].status,'role-only-not-recommended');
 q.edges.push({from:'c',to:'a',essential:true});assert.equal(run(q,s).shape.cyclic,true);
 assert.ok(!run(q,s).shape.composition.includes('layered'));
});
test('missing role, mapping and provenance cannot invent a component',()=>{
 const s=structuredClone(corpus);delete s[0].nodes[0].role;
 assert.equal(run(p,s).candidates[0].components[0].geometry.length,0);
 assert.throws(()=>run(p,[]),/missing mapped source/);
 assert.throws(()=>recommendCapabilities([p],{views:[]},corpus,templates),/missing exploration/);
});
