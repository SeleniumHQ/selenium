#!/usr/bin/env bash
# Add each Bazel invocation's EngFlow link, process counts, and cached test share to the job summary,
# and write the main invocation's numbers to build/remote-cache/record.jsonl for later aggregation.
# This script can be removed with its two bazel.yml steps after collecting data evaluating effectiveness of remote caching.

set -euo pipefail

shopt -s nullglob
logs=(build/bazel-console*.log)
[ ${#logs[@]} -gt 0 ] || exit 0

strip='{ gsub(/\033\[[0-9;]*m/, ""); sub(/^\([0-9:]+\) /, "") }'

awk "$strip"'
  /Streaming build results to: / { sub(/.*Streaming build results to: /, ""); if (!seen[$0]++) print "- Invocation: " $0 }
  /^INFO: [0-9]+ process(es)?: / { sub(/^INFO: /, ""); print "- " $0 }
  $1 ~ /^\/\// && / PASSED in / { tests++; if ($2 == "(cached)") cached++ }
  END { if (tests) printf "- Tests passed from cache: %d of %d\n", cached, tests }
' "${logs[@]}" > build/remote-cache-summary.md

{
  echo "### EngFlow remote cache"
  cat build/remote-cache-summary.md
} >> "${GITHUB_STEP_SUMMARY:-/dev/stdout}"

[ -f build/bazel-console.log ] || exit 0

IFS=$'\t' read -r invocation breakdown hits executed elapsed tests cached < <(awk "$strip"'
  /Streaming build results to: / && !url { sub(/.*Streaming build results to: /, ""); url = $0 }
  /^INFO: [0-9]+ process(es)?: / {
    breakdown = $0; sub(/^INFO: /, "", breakdown); sub(/\.$/, "", breakdown)
    hits = 0; executed = 0
    n = split(breakdown, part, /[:,] /)
    for (i = 2; i <= n; i++) {
      if (part[i] ~ /remote cache hit/) hits += part[i]
      else if (part[i] !~ /internal|cache hit/) executed += part[i]
    }
  }
  /^INFO: Elapsed time: / { elapsed = $4; sub(/s,?$/, "", elapsed) }
  $1 ~ /^\/\// && / PASSED in / { tests++; if ($2 == "(cached)") cached++ }
  END { printf "%s\t%s\t%d\t%d\t%s\t%d\t%d\n", (url ? url : "-"), (breakdown ? breakdown : "-"), hits, executed, (elapsed ? elapsed : 0), tests, cached }
' build/bazel-console.log)

mkdir -p build/remote-cache
jq -cn \
  --arg recorded_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg run_id "${GITHUB_RUN_ID:-}" \
  --arg run_attempt "${GITHUB_RUN_ATTEMPT:-}" \
  --arg event "${GITHUB_EVENT_NAME:-}" \
  --arg job "${JOB_NAME:-}" \
  --arg os "${RUNNER_OS:-}-${RUNNER_ARCH:-}" \
  --arg pr "${PR_NUMBER:-}" \
  --arg sha "${GITHUB_SHA:-}" \
  --arg base_sha "${BASE_SHA:-}" \
  --arg invocation "$invocation" \
  --arg processes "$breakdown" \
  --argjson remote_cache_hits "$hits" \
  --argjson executed "$executed" \
  --argjson elapsed_seconds "$elapsed" \
  --argjson tests "$tests" \
  --argjson cached_tests "$cached" \
  '$ARGS.named' \
  > build/remote-cache/record.jsonl

echo "record=true" >> "${GITHUB_OUTPUT:-/dev/null}"
