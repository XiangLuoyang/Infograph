# Infograph V1.2 portable skill (internal candidate)

## Build and verify

From a clean repository checkout with Git and Node.js 22:

```sh
node scripts/build-portable-skill.mjs
node scripts/verify-portable-skill.mjs dist/portable-skill
```

The builder requires a fresh output directory. Copy the entire dist/portable-skill directory to the destination; preserve its repository-relative layout. Do not copy only SKILL.md.

From the copied directory:

```sh
node scripts/verify-portable-skill.mjs .
node scripts/audit-knowledge-index.mjs
cd skills/infograph-master/engine
node test-master-engine.mjs
node test-skill-package.mjs
```

Use skills/infograph-master/SKILL.md as the entry instruction and resolve repo: references from the portable root. Follow the context guide; do not inject the entire package into model context. Repository mode is preferred when file access is available; inline mode is a limited fallback. Host-specific installation, permissions and tool mappings remain unverified.

## Evidence

Distribution CI run 45570754629 at 97f4f4ce7d920b226435d41565efa7e59492be73 verified 523 packaged files, knowledge integrity and the two core engine tests after relocation outside the checkout. This is scoped Linux/Node evidence, not a platform certification or full offline browser test.

## Distribution boundary

Internal candidate only. Manifest hashes detect corruption relative to the manifest, not publisher authenticity. No public distribution authorization or root license has been established. Third-party assets and dependencies require review. The package includes source and documentation, not installed dependencies or built browser studios. Actual model effectiveness remains unmeasured. Do not claim V1.2 release acceptance from this test alone.
