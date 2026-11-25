const clone=x=>JSON.parse(JSON.stringify(x));
export function createHistory(limit=20){
 if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('invalid history limit');
 let entries=[],serial=0;
 return {list:()=>clone(entries.map(({id,version,input})=>({id,version,title:input.title}))),save(view){if(view.active||view.result?.status!=='rendered-unverified'||view.result.releaseAuthorized!==false||typeof view.result.html!=='string')throw Error('no current render');const e=clone({id:++serial,version:view.version,input:view.draft,result:view.result});entries.push(e);if(entries.length>limit)entries.shift();return e.id},get(id){const e=entries.find(x=>x.id===id);if(!e)throw Error('snapshot unavailable');return clone(e)}};
}
export function compareSnapshots(a,b){const keys=new Set([...Object.keys(a.input),...Object.keys(b.input)]);return [...keys].filter(k=>JSON.stringify(a.input[k])!==JSON.stringify(b.input[k])).map(k=>({field:k,before:a.input[k]??null,after:b.input[k]??null}));}
export function exportSnapshot(e,kind){if(e.result?.status!=='rendered-unverified'||e.result.releaseAuthorized!==false)throw Error('invalid snapshot');if(kind==='html')return {name:'infograph-'+e.id+'.html',mime:'text/html',content:e.result.html};if(kind==='config'||kind==='report')return {name:'infograph-'+e.id+'-'+kind+'.json',mime:'application/json',content:JSON.stringify({version:'1.0',snapshotId:e.id,studioVersion:e.version,releaseAuthorized:false,validation:'not-run',payload:kind==='config'?e.input:e.result.repair},null,2)};throw Error('unsupported export');}
