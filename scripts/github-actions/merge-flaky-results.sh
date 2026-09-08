#!/usr/bin/env bash
# Concatenate the per-job result artifacts of a workflow run into one file, so
# the weekly report reads a couple of files a day rather than one per job.
#
# Only runs that fan out across many jobs need this. The report prefers a run's
# merged file and otherwise reads the per-job artifacts, so a workflow with a
# single test job needs no merge step and a failed merge still reports.

set -euo pipefail

SRC="${1:-build/flaky-artifacts}"
OUT=build/flaky

mkdir -p "$OUT"
: > "$OUT/results.jsonl"

jobs=0
if [ -d "$SRC" ]; then
  jobs=$(find "$SRC" -name results.jsonl | wc -l | tr -d ' ')
fi

if [ "$jobs" -eq 0 ]; then
  echo "No result artifacts were downloaded; nothing to merge."
  exit 0
fi

find "$SRC" -name results.jsonl -exec cat {} + >> "$OUT/results.jsonl"

echo "results=true" >> "${GITHUB_OUTPUT:-/dev/null}"
echo "Merged $jobs job artifacts into $(wc -l < "$OUT/results.jsonl" | tr -d ' ') records"
