export function auditDiscovery(paths,read,manifest){
 const expected=["infograph-master","narrative-design","visual-metaphor-intelligence"];
 const errors=[],set=new Set(paths),found=[];
 if(manifest?.version!==1||manifest?.releaseAuthorized!==false||typeof manifest.packageVersion!=="string"||!Array.isArray(manifest.skills))throw Error("invalid skills manifest");
 const all=paths.filter(p=>/^skills\/.+\/SKILL\.md$/.test(p)).sort();
 for(const p of all){
  const parts=p.split("/");
  if(parts.length!==3){errors.push("nested SKILL.md: "+p);continue}
  const source=read(p);const fm=typeof source==="string"&&/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if(!fm){errors.push("invalid frontmatter: "+p);continue}
  const names=[...fm[1].matchAll(/^name:\s*([a-z0-9-]+)\s*$/gm)],descs=[...fm[1].matchAll(/^description:\s*(\S[^\r\n]*)$/gm)];
  if(names.length!==1||descs.length!==1||names[0][1]!==parts[1]||!descs[0][1].trim()){errors.push("invalid skill metadata: "+p);continue}
  found.push({name:names[0][1],path:p});
 }
 const declared=manifest.skills.map(s=>s.name).sort();
 if(JSON.stringify(declared)!==JSON.stringify(expected)||new Set(declared).size!==declared.length)errors.push("manifest must declare exactly three skills");
 if(JSON.stringify(found.map(s=>s.name).sort())!==JSON.stringify(expected))errors.push("discovered names differ from expected");
 if(manifest.defaultEntry!=="skills/infograph-master/SKILL.md")errors.push("default entry changed");
 for(const s of manifest.skills){
  if(!found.some(x=>x.name===s.name&&x.path===s.path))errors.push("unresolved registered entry: "+s.name);
  if(!Array.isArray(s.dependencies)||s.dependencies.some(p=>!set.has(p)))errors.push("missing registered dependency: "+s.name);
 }
 return {packageVersion:manifest.packageVersion,discovered:found,errors,pass:errors.length===0,scope:"repository discovery and declared dependency presence; not host installation certification"};
}
