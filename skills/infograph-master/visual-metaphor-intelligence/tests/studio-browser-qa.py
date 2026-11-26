"""Trusted local VMI Studio browser smoke test; requires playwright + Chromium.
Run from VMI root: python tests/studio-browser-qa.py studio/visual-metaphor-studio.html qa-output
This is not an aesthetic or independent comprehension evaluation.
"""
import sys, json, hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
src=Path(sys.argv[1]); out=Path(sys.argv[2]); out.mkdir(parents=True,exist_ok=True)
html=src.read_text(encoding="utf-8")
report={"artifactSha256":hashlib.sha256(src.read_bytes()).hexdigest(),"checks":[]}
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width,height in [(1440,1000),(390,844)]:
        page=browser.new_page(viewport={"width":width,"height":height},accept_downloads=True,reduced_motion="reduce")
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        page.set_content(html,wait_until="load")
        frame=page.frame_locator("#preview")
        frame.locator("h1").wait_for()
        assert page.locator("#results article").count()>0
        assert page.locator("#download").is_enabled()
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
        frame.locator('[data-state="relief"]').click()
        assert frame.locator("#state-label").inner_text()=="外部干预"
        frame.locator('[data-focus="b"]').click()
        assert frame.locator('[data-detail="b"]').is_visible()
        frame.locator('[data-style-choice="工业风"]').click()
        assert frame.locator("body").get_attribute("data-style")=="工业风"
        assert frame.locator("#state-label").inner_text()=="外部干预"
        assert frame.locator('[data-detail="b"]').is_visible()
        assert frame.locator("body").evaluate("(el)=>el.ownerDocument.documentElement.scrollWidth <= el.ownerDocument.defaultView.innerWidth + 1")
        page.screenshot(path=str(out/f"studio-{width}.png"),full_page=True)
        with page.expect_download() as dl:
            page.locator("#download").click()
        dl.value.save_as(out/f"scene-{width}.html")
        assert "NOT TO SCALE" in (out/f"scene-{width}.html").read_text(encoding="utf-8")
        page.locator("details").filter(has_text="评审记录 / reviews").locator("summary").click()
        page.locator("#reviews").fill("[]")
        assert page.locator("#download").is_disabled()
        page.locator("#run").click()
        assert page.locator("#download").is_disabled()
        assert "fails P3" in page.locator("#status").inner_text()
        page.locator("#reset").click()
        frame.locator("h1").wait_for()
        assert page.locator("#download").is_enabled()
        page.locator("#perspectives").fill("invalid json")
        page.locator("#run").click()
        assert page.locator("#download").is_disabled()
        assert "错误" in page.locator("#status").inner_text()
        assert not errors, errors
        report["checks"].append({"viewport":[width,height],"status":"pass","scope":"browser smoke, download, error handling, state/style/focus, overflow; screenshot not human-reviewed"})
        page.close()
    browser.close()
(out/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(report,ensure_ascii=False))
