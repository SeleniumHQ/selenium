#!/usr/bin/env bash
# Parse Bazel console log for failures and optionally rerun with debug.

set -euo pipefail

RUN_CMD="${1:-}"
RERUN_WITH_DEBUG="${2:-false}"

mkdir -p build/failures
awk '$1 ~ /^\/\// && $2 ~ /(FAILED|TIMEOUT|INCOMPLETE)/ && $3 == "in" { print $1 }' build/bazel-console.log > build/failures/_run1.txt

if [ "$RERUN_WITH_DEBUG" != "true" ]; then
  exit 0
fi

if [ ! -s build/failures/_run1.txt ]; then
  echo "No failed tests to rerun."
  exit 0
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
