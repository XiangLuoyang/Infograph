import assert from "node:assert/strict";
import {auditVisualOpportunity} from "../engine/visual-opportunity.mjs";
const fixture={
  "revision": 1,
  "inventory": [
    {
      "id": "a",
      "page": "one",
      "ref": "fixture:a"
    },
    {
      "id": "b",
      "page": "two",
      "ref": "fixture:b"
    }
  ],
  "slices": [
    {
      "id": "a",
      "revision": 1,
      "task": "rank",
      "relation": "comparison",
      "ref": "fixture:a",
      "selectedFamily": "bar",
      "candidates": [
        "bar",
        "dot"
      ],
      "rationale": "shared scale",
      "rendererPlan": "SVG",
      "mechanism": "none",
      "expression": "convert",
      "expressionReason": "ranking",
      "exactAccess": "table"
    },
    {
      "id": "b",
      "revision": 1,
      "task": "change",
      "relation": "temporal",
      "ref": "fixture:b",
      "selectedFamily": "bar",
      "candidates": [
        "bar",
        "slope"
      ],
      "rationale": "shared scale",
      "rendererPlan": "SVG",
      "mechanism": "reviewed",
      "expression": "retain",
      "expressionReason": "exact lookup",
      "exactAccess": "table"
    }
  ],
  "globalReviews": [
    {
      "family": "bar",
      "ids": [
        "a",
        "b"
      ],
      "revision": 1,
      "decision": "retain",
      "reason": "common-scale comparison",
      "ref": "fixture:review"
    }
  ],
  "renderReview": {
    "revision": 1,
    "status": "pass",
    "ref": "synthetic review record",
    "artifactRef": "synthetic fixture"
  }
};
function runTests(audit,fixture,check){
 const cp=()=>JSON.parse(JSON.stringify(fixture));
 let f=cp();check(audit(f).declaredReviewComplete,"valid declaration");
 f=cp();f.globalReviews=[];check(!audit(f).designEligible&&audit(f).repetition.length===1,"cross-task repetition");
 f=cp();f.slices.pop();check(audit(f).issues.some(x=>x.code==="uncovered"),"coverage");
 f=cp();f.slices[0].exactAccess="";check(audit(f).issues.some(x=>x.code==="expression-evidence"),"exact access");
 f=cp();f.slices[0].mechanism="selected";check(audit(f).issues.some(x=>x.code==="mechanism-evidence"),"metaphor evidence");
 f=cp();f.renderReview.status="not-run";check(audit(f).designEligible&&!audit(f).declaredReviewComplete,"design vs rendered review");
 f=cp();f.slices[0].revision=0;check(!audit(f).designEligible,"stale");
 f=cp();f.globalReviews[0].decision="recompose";check(audit(f).issues.some(x=>x.code==="global-recomposition-pending"),"unresolved recompose");
 f=cp();f.slices[1].task=f.slices[0].task;f.slices[1].relation=f.slices[0].relation;f.globalReviews=[];check(audit(f).designEligible,"legitimate same-task repetition");
 f=cp();f.slices[1].selectedFamily="slope";f.globalReviews=[];check(audit(f).designEligible,"different families no quota");
}
runTests(auditVisualOpportunity,fixture,(ok,msg)=>assert.ok(ok,msg));
console.log("10 visual opportunity assertions passed");
