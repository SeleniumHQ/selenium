#!/usr/bin/env bash
# Rerun the Bazel command once when its console log shows a transient download failure.
# The retried run replaces build/bazel-console.log so the debug rerun and the flaky-test
# parsing act on it; the aborted run is kept as build/bazel-console-transient.log.

set -euo pipefail

RUN_CMD="${1:-}"

# Strip ANSI color codes (--color=yes) and the "(HH:MM:SS) " prefix (--show_timestamps).
console=$(awk '{ gsub(/\033\[[0-9;]*m/, ""); sub(/^\([0-9:]+\) /, ""); print }' build/bazel-console.log)

retry_wait=0
# Scan the whole log rather than `ERROR:` lines: http_archive fetch failures report the status
# code inside a Starlark traceback below the ERROR line.
if grep -qE 'Error downloading.*(GET returned (5[0-9][0-9]|429)|timed out|Connection reset)' <<<"$console"; then
  retry_wait=60
elif grep -qE "ChecksumFailureException: .*is actually .da39a3ee5e6b4b0d3255bfef95601890afd80709|UriNotFoundException: Unable to download" <<<"$console"; then
  # The Maven resolver inside `bazel run @maven//:pin` reports a Central outage as empty downloads
  # (that SHA-1 is the empty file) or an unfetchable artifact, with no Bazel ERROR line to anchor on.
  retry_wait=120
fi

if [ "$retry_wait" -eq 0 ]; then
  echo "retried=false" >> "${GITHUB_OUTPUT:-/dev/null}"
  exit 0
fi

echo "retried=true" >> "${GITHUB_OUTPUT:-/dev/null}"
echo "::warning::The 'Run Bazel' step could not download an external dependency (transient server or network error); retrying once in ${retry_wait}s."
sleep "$retry_wait"
mv build/bazel-console.log build/bazel-console-transient.log
set +e
{
  # Same flags GitHub uses for `shell: bash`, so a multi-line input still stops at its first failure
  bash --noprofile --norc -eo pipefail -c "$RUN_CMD"
} 2>&1 | tee build/bazel-console.log
status=$?
set -e
[ "$status" -eq 0 ] || echo "::error::The retry after the transient download failure also failed — see the output above."
exit "$status"
