// Structural evidence audit; see references/quality-depth.md.
export function auditQualityDepth(input) {
  const areas=["QD01","QD02","QD03","QD04","QD05","QD06"];
  if(!input || !Number.isInteger(input.revision)||input.revision<0||!["report","decision","monitor","explore","explain"].includes(input.purpose)||!Array.isArray(input.areas))throw Error("invalid quality-depth context");
  for(const k of ["substantial","multiRoute","mixedModes","semanticInteraction","richScene"]) if(typeof input[k]!=="boolean")throw Error("missing boolean "+k);
  if(!input.substantial) return {applicable:false,buildEligible:null,coverageComplete:null,depthComplete:null,releaseAuthorized:false,scope:"outside substantial-task gate"};
  const mandatory=new Set(["QD06"]);
  if(["report","decision","explain"].includes(input.purpose)||input.mixedModes)mandatory.add("QD01");
  if(input.semanticInteraction||input.mixedModes)mandatory.add("QD02");
  if(input.richScene){mandatory.add("QD03");mandatory.add("QD04");}
  if(input.multiRoute)mandatory.add("QD05");
  const map=new Map();
  for(const a of input.areas){if(!a||!areas.includes(a.id)||map.has(a.id)||typeof a.applicable!=="boolean")throw Error("invalid or duplicate area");map.set(a.id,a);}
  const nonempty=v=>typeof v==="string"&&v.trim().length>0;
  const check=r=>!r?"missing":r.revision!==input.revision?"stale":!["pass","fail","not-run"].includes(r.status)?"invalid":r.status==="pass"&&!nonempty(r.ref)?"missing-reference":r.status;
  const results=areas.map(id=>{
    const a=map.get(id);
    if(!a)return {id,design:"missing",review:"missing"};
    if(!a.applicable){
      const status=mandatory.has(id)?"required":!nonempty(a.reason)?"missing-rationale":"not-applicable";
      return {id,design:status,review:status};
    }
    return {id,design:check(a.design),review:check(a.review)};
  });
  const okay=s=>s==="pass"||s==="not-applicable";
  const buildEligible=results.every(r=>okay(r.design));
  return {revision:input.revision,applicable:true,areas:results,buildEligible,coverageComplete:buildEligible,depthComplete:buildEligible&&results.every(r=>okay(r.review)),releaseAuthorized:false,scope:"declared design/review evidence only; not pixel inspection, aesthetic scoring or independently verified approval"};
}
