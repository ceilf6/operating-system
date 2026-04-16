#!/usr/bin/env python3
"""
One-time helper:
Convert selected files under `base-files/` into symlinks pointing to their
corresponding files under `notes/` (same Git repository), so GitHub viewers
see the target content.
"""

from __future__ import annotations

import argparse
import difflib
import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple


TD_RE = re.compile(r"TD\s*([0-9]+)", flags=re.IGNORECASE)
RANGE_RE = re.compile(r"(\d{1,2}-\d{1,2})")
COURSE_PREFIX_RE = re.compile(r"^(\d{1,2})(?:[_-]|$)")


def read_text_normalized(p: Path) -> str:
    # Normalize to improve similarity matching:
    # - normalize newlines
    # - drop common non-essential metadata lines
    # - trim trailing spaces
    b = p.read_bytes()
    s = b.decode("utf-8", errors="replace")
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    if s.startswith("\ufeff"):
        s = s[1:]
    out_lines: List[str] = []
    for ln in s.split("\n"):
        t = ln.strip()
        if t.startswith("oai_citation:"):
            continue
        if "sediment://file_" in ln:
            continue
        if re.match(r"^---\s*$", ln):
            continue
        out_lines.append(re.sub(r"[ \t]+$", "", ln))
    return "\n".join(out_lines).strip()


def similarity(a: str, b: str) -> float:
    # Full-file ratio is fine here (small dataset).
    return difflib.SequenceMatcher(None, a, b).ratio()


@dataclass(frozen=True)
class Candidate:
    path: Path
    method: str  # for diagnostics


def discover_md_files(d: Path) -> List[Path]:
    if not d.exists():
        return []
    return sorted([p for p in d.rglob("*.md") if p.is_file()])


def choose_candidate_for_base(
    base_path: Path,
    notes_paths: List[Path],
    notes_text: Dict[Path, str],
) -> Tuple[Optional[Candidate], float]:
    stem = base_path.stem

    range_m = RANGE_RE.search(stem)
    range_key = range_m.group(1) if range_m else None

    course_m = COURSE_PREFIX_RE.match(stem)
    course_key = course_m.group(1) if course_m else None

    td_nums = [int(x) for x in TD_RE.findall(stem)]

    notes_by_name = {p.name: p for p in notes_paths}

    # Always compute normalized base only once for similarity.
    base_norm = read_text_normalized(base_path)
    # Keep a small cache for speed (not strictly needed).
    base_norm = base_norm[:200_000]

    candidates: List[Candidate] = []

    # Priority 1: exact range match (e.g. "12-02_...md" -> "12-02.md")
    if range_key:
        target = notes_by_name.get(f"{range_key}.md")
        if target:
            candidates.append(Candidate(path=target, method="exact-range"))

    # Priority 2: exact course match (e.g. "16_...md" -> "16.md")
    if course_key:
        target = notes_by_name.get(f"{course_key}.md")
        if target:
            candidates.append(Candidate(path=target, method="exact-course"))

    # Priority 3: exact TD match (e.g. "13_...TD6..." -> "13-TD6.md")
    if course_key and td_nums:
        for td in td_nums:
            target = notes_by_name.get(f"{course_key}-TD{td}.md")
            if target:
                candidates.append(Candidate(path=target, method="exact-td"))

    # Priority 4: prefix-course match (e.g. "07_...md" -> "07-awk.md")
    if course_key:
        for np in notes_paths:
            if np.name.startswith(f"{course_key}-"):
                candidates.append(Candidate(path=np, method="prefix-course"))

    # Deduplicate by path (method priority isn't tracked here; similarity will pick one).
    unique_by_path: Dict[Path, Candidate] = {}
    for c in candidates:
        unique_by_path.setdefault(c.path, c)
    candidates = list(unique_by_path.values())

    if candidates:
        best = None
        best_score = -1.0
        for c in candidates:
            ntext = notes_text[c.path][:200_000]
            score = similarity(base_norm, ntext)
            if score > best_score:
                best_score = score
                best = c
        assert best is not None
        return best, best_score

    # Fallback: fuzzy-all best match.
    best_fuzzy = None
    best_score = -1.0
    for np in notes_paths:
        score = similarity(base_norm, notes_text[np][:200_000])
        if score > best_score:
            best_score = score
            best_fuzzy = Candidate(path=np, method="fuzzy-all")
    return best_fuzzy, best_score


def apply_symlink(base_path: Path, target_notes_path: Path) -> None:
    # Make a relative symlink so it stays valid if repo is moved.
    rel_target = os.path.relpath(target_notes_path, start=base_path.parent)
    # Replace existing regular file.
    if base_path.exists() or base_path.is_symlink():
        if base_path.is_symlink():
            base_path.unlink()
        else:
            base_path.unlink()
    os.symlink(rel_target, base_path)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-dir", default="base-files", help="Path to base-files directory")
    ap.add_argument("--notes-dir", default="notes", help="Path to notes directory")
    ap.add_argument("--dry-run", action="store_true", help="Only print what would be changed")
    ap.add_argument("--apply", action="store_true", help="Actually replace files with symlinks")
    ap.add_argument(
        "--min-score",
        type=float,
        default=0.88,
        help="Only apply symlinks for mappings with similarity >= this score",
    )
    ap.add_argument(
        "--mapping-out",
        default="scripts/link-base-files-to-notes.mapping.json",
        help="Write mapping diagnostics JSON to this path",
    )
    args = ap.parse_args()

    if not args.dry_run and not args.apply:
        raise SystemExit("Must pass either --dry-run or --apply (or both).")
    if args.dry_run and args.apply:
        # This is allowed but can be confusing; keep it explicit.
        raise SystemExit("Use either --dry-run or --apply, not both.")

    repo_root = Path(".").resolve()
    base_dir = (repo_root / args.base_dir).resolve()
    notes_dir = (repo_root / args.notes_dir).resolve()

    base_paths = discover_md_files(base_dir)
    notes_paths = discover_md_files(notes_dir)

    if not base_paths:
        raise SystemExit(f"No .md files found under {base_dir}")
    if not notes_paths:
        raise SystemExit(f"No .md files found under {notes_dir}")

    notes_text: Dict[Path, str] = {p: read_text_normalized(p) for p in notes_paths}

    mappings = []
    selected = 0
    for bp in base_paths:
        cand, score = choose_candidate_for_base(bp, notes_paths, notes_text)
        if cand is None:
            continue
        is_selected = score >= float(args.min_score)
        if is_selected:
            selected += 1

        mappings.append(
            {
                "base": str(bp.relative_to(repo_root)),
                "notes": str(cand.path.relative_to(repo_root)),
                "score": score,
                "method": cand.method,
                "selected_for_apply": is_selected,
            }
        )

    # Sort by confidence first for easier reading.
    mappings_sorted = sorted(mappings, key=lambda x: x["score"], reverse=True)

    mapping_out = (repo_root / args.mapping_out).resolve()
    mapping_out.parent.mkdir(parents=True, exist_ok=True)
    mapping_out.write_text(json.dumps(mappings_sorted, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Base md files: {len(base_paths)}")
    print(f"Notes md files: {len(notes_paths)}")
    print(f"Min score for apply: {args.min_score}")
    print(f"Selected for apply: {selected}")
    print("")

    for m in mappings_sorted:
        mark = "YES" if m["selected_for_apply"] else "no"
        print(
            f"{mark:>3}  {m['base']}  ->  {m['notes']}  "
            f"(score={m['score']:.3f}, method={m['method']})"
        )

    print("")
    print(f"Mapping diagnostics written to: {mapping_out.relative_to(repo_root)}")

    if args.apply:
        print("Applying symlinks...")
        for m in mappings_sorted:
            if not m["selected_for_apply"]:
                continue
            bp = repo_root / m["base"]
            np = repo_root / m["notes"]
            if not np.exists():
                raise SystemExit(f"Target does not exist: {np}")
            if bp == np:
                raise SystemExit(f"Refusing to link file to itself: {bp}")
            apply_symlink(bp, np)
        print("Done.")


if __name__ == "__main__":
    main()

