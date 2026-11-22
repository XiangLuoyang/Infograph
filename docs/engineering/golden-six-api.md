# Infograph Golden Six · HTML SVG Component API

**Status:** six independently renderable research components using **pure JavaScript + SVG**, no npm and no CDN required for the demo. Not professional CAD/EDA software.

[Demo](../../examples/golden-six/index.html) · [Source](../../examples/golden-six/infograph-gold.js) · [Evidence](../research/golden-six-evidence.md) · [Registry](../../catalog/verified/golden-six.json)

## 1. Quick usage

Serve or open `examples/golden-six/index.html` directly. All code and fixtures are local and should work from `file://`.

Embed one component in any existing HTML dashboard:

```html
<div id="explosion-target"></div>
<input id="explosion-slider" type="range" min="0" max="100" value="75">
<script src="/examples/golden-six/infograph-gold.js"></script>
<script>
  const view = InfographGold.mount(
    document.querySelector('#explosion-target'),
    'exploded',
    {progress: .75, onSelect(item){ console.log(item?.id); }}
  );
  document.querySelector('#explosion-slider').addEventListener('input', e =>
    view.setProgress(Number(e.target.value)/100)
  );
</script>
```

**Supported IDs:** `exploded`, `circuit`, `stratigraphy`, `hr`, `attack`, `rail`.

## 2. Public API

| API | Result | Description |
|---|---|---|
| `InfographGold.info` | array | id, labels, domain, purpose, rule for 6 representations |
| `InfographGold.fixtures` | data object | JSON-serializable synthetic sample data; non-live |
| `InfographGold.verify()` | `{pass,checked,tests}` | 14 invariants over built-in fixture; not industry certification |
| `InfographGold.render(id, state)` | string | standalone SVG markup with fixed `viewBox` |
| `InfographGold.mount(el,id,options)` | handle | render into DOM and enable click/keyboard object selection |
| `handle.setProgress(value)` | void | stage exploder progress from 0 to 1 |
| `handle.select(id)` | void | select a source object by ID |
| `handle.getState()` | JSON | current `selected`, `progress` |
| `handle.destroy()` | void | remove current SVG from container |

Example `onSelect` is called whenever a selection triggers rendering. Use event handlers for drilldowns and dynamic labels. A built-in viewer demonstrates accessible controls and SVG export.

**Limitation:** `mount` is a minimal research API. It does not yet expose a data-injection contract, geometry asset loader, deep-link schema, rendering isolation or a production-grade lifecycle manager. The sample `fixtures` object is returned as a clone; mutating it does not alter hidden renderers. Production components should accept typed external data and validated assets.

## 3. Semantics and implementation layers

```text
Domain reference / source evidence
  -> Domain semantic fixture
  -> SVG reference renderer
  -> UI controls and selection
  -> Independent test invariants
  -> Browser screenshots and accessibility review
```

The SVG library is **illustrative** and prioritizes clarity. For accurate 3D explode geometry use GLB/glTF + Three.js or a CAD workflow; for real schematic nets use KiCad-generated sources; for geologic logs use calibrated depth records; for MITRE matrices use versioned official data rather than the five selected static cards.

## 4. Quality checks

```bash
node --check examples/golden-six/infograph-gold.js
node tests/golden-six.test.mjs
# Browser tests require Playwright and Chromium:
npm install --no-save playwright@1.56.0
npx playwright install chromium
node tests/golden-six.browser.mjs
```

CI definition: [`.github/workflows/golden-six.yml`](../../.github/workflows/golden-six.yml). **Last confirmed full CI run:** [#45040682399 · PASS](https://github.com/XiangLuoyang/Infograph/actions/runs/45040682399), including six Chromium screenshots. Professional accuracy and accessibility expert audit remain separate.

### What is currently checked

- ID uniqueness for 4 exploded parts and 3 electrical components;
- RC source → resistor → capacitor → return net labels;
- geological layer depth contiguity and 14-m thickness sum;
- H-R decreasing temperature axis, log-luminosity mapping and positive inputs;
- selected MITRE tactic and technique ID format;
- train time strictly increasing and distance monotonic by direction;
- SVG output exists for each renderer, no invalid numeric values, and gallery links local script;
- browser smoke checks tab switch, SVG selection, exploding control and mobile width.

### Still to implement

- An independent expert review of all technical drawings and real-world data sources.
- WCAG audit (keyboard navigation is implemented, screen-reader test is not).
- Visual-regression comparison baselines approved by human reviewers.
- Authentic 3D hardware assembly, actual GIS tiles/DEM, DICOM/astronomy inputs and railway operating constraints.
- Full lifecycle robustness (multiple mount/destroy rounds, external data sync, resize performance).

**Do not label EDA/CAD/clinical compliance as passed just because these synthetic smoke checks pass.**
