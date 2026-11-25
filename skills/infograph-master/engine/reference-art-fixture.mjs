import {assemblyDemo} from './reference-assembly-fixture.mjs';
import {applyReferenceDirection} from './reference-art-direction.mjs';
export function artDirectionDemo(id){
 const {manifest,options}=assemblyDemo(),hub=manifest.objects.find(o=>o.id==='hub');
 const partRoles=Object.fromEntries(hub.geometry.parts.map(p=>[p.id,p.id==='base'||p.id==='cap'?'base':p.id==='rim'||p.id.startsWith('lug')?'accent':p.id.startsWith('panel')?'panel':'body']));
 return applyReferenceDirection(manifest,{...options,title:'Multi-stakeholder tension',description:'Neutral 14-constraint illustration · qualitative, not measured'},id,{objectId:'hub',partRoles});
}
