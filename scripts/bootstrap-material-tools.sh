#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="$ROOT_DIR/.venv"

ensure_brew_package() {
  local pkg="$1"
  if ! brew list --versions "$pkg" >/dev/null 2>&1; then
    brew install "$pkg"
  fi
}

ensure_brew_cask() {
  local pkg="$1"
  if ! brew list --cask --versions "$pkg" >/dev/null 2>&1; then
    brew install --cask "$pkg"
  fi
}

ensure_libreoffice() {
  if command -v soffice >/dev/null 2>&1; then
    return 0
  fi

  if brew list --cask --versions libreoffice >/dev/null 2>&1 || brew list --cask --versions libreoffice-still >/dev/null 2>&1; then
    return 0
  fi

  if brew install --cask libreoffice; then
    return 0
  fi

  echo "brew cask libreoffice failed, trying libreoffice-still..." >&2
  if brew install --cask libreoffice-still; then
    return 0
  fi

  echo "LibreOffice casks are currently stale in Homebrew. Use the official download page if soffice is required:" >&2
  echo "https://www.libreoffice.org/download/download-libreoffice/" >&2
}

ensure_brew_package poppler
ensure_brew_package qpdf
ensure_brew_package tesseract
ensure_libreoffice

if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
python -m pip install --upgrade pip
python -m pip install pypdf pdfplumber "markitdown[pptx]" python-pptx pdf2image pytesseract

echo "Bootstrapped material tools into $VENV_DIR"
