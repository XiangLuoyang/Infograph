# V1.2-RC1 acceptance record

Candidate: 0c4f90768f80baf16d560a323c437ed8d96463c2. All five workflows completed successfully on this exact revision.

| Workflow | Run | Artifact ID |
|---|---|---|
| Engine | 45573595875 | 15003262874 |
| Browser | 45573595963 | 15003167210 |
| Golden Six | 45573595898 | 15002513968 |
| Benchmark | 45573596117 | 15002263815 |
| Distribution | 45573595920 | 15002648550 |

Job step conclusions were checked, including build/manifest, specialist HTTP/offline, Master HTTP/offline, schema and static dependency checks. Artifact metadata was confirmed; artifact contents have not been downloaded or independently reviewed. G01–G08 pass on the frozen candidate within the automated test scope. G09 and G10 remain not-run for formal acceptance: automated diagnostics and inventory are not human visual approval or legal clearance. No production visual baseline is approved. Zero real model benchmark runs are evidenced. No public release authorization.

This evidence-only documentation is committed after the candidate; it does not change the tested revision or certify later commits. The formal gate record identifies the candidate explicitly. Any functional change requires a new candidate and same-revision validation.
