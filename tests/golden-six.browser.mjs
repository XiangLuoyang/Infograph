import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {chromium} from "playwright";

const root=resolve(import.meta.dirname,"..");
const pageUrl=pathToFileURL(resolve(root,"examples/golden-six/index.html")).href;
const outDir=resolve(root,"test-artifacts/golden-six");
await mkdir(outDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1024},deviceScaleFactor:1});
const errors=[];
page.on("pageerror",e=>errors.push(e.message));
page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});
try {
  await page.goto(pageUrl,{waitUntil:"load"});
  await page.locator("#scene svg").waitFor({timeout:12000});
  assert.equal(await page.locator(".tab").count(),6);
  assert.match(await page.locator("#checks").textContent(),/14 \/ 14/);

  for(const type of ["exploded","circuit","stratigraphy","hr","attack","rail"]){
    await page.locator('.tab[data-type="'+type+'"]').click();
    assert.equal(await page.locator("#scene").getAttribute("data-type"),type);
    assert.equal(await page.locator("#scene svg").getAttribute("viewBox"),"0 0 980 550");
    assert.ok((await page.locator("#scene [data-key]").count())>0,type+" has selectable SVG items");
    await page.locator("#scene svg").screenshot({path:resolve(outDir,type+".png")});
  }
  await page.locator('.tab[data-type="exploded"]').click();
  await page.locator("#explode").fill("100");
  assert.equal(await page.locator("#scene").getAttribute("data-progress"),"1","explosion should reflect slider");
  await page.locator('#scene [data-key="rotor"]').click();
  assert.equal(await page.locator("#scene").getAttribute("data-selected"),"rotor");
  assert.match(await page.locator("#selected-title").textContent(),/Rotor/);

  await page.locator('.tab[data-type="circuit"]').click();
  await page.locator('#scene [data-key="C1"]').click();
  assert.equal(await page.locator("#scene").getAttribute("data-selected"),"C1");

  await page.setViewportSize({width:390,height:844});
  for(const type of ["exploded","hr","rail"]){
    await page.locator('.tab[data-type="'+type+'"]').click();
    assert.ok(await page.locator("#scene svg").isVisible(),type+" visible on mobile");
    const w=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,view:window.innerWidth}));
    assert.ok(w.doc<=w.view+5,"unwanted horizontal overflow in "+type+" "+JSON.stringify(w));
  }
  assert.deepEqual(errors,[],"browser errors");
  console.log("PASS: 6 Chrome SVG renders, interactive selection, explode slider, mobile layout; screenshots created.");
} finally {
  await page.close();
  await browser.close();
}
