export function validateRuntimePlan(p){
 const nonempty=s=>typeof s==="string"&&s.trim().length>0;
 if(!p||p.version!==1||!Array.isArray(p.probes)||p.probes.length<1||p.probes.length>40||!Array.isArray(p.scenarios)||p.scenarios.length>12)throw Error("invalid plan");
 const ids=new Set();
 for(const x of p.probes){if(!nonempty(x.id)||ids.has(x.id)||!nonempty(x.selector)||!["text","table","control","chart"].includes(x.kind))throw Error("invalid probe");ids.add(x.id)}
 const scenarios=new Set(["baseline"]);
 for(const s of p.scenarios){if(!nonempty(s.id)||scenarios.has(s.id)||!Array.isArray(s.steps)||s.steps.length<1||s.steps.length>8)throw Error("invalid scenario");scenarios.add(s.id);
 for(const a of s.steps){if(!["click","select"].includes(a.action)||!nonempty(a.selector)||(a.action==="select"&&typeof a.value!=="string")||(a.waitFor!==undefined&&!nonempty(a.waitFor)))throw Error("invalid action")}
 }
 return p;
}
export function compareRuntime(before,after,required){
 if(!Array.isArray(required)||required.length===0||new Set(required).size!==required.length||required.some(k=>typeof k!=="string"||!k.trim()))throw Error("required probe ids needed");
 const key=(scenario,probe)=>JSON.stringify([scenario,probe]);
 const index=r=>{if(!r||!Array.isArray(r.states))throw Error("invalid runtime report");const m=new Map();for(const s of r.states){for(const p of s.probes||[]){const k=key(s.id,p.id);if(m.has(k))throw Error("duplicate runtime observation");m.set(k,{...p,stateStatus:s.status})}}return m};
 const a=index(before),b=index(after),checks=[];
 const scenarios=[...new Set([...before.states,...after.states].map(s=>s.id))];
 const canon=v=>Array.isArray(v)?v.map(canon):v&&typeof v==="object"?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])):v;
 for(const s of scenarios)for(const id of required){const x=a.get(key(s,id)),y=b.get(key(s,id));const status=!x||!y||x.status!=="observed"||y.status!=="observed"||x.stateStatus!=="observed"||y.stateStatus!=="observed"||x.partial||y.partial||!x.ref||!y.ref?"not-run":x.kind!==y.kind?"changed":JSON.stringify(canon(x.value))===JSON.stringify(canon(y.value))?"observed-match":"changed";checks.push({scenario:s,probe:id,status,beforeRef:x?.ref??null,afterRef:y?.ref??null})}
 return {checks,status:checks.length===0||checks.some(c=>c.status==="not-run")?"incomplete":checks.some(c=>c.status==="changed")?"changed":"observed-match",scope:"exact author-selected runtime outputs under named scenarios; not general behavioral or semantic equivalence",releaseAuthorized:false};
}
export function proposeIntentCandidates(ir,runtime=null){
 if(!ir||!Array.isArray(ir.nodes))throw Error("invalid IR");
 const nodes=ir.nodes.filter(n=>["heading","region","text","table","control","chart"].includes(n.kind)&&!n.truncated&&typeof n.ref==="string"&&n.ref);
 const signals=nodes.map(n=>({ref:n.ref,kind:n.kind,text:(n.label+" "+(n.kind==="table"?JSON.stringify(n.value.rows?.slice(0,2)||[]):"")).slice(0,2000).toLowerCase()}));
 const find=re=>signals.filter(n=>re.test(n.text)).slice(0,6);
 const candidates=[];
 const add=(id,task,evidence,alternative,validation,routes,reset)=>{const refs=[...new Set(evidence.map(n=>n.ref))];if(refs.length<2)return;candidates.push({id,status:"hypothesis",task,evidence:refs,alternative,validation,routes,reset})};
 const supply=find(/资金|资源|供给|供应|供货|capital|funding|supply|resource/);
 const shortage=find(/缺货|短缺|缺口|缺料|未满足|shortage|stockout|unmet|gap/);
 const distribution=find(/库存|占比|分布|结构|周转|错配|allocation|inventory|concentration|turnover|distribution/);
 if(supply.length&&shortage.length&&distribution.length)add("allocation-mechanism","Explain whether aggregate sufficiency can coexist with unmet needs due to allocation or cycle constraints",[...supply,...shortage,...distribution],"Monitor shortage without asserting a mechanism; total availability may not be usable for replenishment.","Compare time, units, item-level availability and allocation; verify causal model separately.",["references/dynamic-visual-metaphor.md","visual-intelligence/representation-foundations.md"],"Compare matched aggregate/item evidence, distribution view, and a qualitative circulation mechanism; never infer causality from keywords.");
 const targets=find(/目标|达成|预算|target|actual|attainment|budget/), changes=find(/同比|环比|趋势|变化|增长|trend|growth|change/);
 if(targets.length||changes.length)add("performance-review","Locate performance deviations and their drivers",[...targets,...changes,...signals.filter(n=>n.kind==="table").slice(0,2)],"Routine status monitoring rather than decision-oriented review.","Confirm baseline, decision, frequency, denominator and contribution data.",["visual-intelligence/representation-foundations.md","references/visual-design.md"],"Compare KPI lookup, contribution decomposition and decision narrative only if the task warrants it.");
 const alerts=find(/预警|告警|异常|监控|alert|monitor|exception|threshold/), controls=signals.filter(n=>n.kind==="control");
 if(alerts.length)add("monitoring","Find exceptions and take a follow-up action",[...alerts,...controls,...signals.filter(n=>n.kind==="table").slice(0,1)],"Periodic explanatory report with no ongoing monitoring requirement.","Confirm alert rules, task frequency, exception owner and time to locate.",["references/visual-design.md","visual-intelligence/representation-foundations.md"],"Compare exception-first workspace, prioritized lookup and detailed inspection; do not force a story.");
 if(controls.length&&signals.some(n=>n.kind==="table"||n.kind==="chart"))add("exploration","Inspect segments and compare detailed results",[...controls,...signals.filter(n=>n.kind==="table"||n.kind==="chart").slice(0,4)],"Controls might support presentation navigation rather than business exploration.","Observe actual before/after behavior in a trusted runtime; ask which comparisons matter.",["references/contextual-focus.md","visual-intelligence/representation-foundations.md"],"Compare linked detail, overview-to-detail navigation and direct comparison.");
 const observedRuntime=runtime?.states?.filter(s=>s.status==="observed")?.map(s=>({id:s.id,refs:s.probes.filter(p=>p.status==="observed"&&!p.partial&&p.ref).map(p=>p.ref)}))??[];
 return {candidates,observedRuntime,unknowns:["audience","decision owner","business priority","metric definitions","causal validity","functional importance"],scope:"lexical candidate prompts, not recovered requirements, confidence scores, or automatic design selection",requiresModelReview:true};
}
