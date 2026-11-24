import json,sys,pathlib
ROOT=pathlib.Path(__file__).parent
def load(name): return json.loads((ROOT/name).read_text(encoding="utf-8"))
def route(task,fields):
    rule=next((r for r in load("chart-rules.json") if r["task"]==task),None)
    if rule is None: return {"status":"unknown-task","candidates":[]}
    missing=sorted(set(rule["requires"])-set(fields))
    return {"status":"missing-fields" if missing else "candidate-only","missing":missing,"candidates":[] if missing else rule["types"]}
def validate(ir):
    errors=[]
    if not isinstance(ir,dict): return ["IR must be object"]
    for k in ("audience","purpose","style","layout","evidence","scenes"):
        if k not in ir: errors.append("missing "+k)
    if ir.get("style") not in [x["id"] for x in load("styles.json")]: errors.append("unknown style")
    if ir.get("layout") not in [x["id"] for x in load("layouts.json")]: errors.append("unknown layout")
    evidence=ir.get("evidence",[]); scenes=ir.get("scenes",[])
    if not isinstance(evidence,list) or not isinstance(scenes,list): return errors+["evidence and scenes must be arrays"]
    if any(not isinstance(e,dict) for e in evidence+scenes): return errors+["entries must be objects"]
    ids=[e.get("id") for e in evidence]
    if any(not isinstance(i,str) or not i for i in ids): return errors+["invalid evidence ID"]
    if len(set(ids))!=len(ids): errors.append("duplicate evidence IDs")
    if not scenes: errors.append("no scenes")
    for s in scenes:
        for k in ("id","question","before","after","task","evidence_ids"):
            if not s.get(k): errors.append("scene missing "+k)
        refs=s.get("evidence_ids",[])
        if not isinstance(refs,list) or any(not isinstance(i,str) or i not in ids for i in refs): errors.append("invalid evidence references")
    return errors
if __name__=="__main__":
    if len(sys.argv)!=2: sys.exit("usage: python engine.py design.json")
    errors=validate(json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")))
    print(json.dumps({"errors":errors,"scope":"structural checks only"},ensure_ascii=False))
    sys.exit(bool(errors))
