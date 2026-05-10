#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/frontend" && npm install --silent && npm run build
cd "$(dirname "$0")"
uv run uvicorn main:app --app-dir backend --host 0.0.0.0 --port 19999
