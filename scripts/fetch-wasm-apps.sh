#!/usr/bin/env bash
# Download self-contained web builds of the ArtCraft Rust apps (WordCraft /
# PdfCraft / CADCraft / GridCraft) from their official GitHub Releases and unpack
# them into public/wasm-apps/<app>/ so the gallery can embed them via iframe.
#
# Usage:
#   bash scripts/fetch-wasm-apps.sh           # skip apps already fetched
#   bash scripts/fetch-wasm-apps.sh --force   # re-download and overwrite
#
# The zips are relative-path builds (public_url "./"), so they can be served
# from any sub-path — including the GitHub Pages BASE_URL of this project.

set -euo pipefail

# --- Versions (update here when a new release comes out) ---------------------
WORDCRAFT_VERSION="0.5.0"
PDFCRAFT_VERSION="0.6.0"
CADCRAFT_VERSION="0.5.0"
GRIDCRAFT_VERSION="0.7.0"
# -----------------------------------------------------------------------------

FORCE=0
if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${REPO_ROOT}/public/wasm-apps"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

fetch_app() {
  local repo="$1" version="$2" app_dir="$3"
  local url="https://github.com/storytold/${repo}/releases/download/v${version}/${app_dir}-web-${version}.zip"
  local dest="${TARGET_DIR}/${app_dir}"

  if [[ ${FORCE} -eq 0 && -f "${dest}/index.html" ]]; then
    echo "[skip] ${app_dir}: ${dest}/index.html already exists (use --force to refresh)"
    return 0
  fi

  echo "[fetch] ${app_dir} v${version} from ${url}"
  local zip_file="${TMP_DIR}/${app_dir}.zip"
  curl -fL --retry 3 -o "${zip_file}" "${url}"

  rm -rf "${dest}"
  mkdir -p "${dest}"
  unzip -q -o "${zip_file}" -d "${dest}"

  # If the zip has a single top-level directory, hoist its contents.
  if [[ ! -f "${dest}/index.html" ]]; then
    local inner
    inner="$(find "${dest}" -mindepth 1 -maxdepth 2 -name index.html -print -quit)"
    if [[ -n "${inner}" ]]; then
      local inner_dir
      inner_dir="$(dirname "${inner}")"
      mv "${inner_dir}" "${TMP_DIR}/${app_dir}-hoisted"
      rm -rf "${dest}"
      mv "${TMP_DIR}/${app_dir}-hoisted" "${dest}"
    fi
  fi

  if [[ ! -f "${dest}/index.html" ]]; then
    echo "error: ${dest}/index.html not found after unpacking — zip layout changed?" >&2
    exit 1
  fi

  echo "[ok] ${app_dir}: $(du -sh "${dest}" | cut -f1) -> ${dest}"
}

mkdir -p "${TARGET_DIR}"
fetch_app "wordcraft" "${WORDCRAFT_VERSION}" "wordcraft"
fetch_app "pdfcraft" "${PDFCRAFT_VERSION}" "pdfcraft"
fetch_app "cadcraft" "${CADCRAFT_VERSION}" "cadcraft"
fetch_app "gridcraft" "${GRIDCRAFT_VERSION}" "gridcraft"

echo "done. apps are in ${TARGET_DIR}"
