"""Build data/processed/ads.jsonl from data/raw/*.txt.

Filename format: YYYYMMDD_<title>.txt
Output: one JSON object per line with id, date, title, text, text_clean, n_words, n_chars.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw"
OUT_PATH = ROOT / "data" / "processed" / "ads.jsonl"

FILENAME_RE = re.compile(r"^(\d{8})_(.+)\.txt$")
ANUNCIO_PREFIX_RE = re.compile(r"^ANUNCIO\s+TV\s*-\s*", re.IGNORECASE)
WORD_RE = re.compile(r"\w+", re.UNICODE)


def strip_emoji(s: str) -> str:
    out = []
    for ch in s:
        cat = unicodedata.category(ch)
        # Drop symbols/other (emoji, pictographs) but keep letters, digits, punctuation, whitespace.
        if cat.startswith("S") or cat == "Co" or cat == "Cn":
            continue
        out.append(ch)
    return "".join(out)


def clean_title(raw_title: str) -> str:
    t = ANUNCIO_PREFIX_RE.sub("", raw_title)
    t = strip_emoji(t)
    t = re.sub(r"\s+", " ", t).strip(" -\t")
    return t


def strip_accents(s: str) -> str:
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(ch for ch in nfkd if not unicodedata.combining(ch))


def clean_text(s: str) -> str:
    s = strip_emoji(s)
    s = strip_accents(s).lower()
    s = re.sub(r"[^\w\s]", " ", s, flags=re.UNICODE)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def parse_date(yyyymmdd: str) -> str:
    return date(int(yyyymmdd[:4]), int(yyyymmdd[4:6]), int(yyyymmdd[6:8])).isoformat()


def build_record(path: Path) -> dict | None:
    m = FILENAME_RE.match(path.name)
    if not m:
        print(f"skip (bad name): {path.name}", file=sys.stderr)
        return None
    yyyymmdd, raw_title = m.groups()
    try:
        d = parse_date(yyyymmdd)
    except ValueError:
        print(f"skip (bad date): {path.name}", file=sys.stderr)
        return None

    text = path.read_text(encoding="utf-8").strip()
    text_clean = clean_text(text)
    tokens = WORD_RE.findall(text_clean)

    return {
        "id": path.stem,
        "date": d,
        "title": clean_title(raw_title),
        "title_raw": raw_title,
        "text": text,
        "text_clean": text_clean,
        "n_words": len(tokens),
        "n_chars": len(text),
    }


def main() -> int:
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    files = sorted(RAW_DIR.glob("*.txt"))
    written = 0
    with OUT_PATH.open("w", encoding="utf-8") as f:
        for p in files:
            rec = build_record(p)
            if rec is None:
                continue
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            written += 1
    print(f"wrote {written}/{len(files)} records to {OUT_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
