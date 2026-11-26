// Compile only bounded, explicit CSS role values, never source CSS or arbitrary selectors.
const props=new Set(['color','background-color','font-family','font-size','font-weight','line-height','letter-spacing','border-radius','border-top-width','border-top-color','box-shadow','padding-top','padding-right','padding-bottom','padding-left','column-gap','row-gap','opacity','fill','stroke','stroke-width','transition-duration','transition-timing-function','animation-duration']);
const safeId=s=>typeof s==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,100}$/.test(s);
const token=s=>'--ig-role-'+s.replace(/[^a-zA-Z0-9-]/g,'-');
const safeValue=v=>typeof v==='string'&&v.length>0&&v.length<=400&&!/[;{}<>\\\r\n]/.test(v)&&!/(?:url\s*\(|@import|expression\s*\(|var\s*\(|\/\*)/i.test(v);
export function compileDNAAdapter(contract,decision){
 if(!Array.isArray(contract?.roles)||!Array.isArray(decision?.roleIds)||!safeId(decision.sliceId)||decision.contractRevision!==contract.revision)throw Error('invalid/stale adapter input');
 const tokens=[],manual=[],errors=[],seen=new Set(),rules=[];
 for(const id of decision.roleIds){
 const r=contract.roles.find(x=>x.id===id),ex=(contract.exceptions||[]).find(e=>e.sliceId===decision.sliceId&&e.roleId===id),value=ex?.value??r?.target;
 if(!r||!safeId(id)||seen.has(token(id))){errors.push('invalid or colliding role: '+id);continue}seen.add(token(id));
 if(!r.computedProperty||!props.has(r.computedProperty)){manual.push({id,reason:'manual design convention or unsupported CSS property'});continue}
 if(!safeValue(value)){errors.push('unsafe/unsupported value: '+id);continue}
 tokens.push({id,token:token(id),value,property:r.computedProperty,exception:!!ex});
 rules.push('[data-ig-slice="'+decision.sliceId+'"] [data-ig-role~="'+id+'"] { '+r.computedProperty+': var('+token(id)+'); }');
 }
 const scope='[data-ig-slice="'+decision.sliceId+'"]';
 const css=errors.length?null:scope+' {\n'+tokens.map(t=>'  '+t.token+': '+t.value+';').join('\n')+'\n}\n'+rules.join('\n')+'\n';
 return {sliceId:decision.sliceId,contractRevision:contract.revision,css,tokens,manual,errors,scope:'opt-in scoped parameters for explicitly marked descendants; not automatic redesign or proof of style compatibility'};
}
