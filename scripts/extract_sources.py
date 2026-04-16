#!/usr/bin/env python3

from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
GENERATED_DIR = ROOT / "src" / "content" / "generated"
EXTRACTED_DIR = GENERATED_DIR / "extracted"
MANIFEST_PATH = GENERATED_DIR / "source-manifest.json"

SUPPORTED_SUFFIXES = {
    ".docx",
    ".jpeg",
    ".jpg",
    ".md",
    ".mp4",
    ".pdf",
    ".png",
    ".pptx",
    ".sh",
    ".txt",
}

EXCLUDED_GLOBS = (
    "sandbox/test-files/**",
)


def run_command(command: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=ROOT,
        check=check,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )


def slugify_path(path: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", path.lower())
    base = re.sub(r"-{2,}", "-", base).strip("-")
    digest = hashlib.sha1(path.encode("utf-8")).hexdigest()[:8]
    if base:
        return f"{base}-{digest}"
    return digest


def detect_kind(relative_path: str, suffix: str) -> str:
    if relative_path.startswith("notes/") or relative_path == "README.md":
        return "note"
    if relative_path.startswith("sandbox/"):
        return "sandbox"
    if relative_path.startswith("base-files/project/"):
        return "project"
    if suffix == ".docx":
        return "docx"
    if suffix == ".pptx":
        return "pptx"
    if suffix == ".pdf":
        return "pdf"
    return "note"


def read_text_file(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def extract_docx(path: Path) -> str:
    return run_command(["pandoc", str(path), "-t", "markdown"]).stdout


def extract_pptx(path: Path) -> str:
    import zipfile
    from xml.etree import ElementTree as ET

    namespace = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
    slides: list[str] = []

    with zipfile.ZipFile(path) as archive:
      slide_paths = sorted(
          name
          for name in archive.namelist()
          if name.startswith("ppt/slides/slide") and name.endswith(".xml")
      )

      for index, slide_path in enumerate(slide_paths, start=1):
          root = ET.fromstring(archive.read(slide_path))
          texts = [node.text.strip() for node in root.findall(".//a:t", namespace) if node.text and node.text.strip()]
          if texts:
              slides.append(f"## Slide {index}\n\n" + "\n".join(texts))

    return "\n\n".join(slides)


def pdf_page_count(path: Path) -> int:
    if shutil.which("pdfinfo"):
        output = run_command(["pdfinfo", str(path)]).stdout
        match = re.search(r"Pages:\s+(\d+)", output)
        if match:
            return int(match.group(1))

    if shutil.which("mdls"):
        output = run_command(["mdls", "-name", "kMDItemNumberOfPages", str(path)], check=False).stdout
        match = re.search(r"=\s+(\d+)", output)
        if match:
            return int(match.group(1))

    return 1


def ocr_pdf_page(path: Path, page_number: int) -> str:
    if not shutil.which("pdftoppm") or not shutil.which("tesseract"):
        return ""

    with tempfile.TemporaryDirectory() as temp_dir:
        prefix = Path(temp_dir) / "page"
        run_command(
            [
                "pdftoppm",
                "-f",
                str(page_number),
                "-l",
                str(page_number),
                "-r",
                "150",
                "-png",
                str(path),
                str(prefix),
            ]
        )
        image_path = prefix.with_name(f"{prefix.name}-1.png")
        if not image_path.exists():
            return ""

        command = ["tesseract", str(image_path), "stdout", "--psm", "6"]
        try:
            return run_command(command, check=False).stdout
        except subprocess.CalledProcessError:
            return ""


def extract_pdf(path: Path) -> tuple[str, dict[str, Any]]:
    pages = pdf_page_count(path)
    metadata: dict[str, Any] = {"pageCount": pages, "ocrPages": []}
    page_texts: list[str] = []

    for page_number in range(1, pages + 1):
        text = ""
        if shutil.which("pdftotext"):
            text = run_command(
                ["pdftotext", "-f", str(page_number), "-l", str(page_number), "-layout", str(path), "-"],
                check=False,
            ).stdout

        if len(re.sub(r"\s+", "", text)) < 200:
            ocr_text = ocr_pdf_page(path, page_number)
            if len(re.sub(r"\s+", "", ocr_text)) > len(re.sub(r"\s+", "", text)):
                text = ocr_text
                metadata["ocrPages"].append(page_number)

        if text.strip():
            page_texts.append(f"## Page {page_number}\n\n{text.strip()}")

    return "\n\n".join(page_texts), metadata


def detect_language(text: str, kind: str) -> str:
    cjk_count = len(re.findall(r"[\u4e00-\u9fff]", text))
    latin_count = len(re.findall(r"[A-Za-z]", text))

    if kind in {"sandbox", "project"} and cjk_count and latin_count:
        return "mixed"
    if cjk_count > max(20, latin_count // 2):
        return "zh"
    if cjk_count and latin_count:
        return "mixed"
    return "fr"


def write_extracted_text(asset_id: str, text: str) -> str | None:
    if not text.strip():
        return None

    EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
    target = EXTRACTED_DIR / f"{asset_id}.md"
    target.write_text(text, encoding="utf-8")
    return str(target.relative_to(ROOT))


def should_include(path: Path) -> bool:
    if path.name.startswith("."):
        return False
    if path.is_symlink():
        return False
    if not path.exists():
        return False
    if path.is_dir():
        return False
    relative_path = str(path.relative_to(ROOT))
    if any(path.match(pattern) or relative_path.startswith(pattern.rstrip("**")) for pattern in EXCLUDED_GLOBS):
        return False
    if path.suffix.lower() in SUPPORTED_SUFFIXES:
        return True
    return path.name == "chat"


def iter_sources() -> list[Path]:
    sources = [ROOT / "README.md"]
    for base in [ROOT / "notes", ROOT / "sandbox", ROOT / "base-files"]:
        for path in sorted(base.rglob("*")):
            if path.is_file() and str(path.relative_to(ROOT)).startswith("base-files/from-teacher/"):
                continue
            if should_include(path):
                sources.append(path)
    return sources


def extract_text(path: Path, kind: str) -> tuple[str, dict[str, Any]]:
    suffix = path.suffix.lower()

    if suffix in {".md", ".txt", ".sh"} or path.name == "chat":
        return read_text_file(path), {}
    if suffix == ".docx":
        return extract_docx(path), {}
    if suffix == ".pptx":
        return extract_pptx(path), {}
    if suffix == ".pdf":
        return extract_pdf(path)
    return "", {}


def main() -> None:
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    manifest: list[dict[str, Any]] = []

    for source_path in iter_sources():
        relative_path = str(source_path.relative_to(ROOT))
        kind = detect_kind(relative_path, source_path.suffix.lower())
        asset_id = slugify_path(relative_path)
        display_name = source_path.stem if source_path.suffix else source_path.name

        text, metadata = extract_text(source_path, kind)
        extracted_path = write_extracted_text(asset_id, text)

        excerpt = re.sub(r"\s+", " ", text).strip()[:280]
        language = detect_language(text or display_name, kind)

        manifest.append(
            {
                "id": asset_id,
                "displayName": display_name,
                "path": relative_path,
                "kind": kind,
                "language": language,
                "extractedTextPath": extracted_path,
                "coverageStatus": "needs-review",
                "excerpt": excerpt,
                "publicPath": None,
                **metadata,
            }
        )

    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(manifest)} source assets to {MANIFEST_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        print(exc.stdout, file=sys.stderr)
        print(exc.stderr, file=sys.stderr)
        raise
