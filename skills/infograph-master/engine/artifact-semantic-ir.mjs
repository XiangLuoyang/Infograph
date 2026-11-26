// Static artifact IR. No automatic business inference.
export function buildArtifactIR(snapshot){
 const kinds=["heading","region","text","table","control","chart","json","script","link"];
 if(!snapshot||typeof snapshot.sourceRef!=="string"||!snapshot.sourceRef.trim()||!Array.isArray(snapshot.records)||typeof snapshot.truncated!=="boolean")throw Error("invalid snapshot");
 const seen=new Set(),nodes=[],issues=[];
 for(const r of snapshot.records){
  if(!r||!kinds.includes(r.kind)||typeof r.locator!=="string"||!r.locator.trim()||seen.has(r.locator)||typeof r.label!=="string"||typeof r.value!=="object"||r.value===null||typeof r.truncated!=="boolean")throw Error("invalid or duplicate observation");
  seen.add(r.locator);
  const key=typeof r.key==="string"&&r.key.trim()?r.key:null;
  nodes.push({id:"obs:"+r.locator,kind:r.kind,key,ref:snapshot.sourceRef+"#"+r.locator,label:r.label,value:r.value,status:"observed-static",truncated:r.truncated});
 }
 const keyCounts=new Map();for(const n of nodes)if(n.key)keyCounts.set(n.key,(keyCounts.get(n.key)||0)+1);
 for(const [k,count] of keyCounts)if(count>1)issues.push({type:"duplicate-key",key:k,count});
 const incomplete=snapshot.truncated||nodes.some(n=>n.truncated);
 if(incomplete)issues.push({type:"truncated",note:"observed subset only"});
 const graph={version:1,sourceRef:snapshot.sourceRef,coverage:{source:"static-dom",render:"not-run",behavior:"not-run",formulas:"not-run",businessIntent:"not-run",completeness:incomplete?"partial":"bounded-snapshot"},nodes,issues,scope:"observed markup only; hidden/dynamic content, visual encoding, data meaning and behavior not certified"};
 return graph;
}
export function diffArtifactIR(before,after,aliases=[]){
 if(!before?.nodes||!after?.nodes||!Array.isArray(aliases))throw Error("invalid IR");
 const result=[],used=new Set(),mapped=new Set(),errors=[];
 const index=ir=>{const m=new Map();for(const n of ir.nodes)if(n.key){if(!m.has(n.key))m.set(n.key,[]);m.get(n.key).push(n)}return m};
 const a=index(before),b=index(after);
 const aliasMap=new Map();for(const x of aliases){if(!x||typeof x.from!=="string"||typeof x.to!=="string"||typeof x.ref!=="string"||!x.ref.trim()||aliasMap.has(x.from)||!a.has(x.from)||!b.has(x.to)){errors.push("invalid alias");continue}aliasMap.set(x.from,x.to)}
 const canon=v=>Array.isArray(v)?v.map(canon):v&&typeof v==="object"?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])):v;
 for(const n of before.nodes){
  if(!n.key){result.push({before:n.id,status:"unkeyed-review",ref:n.ref});continue}
  if(mapped.has(n.key))continue;mapped.add(n.key);
  const target=aliasMap.get(n.key)||n.key,aa=a.get(n.key),bb=b.get(target)||[];
  if(aa.length!==1||bb.length>1){result.push({before:n.id,key:n.key,status:"ambiguous-key"});continue}
  if(bb.length===0){result.push({before:n.id,key:n.key,status:after.coverage.completeness==="partial"?"unknown-after-truncation":"not-observed-after"});continue}
  const m=bb[0];if(used.has(m.id)){result.push({before:n.id,key:n.key,status:"mapping-conflict"});continue}used.add(m.id);
  const status=n.truncated||m.truncated?"partial-review":n.kind!==m.kind?"kind-changed":JSON.stringify(canon({label:n.label,value:n.value}))===JSON.stringify(canon({label:m.label,value:m.value}))?"observed-equal":"observed-changed";
  result.push({before:n.id,after:m.id,key:n.key,targetKey:target,status,beforeRef:n.ref,afterRef:m.ref});
 }
 for(const n of after.nodes)if(!used.has(n.id))result.push({after:n.id,key:n.key,status:n.key?"unmatched-after":"unkeyed-after",ref:n.ref});
 return {changes:result,errors,requiresReview:errors.length>0||before.coverage.completeness==="partial"||after.coverage.completeness==="partial"||result.some(x=>x.status!=="observed-equal"),semanticParity:"not-run",behaviorParity:"not-run",scope:"exact static observations with explicit stable keys; not equivalence of business semantics"};
}
export function buildIntentGraph(ir, authored){
 if(!ir?.nodes||!Array.isArray(authored?.intents)||!Array.isArray(authored?.links))throw Error("invalid graph");
 const observations=new Set(ir.nodes.map(n=>n.id)),intents=new Set(),errors=[],links=[],seen=new Set();
 for(const i of authored.intents){if(typeof i?.id!=="string"||!i.id.trim()||intents.has(i.id)||observations.has(i.id)||!["explicit","inferred","unknown"].includes(i.status)||typeof i.statement!=="string"||!i.statement.trim()||typeof i.ref!=="string"||!i.ref.trim()){errors.push("invalid intent");continue}intents.add(i.id);if(i.status==="inferred"&&(!i.alternative||!i.validation))errors.push("inference needs alternative and validation: "+i.id)}
 for(const l of authored.links){const k=JSON.stringify([l?.intentId,l?.observationId,l?.relation]);if(!intents.has(l?.intentId)||!observations.has(l?.observationId)||!["supports","context","contradicts","unknown"].includes(l?.relation)||seen.has(k)||typeof l.note!=="string"||!l.note.trim()){errors.push("invalid link");continue}seen.add(k);links.push(l)}
 for(const i of authored.intents)if(i.status==="inferred"&&!links.some(l=>l.intentId===i.id&&l.relation==="supports"))errors.push("inference missing observed support: "+i.id);
 return {intents:authored.intents,links,errors,scope:"author-asserted relationship to source evidence; not automated intent inference or proof",valid:errors.length===0};
}
