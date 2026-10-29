#!/usr/bin/env bash
# Check out the open bot PR branch so updates stack on fixes pushed to it, unless it conflicts with trunk.
set -euo pipefail

branch="${1:?branch required}"

# GitHub computes mergeability lazily, so the first query can return UNKNOWN
for _ in {1..10}; do
  mergeable=$(gh pr list --head "$branch" --json mergeable --jq '.[0].mergeable')
  [ "$mergeable" != UNKNOWN ] && break
  sleep 1
done

case "$mergeable" in
  MERGEABLE|UNKNOWN)
    git fetch --no-tags --depth=1 origin "$branch"
    git checkout -q FETCH_HEAD
    ;;
esac
