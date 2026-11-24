"""Deterministic scene/layout plan compiler; not an HTML renderer."""
import json, sys
from engine import validate, route
def compile_plan(ir):
    errors=validate(ir)
    if errors: raise ValueError("; ".join(errors))
    seen=set(); result=[]
    for s in ir["scenes"]:
        sid=s["id"]
        if not isinstance(sid,str) or sid in seen: raise ValueError("invalid or duplicate scene ID")
        seen.add(sid)
        blocks=s.get("blocks",[])
        if not isinstance(blocks,list): raise ValueError("blocks must be array")
        if not blocks: blocks=[{"id":sid+"-main","role":"primary","weight":3},{"id":sid+"-evidence","role":"evidence","weight":1}]
        ids=set(); normalized=[]
        for b in blocks:
            bid=b["id"]; weight=b.get("weight",1)
            if not isinstance(bid,str) or bid in ids or not isinstance(weight,(int,float)) or isinstance(weight,bool) or not 0<weight<=10: raise ValueError("invalid block")
            ids.add(bid); normalized.append({"id":bid,"role":b.get("role","support"),"weight":weight})
        ordered=sorted(normalized,key=lambda b:-b["weight"])
        # Preserve declared reading order on mobile; desktop spans express priority.
        for b in normalized:
            b["span"]={"mobile":12,"tablet":12 if b["weight"]>=3 else 6,"desktop":12 if len(blocks)==1 else 8 if b["weight"]>=3 else 4}
        result.append({"id":sid,"question":s["question"],"before":s["before"],"after":s["after"],"evidence_ids":s["evidence_ids"],"blocks":normalized,"focus":ordered[0]["id"],"chart_screen":route(s["task"],s.get("fields",[]))})
    return {"style":ir["style"],"layout_hint":ir["layout"],"scenes":result,"scope":"layout spans and scene bindings only"}
if __name__=="__main__":
    with open(sys.argv[1],encoding="utf-8") as f: print(json.dumps(compile_plan(json.load(f)),ensure_ascii=False,indent=2))
