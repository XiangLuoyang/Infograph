import assert from 'node:assert/strict';
import {validateBrief,parseRows} from './studio-brief.mjs';
const d={title:'Review',subtitle:'',claim:'Claim',note:'Limit',unit:'k',rows:[{label:'A',value:1}]};
assert.equal(validateBrief(d).valid,true);
assert.equal(validateBrief({...d,rows:[]}).valid,false);
assert.equal(validateBrief({...d,rows:[{label:'A',value:-1}]}).valid,false);
assert.equal(validateBrief({...d,rows:[...d.rows,...d.rows]}).valid,false);
assert.throws(()=>parseRows('{}'));
