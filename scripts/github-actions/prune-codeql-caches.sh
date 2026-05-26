#!/usr/bin/env bash
#
# Prune stale CodeQL Actions caches, keeping only the most recently created
# entry per cache "group". CodeQL's default setup creates a new
# overlay-base-database cache per commit and never reaps the old ones, which
# pushes the repo over the 10 GiB per-repo cache budget.
#
# Grouping:
#   codeql-overlay-base-database-* -> strip trailing "-<sha>-<runid>-1"
#   codeql-dependencies-*          -> exact key (GH allows duplicate keys)
#
# Requires GH_TOKEN with `actions: write`. Default is dry-run; pass --delete
# to actually remove caches. Safe to run concurrently from multiple jobs: a
# delete that races with another job just returns "not found", which is
# treated as success.

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

declare -A newest_id newest_time

for row in "${rows[@]}"; do
  IFS=$'\t' read -r id key created <<<"$row"

  if [[ "$key" == codeql-overlay-base-database-* ]]; then
    group=$(printf '%s' "$key" | sed -E 's/-[0-9a-f]{40}-[0-9]+-1$//')
  else
    group="$key"
  fi

  # ISO8601 sorts lexicographically; keep the newest per group.
  if [[ -z "${newest_time[$group]:-}" || "$created" > "${newest_time[$group]}" ]]; then
    newest_time[$group]="$created"
    newest_id[$group]="$id"
  fi
done

echo "Groups found: ${#newest_id[@]}"
for g in "${!newest_id[@]}"; do
  echo "  keep id=${newest_id[$g]} @ ${newest_time[$g]}  ($g)"
done
echo

deleted=0
for row in "${rows[@]}"; do
  IFS=$'\t' read -r id key created <<<"$row"

  if [[ "$key" == codeql-overlay-base-database-* ]]; then
    group=$(printf '%s' "$key" | sed -E 's/-[0-9a-f]{40}-[0-9]+-1$//')
  else
    group="$key"
  fi

  [[ "$id" == "${newest_id[$group]}" ]] && continue

  if (( DELETE )); then
    # Tolerate races: another concurrent job may have already deleted it.
    if out=$(gh cache delete "$id" 2>&1); then
      echo "deleted id=$id key=$key"
    elif printf '%s' "$out" | grep -qi 'not found\|HTTP 404'; then
      echo "already gone id=$id key=$key"
    else
      echo "::warning::failed to delete id=$id: $out"
      continue
    fi
  else
    echo "would delete id=$id key=$key"
  fi
  deleted=$((deleted + 1))
done

echo
echo "Total $( (( DELETE )) && echo removed || echo to remove ): $deleted"
(( DELETE )) || echo "(dry run — re-run with --delete to apply)"
