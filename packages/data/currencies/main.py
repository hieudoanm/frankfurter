"""Convert `csv/*.csv` to `json/*.json` as a single object `{ "key": "value", ... }` (UTF-8)."""

from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CSV_DIR = ROOT / "csv"
JSON_DIR = ROOT / "json"


def _resolve_key_value_headers(fieldnames: list[str]) -> tuple[str, str]:
    if len(fieldnames) < 2:
        msg = f"Need at least two columns for key/value mapping, got: {fieldnames!r}"
        raise ValueError(msg)
    by_stripped = {h.strip(): h for h in fieldnames}
    if "symbol" in by_stripped and "name" in by_stripped:
        return by_stripped["symbol"], by_stripped["name"]
    return fieldnames[0], fieldnames[1]


def csv_to_key_value(path: Path) -> dict[str, str]:
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames is None:
            return {}
        headers = list(reader.fieldnames)
        key_col, val_col = _resolve_key_value_headers(headers)
        out: dict[str, str] = {}
        for row in reader:
            key = (row.get(key_col) or "").strip()
            val = (row.get(val_col) or "").strip()
            if key:
                out[key] = val
        return out


def convert_all() -> list[Path]:
    JSON_DIR.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []
    for csv_path in sorted(CSV_DIR.glob("*.csv")):
        mapping = csv_to_key_value(csv_path)
        out_path = JSON_DIR / f"{csv_path.stem}.json"
        out_path.write_text(
            json.dumps(mapping, indent=2, ensure_ascii=False, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        written.append(out_path)
    return written


def main() -> None:
    if not CSV_DIR.is_dir():
        raise SystemExit(f"Missing CSV directory: {CSV_DIR}")

    paths = convert_all()
    if not paths:
        print(f"No .csv files in {CSV_DIR}")
        return

    for p in paths:
        data = json.loads(p.read_text(encoding="utf-8"))
        print(f"Wrote {p} ({len(data)} entries)")


if __name__ == "__main__":
    main()
