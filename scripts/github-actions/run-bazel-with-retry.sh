#!/usr/bin/env bash
# Run the given Bazel command, retrying up to a few times on transient
# GitHub CDN errors (HTTP 5xx during repo fetch). For any other failure,
# exits with Bazel's actual exit code so downstream "rerun with debug"
# behavior triggers normally.
#
# Usage: run-bazel-with-retry.sh "<bazel command string>"

set -uo pipefail

CMD="${1:?usage: $0 \"<bazel command>\"}"
LOG_FILE="${BAZEL_CONSOLE_LOG:-build/bazel-console.log}"
BAZEL_MAX_ATTEMPTS=3
mkdir -p "$(dirname "$LOG_FILE")"

# Matches Bazel's HttpConnector error format for 502/503/504 responses
BAZEL_ERROR_PATTERN='GET returned 50[234] '

for i in $(seq 1 "$BAZEL_MAX_ATTEMPTS"); do
  # shellcheck disable=SC2086 # CMD is intentionally evaluated as a shell command
  bash -c "$CMD" 2>&1 | tee "$LOG_FILE"
  BAZEL_EXIT_CODE=${PIPESTATUS[0]}

  if [ "$BAZEL_EXIT_CODE" -eq 0 ]; then
    exit 0
  fi

  if grep -qE "BAZEL_ERROR_PATTERN" "$LOG_FILE"; then
    if [ "$i" -ge "$BAZEL_MAX_ATTEMPTS" ]; then
      break
    fi
    SLEEP=$((15 * i))
    {
      echo "⚠️ Transient CDN error detected (5xx). Retrying in ${SLEEP}s... (attempt $i of $BAZEL_MAX_ATTEMPTS)"
      grep -E "BAZEL_ERROR_PATTERN" "$LOG_FILE" | head -5
    } >&2
    sleep "$SLEEP"
  else
    exit "$BAZEL_EXIT_CODE"
  fi
done

echo "❌ Exhausted retries for CDN errors after $BAZEL_MAX_ATTEMPTS attempts." >&2
exit 1
