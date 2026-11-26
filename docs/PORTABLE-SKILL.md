# Infograph V1.3.0 portable skills (internal candidate)

## Build and verify

From a clean repository checkout with Git and Node.js 22:

```sh
node scripts/audit-skill-discovery.mjs .
node scripts/test-skill-discovery.mjs
node scripts/build-portable-skill.mjs
node scripts/verify-portable-skill.mjs dist/portable-skill
```

The builder requires a fresh output directory. Copy the entire dist/portable-skill directory to the destination; preserve its repository-relative layout. Do not copy only SKILL.md.

From the copied directory:

```sh
node scripts/verify-portable-skill.mjs .
node scripts/audit-skill-discovery.mjs .
node scripts/audit-knowledge-index.mjs
cd skills/infograph-master/engine
node test-master-engine.mjs
node test-skill-package.mjs
node test-reconstruction-orchestrator.mjs
node test-quality-depth-suite.mjs
```

Register the three immediate children of skills/ as entries (see skills/manifest.json): infograph-master, narrative-design, visual-metaphor-intelligence. The default entry remains skills/infograph-master/SKILL.md and resolve repo: references from the portable root. Follow the context guide; do not inject the entire package into model context. Repository mode is preferred when file access is available; inline mode is a limited fallback. Host-specific installation, permissions and tool mappings remain unverified.

## Evidence

Distribution CI run 45570754629 at 97f4f4ce7d920b226435d41565efa7e59492be73 verified 523 packaged files, knowledge integrity and the two core engine tests after relocation outside the checkout. This is scoped Linux/Node evidence, not a platform certification or full offline browser test.

## Distribution boundary

Internal candidate only. Manifest hashes detect corruption relative to the manifest, not publisher authenticity. No public distribution authorization or root license has been established. Third-party assets and dependencies require review. The package includes source and documentation, not installed dependencies or built browser studios. Actual model effectiveness remains unmeasured. Do not claim V1.3.0 release acceptance from this test alone.

## Existing-artifact redesign
Use the latest full checkout/package, not an earlier downloaded SKILL.md. The skill entry routes existing dashboard optimization to references/reconstruction-entry.md (relative to the skill). A compact manual path works without Node/Playwright; the staged CLI provides declared evidence/plan checks where dependencies and tool access are available. The distribution test checks relocated orchestration logic, not real model adherence, browser behavior or automatic improvement. Do not mount benchmark answers in blind generation environments.

## Discovery and host installation
Update the full checkout to current main (or pin the candidate commit); rebuild in a clean output directory. If the host supports scanning a local skill collection, point it at the package's skills directory and refresh its registry. For hosts that install one directory at a time, register all three named entry directories while preserving the full checkout or granting read access to it. Exact commands and cache refresh differ by host. Do not assume that copying a lone SKILL.md or selecting only VMI installs the full engine.

The VMI public entry moved to skills/visual-metaphor-intelligence/SKILL.md; the original implementation stays in skills/infograph-master/visual-metaphor-intelligence, with its former nested SKILL.md renamed GUIDE.md. This avoids duplicate recursive registration and preserves implementation-relative imports. VMI standalone entry offers an independent manual workflow when sibling files are inaccessible; full VMI engine requires the complete repository layout. No engine mirror is maintained. Old packages need rebuilding and old duplicate cached entries may need removal via the host's normal skill-management UI.
