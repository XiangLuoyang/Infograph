import {validateIR} from './design-v3.mjs';
import {fromStoryboard,attachBatch} from './specialist-ir-adapter.mjs';
import {detectConflicts} from './conflict-engine.mjs';
import {proposeRepairs} from './resolution-engine.mjs';
export function compileUnified({ir,storyboard,id,attachments=[],facts}, {model,rules,catalog}){
 if(Boolean(ir)===Boolean(storyboard))throw Error('provide exactly one design source');
 let d=ir?JSON.parse(JSON.stringify(ir)):fromStoryboard(storyboard,id,model);
 const initial=validateIR(d,model);if(initial.errors.length)throw Error(initial.errors.join('; '));
 if(attachments.length)d=attachBatch(d,model,attachments);
 if(facts&&(facts.designId!==d.id||facts.revision!==d.revision))throw Error('stale fact envelope');
 const conflict=detectConflicts(d,model,rules,facts?.blocks??{});
 const resolution=proposeRepairs(d,conflict,catalog);
 return {version:'0.1',ir:d,conflict,resolution,status:conflict.status,releaseAuthorized:false,limitations:['declared facts are not independently verified','specialist payloads are not executed','no rendering or automatic repair']};
}
