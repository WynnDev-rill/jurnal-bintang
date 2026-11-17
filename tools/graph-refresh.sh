#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v graphify >/dev/null || { echo 'Install: uv tool install -r tools/requirements-graph.txt (or uv tool install "graphifyy[watch]==0.9.111")' >&2; exit 1; }
graphify extract . --code-only --force
graphify cluster-only . --no-label
python3 tools/localize-graph.py
graphify query 'EditorViewModel autosave Room' --budget 1200
