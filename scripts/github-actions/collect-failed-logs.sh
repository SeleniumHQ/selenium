#!/usr/bin/env bash
# Collects failed test logs from Bazel testlogs directory, plus safaridriver diagnostics from the debug rerun
# Reads targets from build/failures/_run2.txt if present, otherwise _run1.txt

set -euxo pipefail

TESTLOGS_ROOT=$(bazel info bazel-testlogs)

LIST_FILE=""
if [ -s build/failures/_run2.txt ]; then
  LIST_FILE="build/failures/_run2.txt"
elif [ -s build/failures/_run1.txt ]; then
  LIST_FILE="build/failures/_run1.txt"
else
  exit 0
fi

echo "Failures to collect from $LIST_FILE:"
cat "$LIST_FILE"

while IFS= read -r target; do
  [ -z "$target" ] && continue

  # Convert //path/to:target to path/to/target
  rel_path=$(tr ':' '/' <<< "${target#//}")

  log_source="$TESTLOGS_ROOT/${rel_path}/test.log"

  if [ -f "$log_source" ]; then
    # Convert path separators to underscores for safe filename
    safe_name="${target#//}"
    safe_name="${safe_name//[\/:]/_}"
    echo "Copying log for $target..."
    cp "$log_source" "build/failures/${safe_name}.log"
  else
    echo "Warning: No log found for $target at $log_source" >&2
  fi
done < "$LIST_FILE"

# Only the SE_DEBUG rerun passes --diagnose; safaridriver ignores Bazel's HOME and logs under the real one.
SAFARIDRIVER_LOGS="$HOME/Library/Logs/com.apple.WebDriver"
if [ -f build/bazel-console2.log ] && [ -d "$SAFARIDRIVER_LOGS" ]; then
  echo "Copying safaridriver diagnostics..."
  cp -R "$SAFARIDRIVER_LOGS" build/failures/safaridriver-diagnose
fi
