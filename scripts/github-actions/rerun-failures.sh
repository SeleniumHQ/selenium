#!/usr/bin/env bash
# Parse Bazel console log for failures and optionally rerun with debug.

set -euo pipefail

RUN_CMD="${1:-}"
RERUN_WITH_DEBUG="${2:-false}"

mkdir -p build/failures
awk '$1 ~ /^\/\// && $2 ~ /(FAILED|TIMEOUT|INCOMPLETE)/ && $3 == "in" { print $1 }' build/bazel-console.log > build/failures/_run1.txt
# Strip ANSI color codes (bazel runs with --color=yes) before anchoring on the ERROR: prefix.
errors=$(awk '{ gsub(/\033\[[0-9;]*m/, "") } /^ERROR: / { print }' build/bazel-console.log)

if [ -n "$errors" ]; then
  echo "::error::This step failed because the 'Run Bazel' step above failed with a build/analysis error — reruns will not help. See that step's log for full context; the ERROR lines are reproduced below."
  echo "::group::ERROR lines from the 'Run Bazel' step"
  echo "$errors"
  echo "::endgroup::"
  exit 1
fi

if [ "$RERUN_WITH_DEBUG" != "true" ]; then
  echo "::error::This step failed because the 'Run Bazel' step above failed — see that step's log for the actual error. rerun-with-debug is disabled, so that failure is propagated here without retry."
  exit 1
fi

if [ ! -s build/failures/_run1.txt ]; then
  echo "::error::This step failed because the 'Run Bazel' step above failed — see that step's log for the actual error. No individual test failures were parsed from its output, so this is likely an infrastructure or build issue that needs to be investigated."
  exit 1
fi

if [[ "$RUN_CMD" == *"/ci-build.sh"* ]]; then
  base_cmd="bazel test --config=rbe-ci --build_tests_only --keep_going"
else
  base_cmd=$(echo "$RUN_CMD" | sed 's| //[^ ]*||g')
fi
targets=$(tr '\n' ' ' < build/failures/_run1.txt)
echo "Rerunning tests: $base_cmd --test_env=SE_DEBUG=true --flaky_test_attempts=1 $targets"
set +e
{
  $base_cmd --test_env=SE_DEBUG=true --flaky_test_attempts=1 $targets
} 2>&1 | tee build/bazel-console2.log
status=$?
set -e
awk '$1 ~ /^\/\// && $2 ~ /FAILED/ && $3 == "in" { print $1 }' build/bazel-console2.log > build/failures/_run2.txt
exit $status
