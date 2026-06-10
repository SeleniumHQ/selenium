#!/usr/bin/env bash
#
# Delete ALL CodeQL Actions caches.
#
# CodeQL's default setup creates a new cache per commit and never reaps old
# ones. We reclaim the entire CodeQL slice of the 10 GiB per-repo budget.
# CodeQL continues to work without a cache — it just re-fetches on each run.
#
# Requires GH_TOKEN with `actions: write`. Default is dry-run; pass --delete
# to actually remove caches.

set -euo pipefail

DELETE=0
if [[ "${1:-}" == "--delete" ]]; then
  DELETE=1
fi

mapfile -t rows < <(
  gh cache list --key "codeql" --limit 1000 \
    --json id,key,createdAt \
    --jq '.[] | [.id, .key, .createdAt] | @tsv'
)

echo "CodeQL caches found: ${#rows[@]}"

deleted=0
for row in "${rows[@]}"; do
  IFS=$'\t' read -r id key created <<<"$row"

  if (( DELETE )); then
    if out=$(gh cache delete "$id" 2>&1); then
      echo "deleted id=$id key=$key"
    elif printf '%s' "$out" | grep -qi 'not found\|HTTP 404'; then
      echo "already gone id=$id key=$key"
    else
      echo "::warning::failed to delete id=$id: $out"
      continue
    fi
  else
    echo "would delete id=$id key=$key ($created)"
  fi
  deleted=$((deleted + 1))
done

echo
echo "Total $( (( DELETE )) && echo removed || echo to remove ): $deleted"
(( DELETE )) || echo "(dry run — re-run with --delete to apply)"
