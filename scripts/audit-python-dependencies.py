import json
import hashlib
from importlib.metadata import distributions

rows = []
for dist in distributions():
    meta = dist.metadata
    notices = []
    for item in dist.files or []:
        if not any(part.lower().startswith(("license", "licence", "copying", "notice")) for part in item.parts):
            continue
        path = dist.locate_file(item)
        if path.is_file():
            data = path.read_bytes()
            notices.append({"file": str(item), "sha256": hashlib.sha256(data).hexdigest(), "text": data.decode("utf-8", errors="replace")})
    rows.append({"name": meta.get("Name"), "version": dist.version, "license": meta.get("License"), "licenseExpression": meta.get("License-Expression"), "classifiers": [x for x in meta.get_all("Classifier", []) if x.startswith("License")], "requires": dist.requires or [], "notices": notices})
print(json.dumps({"version": 1, "scope": "python-validation-environment", "packages": sorted(rows, key=lambda r: (r["name"] or "").lower()), "limitations": "Installed metadata only; not a redistribution authorization."}, indent=2))
