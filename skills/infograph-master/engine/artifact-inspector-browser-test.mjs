import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {inspectArtifact} from './artifact-inspector.mjs';
const dir=await mkdtemp(join(tmpdir(),'ig-inspect-'));try{
const p=join(dir,'fixture.html');await writeFile(p,`<!doctype html><h1>Resource report</h1><section id="s"><h2>Evidence</h2><table id="t"><caption>Values</caption><tr><th>Metric</th><td>12</td></tr></table><label for="f">Region</label><select id="f"><option>A</option><option selected>B</option></select><script type="application/json" id="data">{"stock":12}</script><script>document.body.innerHTML='<p id="executed">BAD</p>'</script><input type="password" value="secret"><svg id="c"><title>Chart</title></svg></section>`);
const a=await inspectArtifact(p);assert.ok(a.nodes.some(n=>n.key==='t'&&n.value.rows[0][1].text==='12'));assert.ok(a.nodes.some(n=>n.key==='f'&&n.label==='Region'&&n.value.options[1].selected));assert.ok(a.nodes.some(n=>n.key==='data'&&n.value.data.stock===12));assert.ok(a.nodes.some(n=>n.key==='c'&&n.label==='Chart'));assert.ok(!a.nodes.some(n=>n.key==='executed'));assert.ok(!JSON.stringify(a).includes('secret'));assert.equal(a.coverage.behavior,'not-run');console.log('static browser fixture passed');
}finally{await rm(dir,{recursive:true,force:true})}
