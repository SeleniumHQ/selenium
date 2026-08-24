#!/usr/bin/env bash
# Aggregate the results.jsonl artifacts written by parse-flaky-results.sh.
#
# Flaky means a target did not pass first time in at least one run but ended
# green in at least one. That covers a test saved by a retry, one that only
# passed in the debug rerun, and one that simply fails some days and passes
# others — the last being the only kind visible in jobs configured without
# retries or a rerun.
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

set -euo pipefail

WINDOW_DAYS="${WINDOW_DAYS:-21}"
RECENT_DAYS="${RECENT_DAYS:-7}"
MIN_RUNS="${MIN_RUNS:-15}"
MIN_RATE="${MIN_RATE:-5}"
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

jq -s --arg recent "$recent_start" --arg window "$window_start" '
  map(select(.timestamp >= $window))
  | group_by([.target, .os])
  | map(
      [.[] | select(.status != "passed")] as $bad
      | {
          target: .[0].target,
          os: .[0].os,
          ran: length,
          # Ended green, whether first time or only after a retry.
          succeeded: ([.[] | select(.status != "failed")] | length),
          flaked: ($bad | length),
          failed: ([$bad[].failed] | add // 0),
          attempts: ([$bad[].attempts] | add // 0),
          outcomes: ([$bad[].status] | unique | sort | join(", ")),
          last: ([$bad[].timestamp] | max)
        }
      | . + {
          rate: (if .ran > 0 then (.flaked * 100 / .ran) else 0 end),
          # Still happening, so worth someone looking at it now.
          recent: (.last != null and .last >= $recent),
          # Every failure it has is recent, so it started this week.
          new: ((([$bad[].timestamp] | min) // "9999") >= $recent)
        })
  # Flaky means it did not pass first time in at least one run, but did end green
  # at least once. A target that never ended green is broken rather than flaky;
  # one that always passed first time is simply fine. Needing a retry every single
  # run counts as 100% flaky, not as broken.
  | map(select(.flaked > 0 and .succeeded > 0))
  | sort_by(-.rate, .target)
' "$WORK/all.jsonl" > "$WORK/report.json"

{
  echo "## Flaky tests"
  echo
  echo "Every execution counts as one sample, taken from $downloaded scheduled runs over the last $WINDOW_DAYS days."
  echo "Reported to Slack when a target flaked within the last $RECENT_DAYS days, ran at least $MIN_RUNS times, and flaked in more than $MIN_RATE% of them."
  echo
  echo "| target | os | failed | of runs | rate | attempts failed | still failing | new | outcomes | last seen |"
  echo "|---|---|---|---|---|---|---|---|---|---|"
  jq -r '.[] | "| `\(.target)` | \(.os) | \(.flaked) | \(.ran) | \(.rate | round)% | \(.failed) of \(.attempts) | \(if .recent then "yes" else "" end) | \(if .new then "yes" else "" end) | \(.outcomes) | \(.last) |"' "$WORK/report.json"
} > "$WORK/report.md"

# Every flaky target, whatever the thresholds say. The thresholds only decide
# whether Slack hears about it, so a manual run is a full list of what is known
# to be flaky — the thing to check a suspicious PR failure against.
cat "$WORK/report.md"
cat "$WORK/report.md" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"

# Rate is compared unrounded so nothing crosses the threshold only because the
# table rounded it up. MIN_RUNS keeps a barely-sampled target from reporting one
# flake out of three runs as a 33% failure rate.
significant=$(jq --argjson minRate "$MIN_RATE" --argjson minRuns "$MIN_RUNS" \
  '[.[] | select(.recent and .ran >= $minRuns and .rate > $minRate)] | length' "$WORK/report.json")

if [ "$significant" -eq 0 ]; then
  echo "Nothing to report: no target flaked in the last $RECENT_DAYS days in more than $MIN_RATE% of at least $MIN_RUNS runs."
  exit 0
fi

[ "$significant" -eq 1 ] && noun=target || noun=targets
{
  echo "flaky=true"
  echo "message=$significant $noun failed in > ${MIN_RATE}% of runs"
} >> "${GITHUB_OUTPUT:-/dev/null}"
