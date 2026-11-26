// Scoped spatial layout compiler and declared rendered review. No browser execution.
export function compileSpatialComposition(atlas,spec){
 const ok=(v,m)=>{if(!v)throw Error(m)},txt=x=>typeof x==="string"&&x.trim().length>0,id=x=>typeof x==="string"&&/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(x)&&!["constructor","prototype"].includes(x);
 const index=(a,label)=>{ok(Array.isArray(a)&&a.length,"missing "+label);const m=new Map();for(const x of a){ok(id(x?.id)&&!m.has(x.id),"invalid/duplicate "+label);m.set(x.id,x)}return m};
 const unique=a=>Array.isArray(a)&&new Set(a).size===a.length;
 const int=(x,a,b)=>Number.isInteger(x)&&x>=a&&x<=b;
 ok(txt(spec?.revision)&&txt(spec.atlasRef)&&txt(spec.designDNARef)&&txt(spec.selectionReason),"missing spatial contract");
 ok(atlas?.coverage==="complete-declared"&&txt(atlas.discoveryRef),"complete declared atlas required");
 const pages=index(atlas.pages,"pages"),slices=index(atlas.slices,"slices"),inventory=index(atlas.inventory,"independent inventory"),assigned=new Set();
 for(const [kind,map] of [["page",pages],["slice",slices]])for(const x of map.values()){
  ok(txt(x.title)&&txt(x.task)&&txt(x.ref)&&unique(x.inventoryIds)&&x.inventoryIds.length,"atlas node lacks evidence");
  for(const i of x.inventoryIds){ok(inventory.get(i)?.kind===kind&&txt(inventory.get(i).ref)&&!assigned.has(i),"invalid inventory binding");assigned.add(i)}
 }
 ok(assigned.size===inventory.size,"unmapped inventory");
 for(const s of slices.values())ok(pages.has(s.pageId)&&!pages.has(s.id),"invalid slice parent");
 const alternatives=index(spec.alternatives,"alternatives");
 for(const mode of ["fixed","flow","hybrid"])ok([...alternatives.values()].some(a=>a.mode===mode&&txt(a.tradeoff)),"compare fixed, flow, hybrid");
 const tiers=index(spec.tiers,"tiers"),ordered=[...tiers.values()];
 for(const t of ordered){
  ok(int(t.minWidth,0,10000)&&int(t.minHeight,0,10000)&&["fixed","flow","hybrid"].includes(t.mode)&&txt(t.reason),"invalid tier");
  ok(int(t.gap,0,64)&&int(t.padding,0,64)&&t.shell&&["header","nav","filters"].every(k=>int(t.shell[k],0,200))&&t.shell.nav>0,"invalid spacing/shell");
  ok(t.mode==="flow"||t.minHeight>t.shell.header+t.shell.nav+t.shell.filters+2*t.padding+120,"insufficient fixed height");
 }
 ok(ordered.at(-1).minWidth===0&&ordered.at(-1).minHeight===0&&ordered.at(-1).mode==="flow","last tier must be flow fallback");
 for(let i=0;i<ordered.length;i++)for(let j=0;j<i;j++)ok(!(ordered[j].minWidth<=ordered[i].minWidth&&ordered[j].minHeight<=ordered[i].minHeight),"unreachable tier");
 const viewports=index(spec.viewports,"viewports");
 for(const v of viewports.values())ok(int(v.width,240,10000)&&int(v.height,200,10000)&&ordered.find(t=>v.width>=t.minWidth&&v.height>=t.minHeight)?.id===v.tierId,"viewport tier mismatch");
 for(const t of ordered)ok([...viewports.values()].some(v=>v.tierId===t.id),"tier has no review viewport");
 const authored=index(spec.pages,"page contracts"),layouts=index(spec.slices,"slice contracts");
 ok(authored.size===pages.size&&layouts.size===slices.size,"incomplete page/slice coverage");
 for(const p of authored.values()){
  ok(pages.has(p.id)&&["presentation","exploration","monitoring","lookup","reference"].includes(p.purpose)&&txt(p.returnPolicy)&&txt(p.filterPolicy),"invalid page contract");
  ok(unique(p.sliceOrder)&&p.sliceOrder.length&&p.sliceOrder.every(x=>slices.get(x)?.pageId===p.id)&&p.sliceOrder.length===[...slices.values()].filter(s=>s.pageId===p.id).length,"invalid slice order");
 }
 const result=[],issues=[];
 for(const s of layouts.values()){
  ok(slices.has(s.id)&&txt(s.claim)&&txt(s.densityRationale)&&txt(s.preservationRef),"invalid slice contract");
  const regions=index(s.regions,"regions");
  ok(regions.get(s.focusRegion)?.essential===true,"essential focal region required");
  for(const r of regions.values())ok(["hero","evidence","controls","detail","lookup","notes"].includes(r.role)&&typeof r.essential==="boolean"&&txt(r.task)&&txt(r.microRule),"invalid region");
  ok(unique(s.readingOrder)&&s.readingOrder.length===regions.size&&s.readingOrder.every(x=>regions.has(x)),"reading order incomplete");
  const variants=index(s.variants,"variants");ok(variants.size===tiers.size,"missing tier variant");
  for(const [tierId,v] of variants){
   const t=tiers.get(tierId);ok(t&&txt(v.rationale)&&Array.isArray(v.columns)&&v.columns.length>=1&&v.columns.length<=4&&v.columns.every(n=>int(n,1,12)),"invalid columns");
   ok(Array.isArray(v.rows)&&v.rows.length>=1&&v.rows.length<=12&&v.rows.every(row=>Array.isArray(row)&&row.length===v.columns.length&&row.every(x=>regions.has(x))),"invalid grid");
   ok(Array.isArray(v.rowSizes)&&v.rowSizes.length===v.rows.length&&v.rowSizes.every(x=>x==="auto"||int(x,1,12)),"invalid rows");
   for(const r of regions.values()){
    const cells=[];v.rows.forEach((row,y)=>row.forEach((x,col)=>{if(x===r.id)cells.push([y,col])}));
    ok(cells.length,"region absent in tier");const ys=cells.map(c=>c[0]),xs=cells.map(c=>c[1]);
    ok(cells.length===(Math.max(...ys)-Math.min(...ys)+1)*(Math.max(...xs)-Math.min(...xs)+1),"nonrectangular grid area");
   }
   ok([...new Set(v.rows.flat())].join("|")===s.readingOrder.join("|"),"reading order mismatch");
   const expected=t.mode==="flow"?"document":t.mode==="hybrid"?"workspace":null;
   ok(v.scroll&&(expected?v.scroll.vertical===expected:["none","region"].includes(v.scroll.vertical)),"scroll owner contradicts mode");
   if(v.scroll.vertical==="region")ok(regions.get(v.scroll.regionId)?.role==="lookup"&&txt(v.scroll.reason),"local vertical scroll requires justified lookup");
   else ok(v.scroll.regionId==null,"extraneous local owner");
   const horizontal=v.scroll.horizontalRegions??[];
   ok(unique(horizontal)&&horizontal.every(x=>regions.get(x)?.role==="lookup"),"horizontal overflow only allowed in lookup");
   if(t.mode==="fixed"&&v.rowSizes.every(x=>x==="auto"))issues.push({sliceId:s.id,tierId,kind:"fixed-grid-all-auto",severity:"review"});
   result.push({sliceId:s.id,pageId:slices.get(s.id).pageId,tierId,mode:t.mode,columns:v.columns,rows:v.rows,rowSizes:v.rowSizes,scroll:v.scroll,readingOrder:s.readingOrder,regions:[...regions.values()],focusRegion:s.focusRegion});
  }
 }
 const reviewMatrix=[...viewports.values()].flatMap(v=>[...slices.values()].map(s=>({viewportId:v.id,sliceId:s.id,tierId:v.tierId})));
 return JSON.parse(JSON.stringify({version:"0.1",revision:spec.revision,atlasRef:spec.atlasRef,designDNARef:spec.designDNARef,tiers:ordered,viewports:[...viewports.values()],pages:[...authored.values()],layouts:result,reviewMatrix,issues,planningReady:issues.length===0,rendered:false,releaseAuthorized:false}));
}

export function selectSpatialTier(plan,width,height){
 if(!Number.isFinite(width)||width<=0||!Number.isFinite(height)||height<=0)throw Error("invalid viewport");
 const tier=plan.tiers.find(t=>width>=t.minWidth&&height>=t.minHeight);
 if(!tier)throw Error("no matching tier");return tier.id;
}

export function spatialCSS(plan){
 const lines=["/* Scoped workspace; host sets tier/slice and hides inactive slices. */","[data-ig-workspace]{box-sizing:border-box;display:grid;min-width:0;align-content:start}","[data-ig-workspace] *{box-sizing:border-box}","[data-ig-workspace]>[data-ig-shell]{min-width:0}","[data-ig-workspace]>[data-ig-shell='work']{min-width:0;min-height:0;display:grid;grid-template-columns:minmax(0,1fr)}","[data-ig-workspace] [data-ig-region]{min-width:0;min-height:0}","[data-ig-workspace] [hidden]{display:none!important}"];
 for(const t of plan.tiers){
  const q=`[data-ig-workspace][data-ig-tier="${t.id}"]`,flow=t.mode==="flow",h=t.shell;
  lines.push(`${q}{${flow?"min-height:100dvh;height:auto;grid-template-rows:auto auto auto auto":"height:100dvh;grid-template-rows:"+h.header+"px "+h.nav+"px "+h.filters+"px minmax(0,1fr);align-content:stretch"};gap:0}`);
  lines.push(`${q}>[data-ig-shell='work']{padding:${t.padding}px;overflow:${t.mode==="hybrid"?"auto":"visible"};align-content:${t.mode==="fixed"?"stretch":"start"};grid-template-rows:${t.mode==="fixed"?"minmax(0,1fr)":"auto"}}`);
  for(const l of plan.layouts.filter(x=>x.tierId===t.id)){
   const sel=`${q}>[data-ig-shell='work']>[data-ig-slice="${l.sliceId}"]`;
   lines.push(`${sel}{display:grid;min-width:0;min-height:0;gap:${t.gap}px;grid-template-columns:${l.columns.map(n=>`minmax(0,${n}fr)`).join(" ")};grid-template-rows:${l.rowSizes.map(n=>n==="auto"?"auto":t.mode==="fixed"?`minmax(0,${n}fr)`:`minmax(min-content,${n}fr)`).join(" ")};grid-template-areas:${l.rows.map(row=>'"'+row.map(x=>"ig_"+x).join(" ")+'"').join(" ")};align-content:${t.mode==="fixed"?"stretch":"start"}}`);
   for(const r of l.regions){
    const y=l.scroll.vertical==="region"&&l.scroll.regionId===r.id,x=(l.scroll.horizontalRegions??[]).includes(r.id);
    // CSS overflow coupling: horizontal-only scrollers use an unconstrained vertical box;
    // the rendered review must detect unintended vertical clipping/scroll.
    lines.push(`${sel}>[data-ig-region="${r.id}"]{grid-area:ig_${r.id};overflow-x:${x?"auto":y?"hidden":"visible"};overflow-y:${y?"auto":x?"hidden":"visible"}}`);
   }
  }
 }
 return lines.join("\n")+"\n";
}

export function auditSpatialReview(plan,{outputSha,observations=[],tolerancePx=2}={}){
 if(!/^[a-f0-9]{64}$/.test(outputSha??"")||!Number.isFinite(tolerancePx)||tolerancePx<0||tolerancePx>4)throw Error("invalid review");
 const m=new Map(),known=new Set(plan.reviewMatrix.map(r=>r.viewportId+":"+r.sliceId)),issues=[],groups=new Map();
 for(const r of observations){const k=r.viewportId+":"+r.sliceId;if(!known.has(k)||m.has(k))throw Error("unknown/duplicate observation");m.set(k,r)}
 const txt=x=>typeof x==="string"&&x.trim().length>0,box=b=>Array.isArray(b)&&b.length===4&&b.every(Number.isFinite)&&b[2]>0&&b[3]>0,nonneg=x=>Number.isFinite(x)&&x>=0;
 const same=(a,b)=>a.every((x,i)=>Math.abs(x-b[i])<=tolerancePx);
 const contains=(a,b)=>b[0]>=a[0]-tolerancePx&&b[1]>=a[1]-tolerancePx&&b[0]+b[2]<=a[0]+a[2]+tolerancePx&&b[1]+b[3]<=a[1]+a[3]+tolerancePx;
 for(const r of plan.reviewMatrix){
  const key=r.viewportId+":"+r.sliceId,o=m.get(key),l=plan.layouts.find(x=>x.sliceId===r.sliceId&&x.tierId===r.tierId),v=plan.viewports.find(x=>x.id===r.viewportId),t=plan.tiers.find(x=>x.id===r.tierId);
  const fail=(kind,detail)=>issues.push({key,kind,detail});
  if(!o){fail("missing","no rendered observation");continue}
  if(o.outputSha!==outputSha||o.revision!==plan.revision||!txt(o.ref)){fail("stale","output/reference mismatch");continue}
  if(o.width!==v.width||o.height!==v.height||o.tierId!==r.tierId||o.verticalOwner!==l.scroll.vertical||(l.scroll.vertical==="region"&&o.verticalRegion!==l.scroll.regionId))fail("contract","viewport or scroll owner mismatch");
  if(!nonneg(o.documentOverflowX)||o.documentOverflowX>tolerancePx)fail("overflow","document horizontal overflow");
  if(!nonneg(o.documentOverflowY)||(l.mode!=="flow"&&o.documentOverflowY>tolerancePx))fail("overflow","unexpected document vertical overflow");
  if(!nonneg(o.workspaceOverflowY)||(l.mode!=="hybrid"&&o.workspaceOverflowY>tolerancePx))fail("overflow","unexpected workspace vertical overflow");
  if(!box(o.shellBox)||!box(o.workBox)){fail("geometry","missing shell/work bounds");continue}
  if(l.mode!=="flow"){
   const prior=groups.get(r.viewportId);if(prior&&(!same(prior.shellBox,o.shellBox)||!same(prior.workBox,o.workBox)))fail("shell-drift","workspace geometry differs across slices");else if(!prior)groups.set(r.viewportId,o);
   const header=t.shell.header+t.shell.nav+t.shell.filters;
   if(!same(o.shellBox,[0,0,v.width,header])||!same(o.workBox,[0,header,v.width,v.height-header]))fail("shell-contract","fixed shell differs from authored geometry");
   if(!contains([0,0,v.width,v.height],o.workBox))fail("geometry","work outside viewport");
  }
  if(!Array.isArray(o.regions)||o.regions.length!==l.regions.length||new Set(o.regions.map(x=>x.id)).size!==l.regions.length||o.regions.some(x=>!l.regions.some(y=>y.id===x.id))){fail("coverage","region measurements incomplete");continue}
  for(const region of l.regions){
   const x=o.regions.find(a=>a.id===region.id);
   if(!box(x.box)||!nonneg(x.overflowX)||!nonneg(x.overflowY)){fail("geometry",region.id);continue}
   if(x.overflowX>tolerancePx&&!(l.scroll.horizontalRegions??[]).includes(region.id))fail("region-overflow-x",region.id);
   if(x.overflowY>tolerancePx&&!(l.scroll.vertical==="region"&&l.scroll.regionId===region.id))fail("region-overflow-y",region.id);
   if(x.reachable!==true||x.clipped!==false||(region.essential&&x.legible!==true))fail("task-reach",region.id);
   if(region.essential&&l.mode==="fixed"&&!contains(o.workBox,x.box))fail("essential-outside-workspace",region.id);
  }
  for(const k of ["navigation","keyboard","touch","returnContext","dataParity","visualCoherence"])if(o.tasks?.[k]!=="pass")fail("task-unverified",k);
 }
 return {revision:plan.revision,outputSha,expected:plan.reviewMatrix.length,observed:m.size,issues,complete:issues.length===0&&plan.issues.length===0,releaseAuthorized:false,scope:"declared rendered observations; not autonomous browser inspection or aesthetic certification"};
}
