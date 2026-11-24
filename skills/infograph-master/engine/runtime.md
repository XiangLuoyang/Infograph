# Runtime prototype
Run from engine:
node render-cli.mjs design-v2.example.json runtime-data.example.json output.html

Supported: ranking (nonnegative horizontal bars) and lookup (numeric table), style tokens, font family, compiled grid spans, responsive single column, evidence metadata. Input data is separate and keyed by block ID. Missing/unused data, invalid values, unit mismatch and unsupported tasks are rejected. Spatial objects and transitions are rejected rather than silently discarded. Material is not applied and is explicitly disclosed. Output is static, no scripts. No independent verification of evidence, accessibility or visual quality. Seven inline checks executed successfully; browser not tested. The sample thesis is supplied, not inferred from the data. Freeform authoring remains available.
