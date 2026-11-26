import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
const suites=["quality-depth","narrative-director","interaction-choreography","concept-art-pipeline","motion-completeness","global-spatial-composition","workspace-integration"];
const cwd=fileURLToPath(new URL(".",import.meta.url));
let failed=false;
for(const suite of suites){
 console.log("\n=== "+suite+" ===");
 const result=spawnSync(process.execPath,["test-"+suite+".mjs"],{cwd,stdio:"inherit"});
 if(result.error||result.status!==0){failed=true;console.error("FAIL suite "+suite,result.error??result.status);}
}
if(failed)process.exitCode=1;
else console.log("PASS all seven quality-depth suites; not a rendered or human acceptance test.");
