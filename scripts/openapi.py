"""The API's OpenAPI document, for the generated reference (`task refs`):
written to src/data/openapi.json from a ../api checkout, run in its
environment (`uv run --project ../api python scripts/openapi.py`)."""

import json
from pathlib import Path

from registry_api.main import app

out = Path(__file__).resolve().parent.parent / "src" / "data" / "openapi.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(app.openapi(), indent=1, ensure_ascii=False) + "\n")
print(f"{out}: {app.version}")
