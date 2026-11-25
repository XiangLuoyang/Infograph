import json
from pathlib import Path
from jsonschema import Draft202012Validator
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
ROOT = Path(__file__).resolve().parents[1]
def read(path):
    return json.loads(path.read_text(encoding="utf-8"))
def main():
    entries = read(ROOT / "scripts/contracts.json")
    failures = []
    for entry in entries:
        path = ROOT / entry["schema"]
        schema = read(path)
        Draft202012Validator.check_schema(schema)
        registry = Registry()
        for p in path.parent.glob("*.schema.json"):
            registry = registry.with_resource(p.resolve().as_uri(), Resource.from_contents(read(p), default_specification=DRAFT202012))
        validator = Draft202012Validator({"$ref": path.resolve().as_uri()}, registry=registry)
        data = read(ROOT / entry["fixture"])
        errors = list(validator.iter_errors(data))
        if errors:
            failures.extend(f'{entry["id"]}: {list(e.absolute_path)}: {e.message}' for e in errors)
        else:
            print(f'{entry["id"]}: structural PASS')
    if failures:
        raise SystemExit("\n".join(failures))
if __name__ == "__main__":
    main()
