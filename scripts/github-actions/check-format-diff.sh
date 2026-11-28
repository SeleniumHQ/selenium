#!/usr/bin/env bash
# Fail a lint job when the formatters it ran changed tracked files.
set -euo pipefail

if ! git diff --quiet; then
  echo "::error::Code needs formatting. Run './go format' locally and push changes."
  git diff
  exit 1
fi
