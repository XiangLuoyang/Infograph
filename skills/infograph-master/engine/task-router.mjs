const purposes={monitor:['监控','监测','预警','monitor','alert'],report:['汇报','报告','述职','briefing','report'],explore:['探索','钻取','筛选','explore','drilldown'],explain:['解释','原理','科普','explain'],decision:['决策','取舍','方案比较','decision','trade-off']};
const domains={geospatial:['地图','地理','map','geospatial'],engineering:['爆炸图','剖面','工程制图','exploded','section drawing'],network:['流程图','拓扑','泳道','flowchart','network'],scientific:['科学','医学','scientific','medical'],business:['经营','销售','库存','财务','business','revenue'],concept:['概念图','隐喻','concept map']};
const relations={comparison:['对比','排名','比较','comparison','ranking'],temporal:['趋势','时间序列','trend','timeline'],spatial:['地理','地图','geospatial','map'],flow:['流程','流向','flow'],composition:['占比','构成','share','composition'],distribution:['分布','distribution']};
const hits=(s,dict)=>Object.entries(dict).flatMap(([id,terms])=>{const matched=terms.filter(t=>s.includes(t));return matched.length?[{id,matched}]:[]});
export function routeTask(text,declared={}){
 if(typeof text!=='string'||!text.trim())throw Error('task required');
 const s=text.toLowerCase(),p=hits(s,purposes),d=hits(s,domains),rel=hits(s,relations);
 const choose=(k,dict,candidates)=>{if(declared[k]!==undefined){if(!Object.hasOwn(dict,declared[k]))throw Error('invalid '+k);return declared[k]}return candidates.length===1?candidates[0].id:null};
 const purpose=choose('purpose',purposes,p),domain=choose('domain',domains,d),relation=choose('relation',relations,rel);
 const groups=['standard','representation'];const modes=['Standard'];
 if(purpose==='report'||purpose==='decision'){groups.push('narrative');modes.push('Narrative')}
 if(domain&&domain!=='business'){modes.push('Specialist')}
 if(/交互|动画|钻取|筛选|interactive|animation/.test(s))groups.push('motion');
 if(/配色|色彩|palette|color/.test(s))groups.push('color');
 if(/字体|排版|typography/.test(s))groups.push('typography');
 if(/构图|布局|layout/.test(s))groups.push('composition');
 if(/材质|玻璃|material/.test(s))groups.push('material');
 if(/艺术方向|杂志风|art direction/.test(s)){groups.push('studio');modes.push('Studio')}
 const delivery=declared.delivery??(/html/.test(s)?'html':/ppt|幻灯片/.test(s)?'slides':/pdf/.test(s)?'pdf':null);
 if(delivery!==null&&!['html','slides','pdf','image','chart'].includes(delivery))throw Error('invalid delivery');
 return {purpose,domain,relation,delivery,groups:[...new Set(groups)],modes,signals:{purpose:p,domain:d,relation:rel},unresolved:['purpose','domain','relation','delivery'].filter(k=>({purpose,domain,relation,delivery})[k]===null),specialistReference:domain&&domain!=='business'?'visual-intelligence/'+domain+'-intelligence.md':null,status:'advisory',runtimeAuthorized:false};
}
