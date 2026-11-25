const clone=x=>JSON.parse(JSON.stringify(x));
const fields=['rows','unit','title','subtitle','claim','note','width','height','hue'];
export function createStudioState(input){
 if(!input||typeof input.designId!=='string'||!input.designId)throw Error('designId required');
 let draft=clone(input),version=0,result=null,active=null,serial=0;
 return {view:()=>clone({draft,version,result,active,status:active?'running':result?'generated-unverified':'draft'}),
 edit(patch){if(!patch||typeof patch!=='object'||Array.isArray(patch)||Object.keys(patch).some(k=>!fields.includes(k)))throw Error('unsupported edit');draft={...draft,...clone(patch),patches:[]};version++;result=null;active=null;return version},
 begin(){active={version,token:++serial};result=null;return clone({ticket:active,input:draft})},
 complete(ticket,output){if(!active||ticket?.token!==active.token||ticket.version!==version)return false;if(!output||!['rendered-unverified','blocked'].includes(output.status)||output.releaseAuthorized!==false)throw Error('invalid engine result');result=clone(output);active=null;return true},
 fail(ticket){if(!active||ticket?.token!==active.token||ticket.version!==version)return false;active=null;result=null;return true}
 };
}
