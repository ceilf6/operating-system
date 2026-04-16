#!/usr/bin/env python3

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
GENERATED_DIR = ROOT / "src" / "content" / "generated"
SEARCH_INDEX_PATH = GENERATED_DIR / "search-index.json"
CHAPTERS_DIR = GENERATED_DIR / "chapters"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def clean_text(value: str) -> str:
    value = re.sub(r"`{1,3}.*?`{1,3}", " ", value, flags=re.S)
    value = re.sub(r"[*_#>\-\[\]()]", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def build_index() -> list[dict[str, Any]]:
    glossary = load_json(GENERATED_DIR / "glossary.json")
    note_pages = load_json(GENERATED_DIR / "notes.json")
    sandboxes = load_json(GENERATED_DIR / "sandboxes.json")
    td_pages = load_json(GENERATED_DIR / "td-pages.json")
    records: list[dict[str, Any]] = []

    for chapter_file in sorted(CHAPTERS_DIR.glob("*.json")):
        chapter = load_json(chapter_file)
        records.append(
            {
                "id": chapter["slug"],
                "route": f"/course/{chapter['slug']}",
                "title": chapter["title"],
                "excerpt": chapter["summary"],
                "chapterSlug": chapter["slug"],
                "kind": "section",
                "keywords": chapter["searchKeywords"] + chapter["sourceIds"],
            }
        )
        for section in chapter["sections"]:
            snippet = ""
            for block in section["blocks"]:
                if block["type"] == "overview":
                    snippet = clean_text(block["content"])
                    break
            records.append(
                {
                    "id": f"{chapter['slug']}::{section['id']}",
                    "route": f"/course/{chapter['slug']}#{section['anchor']}",
                    "title": f"{chapter['title']} / {section['title']}",
                    "excerpt": snippet,
                    "chapterSlug": chapter["slug"],
                    "kind": "section",
                    "keywords": chapter["searchKeywords"] + section.get("sourceIds", []) + section.get("glossaryIds", []),
                }
            )

    for entry in glossary:
        records.append(
            {
                "id": f"glossary::{entry['id']}",
                "route": "/glossary",
                "title": entry["term"],
                "excerpt": entry["definition"],
                "chapterSlug": entry["chapterSlug"],
                "kind": "glossary",
                "keywords": [entry["term"], entry["chapterSlug"]],
            }
        )

    for note in note_pages:
        records.append(
            {
                "id": f"note::{note['id']}",
                "route": f"/notes/{note['slug']}",
                "title": note["title"],
                "excerpt": note["summary"],
                "chapterSlug": note["primaryChapterSlug"],
                "kind": "note",
                "keywords": note["keywords"] + note["chapterSlugs"] + note["relatedTdSlugs"],
            }
        )

    for td in td_pages:
        records.append(
            {
                "id": f"td::{td['id']}",
                "route": f"/tds/{td['slug']}",
                "title": td["title"],
                "excerpt": td["summary"],
                "chapterSlug": td["chapterSlug"],
                "kind": "td",
                "keywords": td["keywords"] + td["sourceIds"] + td["sandboxIds"],
            }
        )

    for sandbox in sandboxes:
        records.append(
            {
                "id": f"sandbox::{sandbox['id']}",
                "route": f"/practice/{sandbox['slug']}",
                "title": sandbox["title"],
                "excerpt": sandbox["summary"],
                "chapterSlug": sandbox["chapterSlugs"][0] if sandbox["chapterSlugs"] else None,
                "kind": "sandbox",
                "keywords": sandbox["conceptTargets"] + sandbox["chapterSlugs"],
            }
        )

    return records


def main() -> None:
    records = build_index()
    SEARCH_INDEX_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(records)} search records to {SEARCH_INDEX_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
