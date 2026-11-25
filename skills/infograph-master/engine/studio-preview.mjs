export function inspectResult(result){
 if(!result)return null;
 const h=result.repair?.history?.find(x=>x.revision===result.repair.acceptedRevision);
 return {status:result.status,revision:h?.revision??null,repairStatus:result.repair?.status??null,tasks:(h?.report?.results??[]).map(t=>({id:t.id,status:t.status,bindings:t.trace??[],limitations:t.output?.limitations??[],blockedBy:t.blockedBy??[],message:t.message??null})),observations:h?.evidence?.observations??[],releaseAuthorized:false,validation:{browser:'not-run',semantic:'not-run'}};
}
export function createPreviewScheduler(run,{delay=250,schedule=setTimeout,cancel=clearTimeout}={}){
 let pending=null,generation=0;
 return {request(){const g=++generation;if(pending!==null)cancel(pending);pending=schedule(()=>{if(g!==generation)return;pending=null;run()},delay)},cancel(){generation++;if(pending!==null)cancel(pending);pending=null}};
}
