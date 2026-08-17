#!/usr/bin/env bash
# Parse the Bazel console log into one record per test target that actually ran,
# so the weekly report has both halves of a flake rate: how often a target ran,
# and how often it only passed because it was retried.
#
# Two ways a test shows up as flaky:
#   retry-recovered  bazel's own --flaky_test_attempts saved it in place
#   rerun-recovered  it failed the run outright, then passed in the debug rerun
#
# Cached results are skipped. A replayed result is not an execution and cannot
# flake, so counting it would inflate the denominator.

set -euo pipefail

FAILURES=build/failures
RESULTS="$FAILURES/results.tsv"

mkdir -p "$FAILURES"
: > "$RESULTS"

[ -f build/bazel-console.log ] || exit 0

# Bazel's test summary, once colours are stripped (it runs with --color=yes):
#   //foo:bar  PASSED in 1.2s
#   //foo:bar  (cached) PASSED in 0.0s
#   //foo:bar  FLAKY, failed in 1 out of 2 in 3.4s
#   //foo:bar  FAILED in 2 out of 2 in 12.0s
#   //foo:bar  FAILED in 2.0s          <- no retries configured
awk -v out="$RESULTS" '
  { gsub(/\033\[[0-9;]*m/, "") }
  $1 !~ /^\/\// { next }
  $2 == "(cached)" { next }
  $2 ~ /^FLAKY/ { print $1 "\tretry-recovered\t" $5 "\t" $8 > out; next }
  $3 != "in" { next }
  $2 == "PASSED" { print $1 "\tpassed\t0\t1" > out; next }
  $2 ~ /(FAILED|TIMEOUT|INCOMPLETE)/ {
    if ($5 == "out") { print $1 "\tfailed\t" $4 "\t" $7 > out }
    else { print $1 "\tfailed\t1\t1" > out }
  }
' build/bazel-console.log

# _run2.txt exists only once rerun-failures.sh has actually rerun something.
# Anything that failed the main run and passed the rerun was flaky across the
# whole sequence, and the rerun contributes the passing attempt: failing twice
# before it goes green is 2 of 3.
if [ -f "$FAILURES/_run2.txt" ]; then
  comm -23 <(sort "$FAILURES/_run1.txt") <(sort "$FAILURES/_run2.txt") > "$FAILURES/_recovered.txt"
  awk -F'\t' -v recovered="$FAILURES/_recovered.txt" '
    BEGIN { while ((getline t < recovered) > 0) { recover[t] = 1 } }
    $1 in recover { print $1 "\trerun-recovered\t" $3 "\t" ($4 + 1); next }
    { print }
  ' "$RESULTS" > "$RESULTS.tmp" && mv "$RESULTS.tmp" "$RESULTS"
fi

[ -s "$RESULTS" ] || exit 0

if awk -F'\t' '$2 ~ /-recovered$/ { found = 1 } END { exit !found }' "$RESULTS"; then
  {
    echo "### Flaky tests"
    echo
    awk -F'\t' '$2 ~ /-recovered$/ { printf "- `%s` failed %s of %s attempts (%s)\n", $1, $3, $4, $2 }' "$RESULTS"
    echo
  } >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
fi

jq -Rc \
  --arg os "${RUNNER_OS:-}" \
  --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  'select(length > 0) | split("\t")
   | { target: .[0], status: .[1], failed: (.[2] | tonumber), attempts: (.[3] | tonumber),
       os: $os, timestamp: $timestamp }' \
  "$RESULTS" > "$FAILURES/results.jsonl"

echo "results=true" >> "${GITHUB_OUTPUT:-/dev/null}"
echo "Recorded $(wc -l < "$RESULTS" | tr -d ' ') test results"
