import assert from 'node:assert/strict';
import {createStudioState} from './master-studio-state.mjs';
const s=createStudioState({designId:'demo',rows:[]});const a=s.begin();s.edit({hue:210});assert.equal(s.complete(a.ticket,{status:'blocked',releaseAuthorized:false}),false);const b=s.begin();assert.equal(s.complete(b.ticket,{status:'blocked',releaseAuthorized:false}),true);assert.equal(s.view().result.status,'blocked');assert.throws(()=>s.edit({designId:'other'}));
