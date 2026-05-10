#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/frontend" && npm install --silent && npm run build
cd "$SCRIPT_DIR"
uv run uvicorn main:app --app-dir "$SCRIPT_DIR/backend" --host 0.0.0.0 --port 19999
