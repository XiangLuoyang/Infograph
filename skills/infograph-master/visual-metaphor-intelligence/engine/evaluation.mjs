export function assessReverseComprehension(task,artifact,records){
 const txt=x=>typeof x==="string"&&x.trim().length>0;
 if(!txt(task?.id)||!Array.isArray(task.keyPoints)||!task.keyPoints.length||new Set(task.keyPoints.map(x=>x.id)).size!==task.keyPoints.length||task.keyPoints.some(x=>!txt(x.id)||!txt(x.text))||!txt(artifact?.id)||!/^([a-f0-9]{64})$/.test(artifact.sha256??"")||!Array.isArray(records))throw Error("invalid benchmark input");
 const seen=new Set(), results=[];
 for(const r of records){
  if(!txt(r.readerId)||seen.has(r.readerId)||r.artifactId!==artifact.id||r.artifactSha256!==artifact.sha256||r.taskId!==task.id||!["independent-human","independent-model"].includes(r.readerKind)||r.promptHidden!==true||!txt(r.rawResponseRef)||!txt(r.scorerId)||r.scorerId===r.readerId||!Array.isArray(r.points))throw Error("invalid independent review record");
  seen.add(r.readerId);const ids=new Set(r.points.map(p=>p.id));if(ids.size!==task.keyPoints.length||r.points.length!==ids.size||task.keyPoints.some(p=>!ids.has(p.id))||r.points.some(p=>!["correct","partial","wrong","not-run"].includes(p.status)||!txt(p.reason)))throw Error("incomplete point scoring");
  const pending=r.points.some(p=>p.status==="not-run");
  results.push({readerId:r.readerId,readerKind:r.readerKind,score:pending?null:r.points.reduce((n,p)=>n+(p.status==="correct"?1:p.status==="partial"?.5:0),0)/task.keyPoints.length,misconception:task.keyPoints.filter(p=>p.critical===true).some(p=>r.points.find(x=>x.id===p.id).status==="wrong"),status:pending?"incomplete":"declared-scored"});
 }
 return {taskId:task.id,artifactId:artifact.id,results,status:results.length?"declared-reader-records":"not-run",independentHumanCount:results.filter(r=>r.readerKind==="independent-human"&&r.score!==null).length,releaseAuthorized:false,scope:"scores supplied by independent-reader records; independence and truth not independently verified; no aggregate claim"};
}
