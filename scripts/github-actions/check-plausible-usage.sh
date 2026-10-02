#!/usr/bin/env bash
#
# Fail when Plausible pageviews for the last seven complete days exceed a threshold.
#
# Selenium Manager telemetry is billed against a Plausible plan, and sustained
# overage locks the dashboard, so we watch the trailing week and raise an alarm
# with enough headroom to react.
#
# Requires PLAUSIBLE_STATS_KEY. PLAUSIBLE_SITE_ID, PLAUSIBLE_THRESHOLD and
# PLAUSIBLE_MONTHLY_LIMIT may be set to override the defaults.

set -euo pipefail

SITE_ID="${PLAUSIBLE_SITE_ID:-manager.selenium.dev}"
THRESHOLD="${PLAUSIBLE_THRESHOLD:-17000000}"
MONTHLY_LIMIT="${PLAUSIBLE_MONTHLY_LIMIT:-75000000}"

: "${PLAUSIBLE_STATS_KEY:?PLAUSIBLE_STATS_KEY is required}"

millions() {
  awk -v n="$1" 'BEGIN { v = n / 1000000; printf (v == int(v) ? "%d" : "%.1f"), v }'
}

# Yesterday back six days; Plausible's period=7d rolls into today's partial data.
if date -u -d 'yesterday' +%F >/dev/null 2>&1; then
  END="$(date -u -d 'yesterday' +%F)"
  START="$(date -u -d '7 days ago' +%F)"
else # BSD/macOS date
  END="$(date -u -v-1d +%F)"
  START="$(date -u -v-7d +%F)"
fi

echo "Site:      ${SITE_ID}"
echo "Window:    ${START} to ${END}"
echo "Threshold: $(millions "$THRESHOLD")M per week, $(millions "$MONTHLY_LIMIT")M per month"

# The status code is appended so a 4xx body reaches the log instead of being
# swallowed by the failing assignment.
if ! response="$(curl --silent --show-error --write-out '\n%{http_code}' \
  --get "https://plausible.io/api/v1/stats/aggregate" \
  --header "Authorization: Bearer ${PLAUSIBLE_STATS_KEY}" \
  --data-urlencode "site_id=${SITE_ID}" \
  --data-urlencode "period=custom" \
  --data-urlencode "date=${START},${END}" \
  --data-urlencode "metrics=pageviews")"; then
  echo "::error::Could not reach the Plausible API"
  exit 1
fi

http_code="${response##*$'\n'}"
body="${response%$'\n'*}"

echo "Response:  HTTP ${http_code} ${body}"

if [[ "$http_code" != 200 ]]; then
  echo "::error::Plausible API returned HTTP ${http_code}"
  exit 1
fi

pageviews="$(jq -r '.results.pageviews.value // empty' <<<"$body" 2>/dev/null || true)"

if [[ ! "$pageviews" =~ ^[0-9]+$ ]]; then
  echo "::error::No pageviews value in the Plausible response"
  exit 1
fi

over=false
direction=under
if ((pageviews > THRESHOLD)); then
  over=true
  direction=over
fi

monthly="$(awk -v p="$pageviews" 'BEGIN { printf "%d", p / 7 * 30 }')"
percent="$(awk -v p="$pageviews" -v t="$THRESHOLD" 'BEGIN { printf "%.0f", (p - t) / t * 100 }')"

report="Plausible stats are ${percent#-}% ${direction} budget for last week"

echo "$report"
echo "On pace for $(millions "$monthly")M this month, against a $(millions "$MONTHLY_LIMIT")M limit"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "pageviews=${pageviews}"
    echo "percent=${percent#-}"
    echo "monthly=${monthly}"
    echo "start=${START}"
    echo "end=${END}"
    echo "over=${over}"
    echo "report=${report}"
  } >>"$GITHUB_OUTPUT"
fi

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  echo "$report" >>"$GITHUB_STEP_SUMMARY"
fi

if [[ "$over" == true ]]; then
  echo "::error::${report}"
  exit 1
fi
