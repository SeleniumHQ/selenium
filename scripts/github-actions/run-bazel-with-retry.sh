#!/usr/bin/env bash
# Run the Bazel command supplied via the BAZEL_RUN_CMD environment variable,
# retrying up to a few times on transient GitHub CDN errors (HTTP 5xx during
# repo fetch). For any other failure, exits with Bazel's actual exit code so
# downstream "rerun with debug" behavior triggers normally.
#
# Usage: BAZEL_RUN_CMD="<bazel command>" run-bazel-with-retry.sh

set -uo pipefail

: "${BAZEL_RUN_CMD:?usage: BAZEL_RUN_CMD=\"<bazel command>\" $0}"
LOG_FILE="${BAZEL_CONSOLE_LOG:-build/bazel-console.log}"
BAZEL_MAX_ATTEMPTS=3
mkdir -p "$(dirname "$LOG_FILE")"

# Matches Bazel's HttpConnector error format for 502/503/504 responses
BAZEL_ERROR_PATTERN='GET returned 50[234] '

for i in $(seq 1 "$BAZEL_MAX_ATTEMPTS"); do
  bash -c "$BAZEL_RUN_CMD" 2>&1 | tee "$LOG_FILE"
  BAZEL_EXIT_CODE=${PIPESTATUS[0]}

  if [ "$BAZEL_EXIT_CODE" -eq 0 ]; then
    exit 0
  fi

  if grep -qE "$BAZEL_ERROR_PATTERN" "$LOG_FILE"; then
    if [ "$i" -ge "$BAZEL_MAX_ATTEMPTS" ]; then
      break
    fi
    SLEEP=$((15 * i))
    {
      echo "⚠️ Transient CDN error detected (5xx). Retrying in ${SLEEP}s... (attempt $i of $BAZEL_MAX_ATTEMPTS)"
      grep -E "$BAZEL_ERROR_PATTERN" "$LOG_FILE" | head -5
    } >&2
    sleep "$SLEEP"
  else
    exit "$BAZEL_EXIT_CODE"
  fi
done

echo "❌ Exhausted retries for CDN errors after $BAZEL_MAX_ATTEMPTS attempts." >&2
exit "$BAZEL_EXIT_CODE"
