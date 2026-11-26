// Authored concept-to-layer handoff; never generates or inspects images.
export function compileConceptArt(spec){
 const txt=x=>typeof x==="string"&&x.trim().length>0;
 const hash=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
 const id=x=>typeof x==="string"&&/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(x)&&!["constructor","prototype"].includes(x);
 const req=(o,keys,label)=>{for(const k of keys)if(!txt(o?.[k]))throw Error(label+": missing "+k)};
 const index=(list,label)=>{if(!Array.isArray(list)||!list.length)throw Error("missing "+label);const m=new Map();for(const x of list){if(!id(x?.id)||m.has(x.id))throw Error("invalid/duplicate "+label+" ID");m.set(x.id,x)}return m};
 const bounds=b=>Array.isArray(b)&&b.length===4&&b.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&b[2]>0&&b[3]>0&&b[0]+b[2]<=1.00000001&&b[1]+b[3]<=1.00000001;
 req(spec,["intent","readerTask","semanticRef","designDNARef","selectionReason"],"brief");
 const directions=index(spec.directions,"directions");
 if(directions.size<3||![...directions.values()].some(x=>x.kind==="plain")||[...directions.values()].filter(x=>x.kind==="concept").length<2)throw Error("compare two art directions and plain alternative");
 for(const d of directions.values()){
  req(d,["silhouette","viewpoint","composition","palette","materials","lighting","tradeoff"],"direction");
  if(!["plain","concept"].includes(d.kind))throw Error("invalid direction kind");
 }
 const rich=[...directions.values()].filter(d=>d.kind==="concept");
 if(new Set(rich.map(d=>[d.silhouette,d.viewpoint,d.composition,d.materials,d.lighting].join("|"))).size!==rich.length)throw Error("directions indistinguishable");
 const selected=directions.get(spec.selectedDirection);
 if(!selected||selected.kind!=="concept")throw Error("plain selection should use ordinary representation route");
 const source=spec.source;
 if(!source||!id(source.id)||!["generated","authored","licensed","user-provided"].includes(source.origin)||!hash(source.sha256)||!Number.isInteger(source.width)||source.width<1||!Number.isInteger(source.height)||source.height<1||!["local-only","publication-cleared"].includes(source.permission))throw Error("invalid concept provenance");
 req(source,["ref","rightsNote"],"source");
 const assets=index(spec.assets,"assets"),issues=[];
 for(const a of assets.values()){
  if(!["clean-plate","isolated-part","mask","texture","overlay","static-fallback","geometry"].includes(a.kind)||!["planned","ready"].includes(a.status)||!bounds(a.bounds))throw Error("invalid asset "+a.id);
  req(a,["production","sourceRef"],"asset "+a.id);
  if(a.parentSha!==source.sha256)throw Error("asset bound to different concept revision");
  if(a.status==="ready"&&(!hash(a.sha256)||!txt(a.ref)||!["local-only","publication-cleared"].includes(a.permission)))throw Error("ready asset lacks provenance "+a.id);
  if(a.status==="planned")issues.push({kind:"asset-pending",id:a.id});
 }
 const semantic=index(spec.semanticObjects,"semantic objects");
 const layers=index(spec.layers,"layers"),covered=new Set(),used=new Set(),depths=new Set();
 for(const s of semantic.values())req(s,["meaning"],"semantic object");
 const asset=(key,kinds)=>{const a=assets.get(key);if(!a||!kinds.includes(a.kind))throw Error("missing/wrong asset "+key);used.add(key);return a};
 const referenceObjects=[],custom=[];
 for(const l of layers.values()){
  if(!bounds(l.bounds)||!Number.isInteger(l.depth)||l.depth<0||depths.has(l.depth)||typeof l.essential!=="boolean"||typeof l.dynamic!=="boolean")throw Error("invalid layer geometry/depth "+l.id);
  depths.add(l.depth);
  req(l,["label","reason","occlusion","material","lighting","staticAlternative"],"layer "+l.id);
  if(!["environment","entity","anchor","label","connector","instrument","ornament"].includes(l.role))throw Error("invalid layer role");
  if(!Array.isArray(l.semanticIds)||new Set(l.semanticIds).size!==l.semanticIds.length||l.semanticIds.some(x=>!semantic.has(x)))throw Error("unmapped semantic layer");
  if(l.role!=="ornament"&&l.role!=="environment"&&!l.semanticIds.length)throw Error("semantic layer needs mapping");
  if(l.essential)for(const x of l.semanticIds)covered.add(x);
  if(!["html","svg","css","raster","webgl","custom-hybrid"].includes(l.backend))throw Error("unknown backend");
  if(l.role==="label"&&(l.backend!=="html"||l.assetId||l.maskId||l.dynamic))throw Error("labels must remain independent live HTML");
  if(l.backend==="raster"){asset(l.assetId,l.dynamic?["isolated-part"]:["clean-plate","isolated-part","static-fallback"]);}
  if(l.backend==="webgl")asset(l.assetId,["geometry"]);
  if(l.backend==="custom-hybrid"){asset(l.assetId,["isolated-part","texture","overlay"]);custom.push(l.id);}
  if(l.dynamic){
   req(l,["motionIntent","pivotOrDomain","motionMapping"],"dynamic layer "+l.id);
   if(l.backend==="raster"||l.backend==="custom-hybrid"){
    asset(l.cleanPlateId,["clean-plate"]);
    asset(l.maskId,["mask"]);
    if(l.bakedOriginal!==false)throw Error("dynamic object must remove baked duplicate "+l.id);
   }
  }
  if(l.fallbackAssetId)asset(l.fallbackAssetId,["static-fallback"]);
  if(l.essential&&l.backend==="custom-hybrid"&&!l.fallbackAssetId)throw Error("essential custom layer needs static fallback");
  if(l.backend!=="custom-hybrid"){
   const fidelity=l.role==="label"?"flat":l.backend==="raster"?"raster":l.backend==="webgl"?"spatial":l.backend==="css"?"surface":"flat";
   referenceObjects.push({id:l.id,role:l.role,label:l.label,bounds:l.bounds,depth:l.depth,provenance:"authored",sourceNote:l.reason,essential:l.essential,fidelity,dynamic:l.dynamic,ports:l.ports??{}});
  }
 }
 if([...semantic.keys()].some(x=>!covered.has(x)))throw Error("essential semantic coverage missing");
 if([...assets.keys()].some(x=>!used.has(x)))throw Error("unassigned asset");
 const scenes=index(spec.scenes,"scenes");
 for(const s of scenes.values()){
  req(s,["intent"],"scene");
  if(!Array.isArray(s.visible)||new Set(s.visible).size!==s.visible.length||s.visible.some(x=>!layers.has(x)))throw Error("invalid visibility");
 }
 const fallback=scenes.get(spec.staticScene);
 if(!fallback||[...layers.values()].some(l=>l.essential&&!fallback.visible.includes(l.id)))throw Error("static scene omits essential layers");
 const manifest=custom.length?null:{source:{kind:"image",id:source.id,width:source.width,height:source.height,sha256:source.sha256},objects:referenceObjects,links:spec.links??[],scenes:[...scenes.values()].map(s=>({...s})),staticScene:spec.staticScene};
 // Existing reference adapter requires link IDs to be visible with their endpoints; append only where both are visible.
 if(manifest){for(const s of manifest.scenes)s.visible=[...s.visible,...manifest.links.filter(l=>s.visible.includes(l.from.object)&&s.visible.includes(l.to.object)).map(l=>l.id)];}
 return JSON.parse(JSON.stringify({version:"0.1",source,selectedDirection:selected,semanticRef:spec.semanticRef,designDNARef:spec.designDNARef,layers:[...layers.values()].sort((a,b)=>a.depth-b.depth),assets:[...assets.values()],scenes:[...scenes.values()],staticScene:spec.staticScene,referenceManifest:manifest,customLayers:custom,issues,assetsDeclaredReady:issues.length===0,rendered:false,releaseAuthorized:false}));
}

export function reviewConceptArt(plan,{outputSha,records=[]}={}){
 if(!/^[a-f0-9]{64}$/.test(outputSha??""))throw Error("output hash required");
 const dimensions=["semantic","silhouette","perspective","material","lighting","occlusion","legibility"];
 const required=[...dimensions.map(d=>"scene:"+d),...plan.layers.filter(l=>l.dynamic).map(l=>l.id+":motion"),...plan.layers.filter(l=>l.dynamic).map(l=>l.id+":occlusion")];
 const map=new Map();for(const r of records){if(!required.includes(r.key)||map.has(r.key))throw Error("unknown/duplicate review key");map.set(r.key,r)}
 const checks=required.map(key=>{const r=map.get(key);const status=!r?"missing":r.conceptSha!==plan.source.sha256||r.outputSha!==outputSha?"stale":!["pass","fail","not-run"].includes(r.status)?"invalid":r.status==="pass"&&(!r.ref?.trim?.()||!r.reviewer?.trim?.())?"missing-evidence":r.status;return {key,status}});
 return {checks,complete:plan.assetsDeclaredReady&&checks.every(c=>c.status==="pass"),releaseAuthorized:false,scope:"declared evidence only; not actual asset hash verification or visual assessment"};
}
