#!/usr/bin/env bash
# Aggregate the results.jsonl artifacts written by parse-flaky-results.sh.
#
# Flaky means a target failed and then passed within the same run, either on a
# retry or in the debug rerun. Every job feeding this report has the rerun, so a
# run that never went green failed every chance it had. That is never counted as
# a flake; a target whose last FAILING_RUNS runs all ended that way is failing.
#
# Both halves of the rate come from the records themselves: every execution is
# one sample, so nothing here assumes how often anything is scheduled. If a
# target is run by five jobs on the same OS, that is five samples; if the
# schedule doubles, the denominator doubles on its own.
#
# A target is tracked per operating system, since the same label passing on Linux
# and flaking on Windows is one flaky test, not two halves of one.
#
# The rate is measured over WINDOW_DAYS rather than the week being reported on,
# because a week is too few samples to divide by. Recency is kept separately: a
# target is only reported if it flaked within RECENT_DAYS, so one that was fixed
# drops out immediately even though its flakes are still inside the rate window.
#
# Runs per target are too few for a percentage threshold to mean anything more
# than a count, so what gets reported is decided by MIN_FLAKES alone.

set -euo pipefail

WINDOW_DAYS=21
RECENT_DAYS=7
MIN_FLAKES=2
FAILING_RUNS=2
REPO="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY must be set}"

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

days_ago() {
  date -u -d "$1 days ago" +"$2" 2>/dev/null || date -u -v-"$1"d +"$2"
}

window_start=$(days_ago "$WINDOW_DAYS" %Y-%m-%dT%H:%M:%SZ)
recent_start=$(days_ago "$RECENT_DAYS" %Y-%m-%dT%H:%M:%SZ)

# A run that merged its per-job results is represented by that one file; any
# other run falls back to the artifacts its jobs uploaded. That covers a workflow
# with a single test job, which has nothing to merge, and a run whose merge job
# failed. Fetch a day of slack and let the record timestamps do the windowing.
fetch_from=$(days_ago "$((WINDOW_DAYS + 1))" %Y-%m-%dT%H:%M:%SZ)
echo "Collecting results created since $fetch_from"
gh api "repos/$REPO/actions/artifacts" --paginate \
  --jq '.artifacts[] | select(.expired == false)
        | select((.name | startswith("flaky-")) or (.name | startswith("merged-flaky-results-")))
        | [.id, .created_at, .workflow_run.id, .name] | @tsv' \
  > "$WORK/artifacts.tsv"

awk -F'\t' -v from="$fetch_from" '
  $2 > from {
    row[++n] = $0
    if ($4 ~ /^merged-flaky-results-/) merged[$3] = 1
  }
  END {
    for (i = 1; i <= n; i++) {
      split(row[i], f, "\t")
      if (f[4] ~ /^merged-flaky-results-/ || !(f[3] in merged)) print f[1]
    }
  }' "$WORK/artifacts.tsv" > "$WORK/wanted.txt"

available=$(wc -l < "$WORK/wanted.txt" | tr -d ' ')
downloaded=0
: > "$WORK/all.jsonl"
while IFS= read -r id; do
  gh api "repos/$REPO/actions/artifacts/$id/zip" > "$WORK/artifact.zip" || continue
  unzip -p "$WORK/artifact.zip" results.jsonl >> "$WORK/all.jsonl" || continue
  downloaded=$((downloaded + 1))
done < "$WORK/wanted.txt"

if [ "$downloaded" -lt "$available" ]; then
  echo "::warning::Only $downloaded of $available result files in the window could be read; rates below are based on an incomplete sample."
fi
echo "Read $downloaded of $available result files"

jq -s --arg recent "$recent_start" --arg window "$window_start" --argjson minFlakes "$MIN_FLAKES" '
  map(select(.timestamp >= $window))
  | group_by([.target, .os])
  | map(
      [.[] | select(.status | endswith("-recovered")) | .timestamp] as $flakes
      | {
          target: .[0].target,
          os: .[0].os,
          ran: length,
          flaked: ($flakes | length),
          failed: ([.[] | select(.status == "failed")] | length),
          last: ($flakes | max),
          # Every flake it has is recent, so it started this week.
          new: (($flakes | min // "9999") >= $recent)
        }
      | . + {
          rate: (.flaked * 100 / .ran),
          # Still happening, so worth someone looking at it now.
          reported: (.flaked >= $minFlakes and .last >= $recent)
        })
  | map(select(.flaked > 0))
  | sort_by((.reported | not), -.rate, .target)
' "$WORK/all.jsonl" > "$WORK/report.json"

# The latest run must be recent so a target dropped from the schedule while
# failing is not reported for the rest of the window.
jq -s --arg recent "$recent_start" --arg window "$window_start" --argjson failingRuns "$FAILING_RUNS" '
  map(select(.timestamp >= $window))
  | group_by([.target, .os])
  | map(
      sort_by(.timestamp)
      | {
          target: .[0].target,
          os: .[0].os,
          streak: ([.[].status == "failed"] | reverse | index(false) // length),
          lastRan: .[-1].timestamp,
          lastPassed: ([.[] | select(.status != "failed") | .timestamp] | max)
        })
  | map(select(.streak >= $failingRuns and .lastRan >= $recent))
  | sort_by(-.streak, .target)
' "$WORK/all.jsonl" > "$WORK/failing.json"

{
  echo "## Failing tests"
  echo
  echo "Failed every attempt, including the debug rerun, in at least their last $FAILING_RUNS runs."
  echo
  if jq -e 'length > 0' "$WORK/failing.json" > /dev/null; then
    echo "| target | os | failed in a row | last passed |"
    echo "|---|---|---|---|"
    jq -r '.[] | "| `\(.target)` | \(.os) | \(.streak) | \(.lastPassed // "not in window") |"' "$WORK/failing.json"
  else
    echo "None."
  fi
  echo
  echo "## Flaky tests"
  echo
  echo "Every execution counts as one sample, taken from $downloaded scheduled runs over the last $WINDOW_DAYS days."
  echo "Reported to Slack when a target flaked at least $MIN_FLAKES times, at least once within the last $RECENT_DAYS days."
  echo "Runs that never went green are counted under failed, not as flakes."
  echo
  echo "| target | os | flaked | failed | of runs | rate | reported | new | last flaked |"
  echo "|---|---|---|---|---|---|---|---|---|"
  jq -r '.[] | "| `\(.target)` | \(.os) | \(.flaked) | \(.failed) | \(.ran) | \(.rate | round)% | \(if .reported then "yes" else "" end) | \(if .new then "yes" else "" end) | \(.last) |"' "$WORK/report.json"
} > "$WORK/report.md"

# Every flaky target, whatever the thresholds say. The thresholds only decide
# whether Slack hears about it, so a manual run is a full list of what is known
# to be flaky — the thing to check a suspicious PR failure against.
cat "$WORK/report.md"
cat "$WORK/report.md" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"

failing=$(jq 'length' "$WORK/failing.json")
flaky=$(jq '[.[] | select(.reported)] | length' "$WORK/report.json")

if [ "$failing" -eq 0 ] && [ "$flaky" -eq 0 ]; then
  echo "Nothing to report: no target failed its last $FAILING_RUNS runs or flaked at least $MIN_FLAKES times with one in the last $RECENT_DAYS days."
  exit 0
fi

{
  echo "notify=true"
  echo "message=$failing failing, $flaky flaky targets"
} >> "${GITHUB_OUTPUT:-/dev/null}"
