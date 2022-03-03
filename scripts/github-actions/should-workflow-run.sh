#!/usr/bin/env bash
# Print commands
# set -x
# Extracted from https://github.com/bazelbuild/bazel/blob/master/scripts/ci/ci.sh

COMMIT_RANGE=${COMMIT_RANGE:-"HEAD^..HEAD"}
BAZEL_TARGET_PREFIX=${BAZEL_TARGET_PREFIX:-""}

echo ${COMMIT_RANGE}

# Go to the root of the repo
cd "$(git rev-parse --show-toplevel)" || true

# Get list of affected files by the diff
affected_files=$(git diff --name-only ${COMMIT_RANGE})

# Get a list of the current targets in package form by querying Bazel.
bazel_targets=()
for bazel_target in $affected_files ; do
  bazel_targets+=($(bazel query "$bazel_target"))
  bazel query "$bazel_target"
done

echo "::set-output name=bazel-targets::${bazel_targets[*]}"
echo "::set-output name=run-workflow::false"

if (( ${#bazel_targets[@]} == 0 )); then
  echo "No bazel targets found after checking the diff."
  exit 0
fi

if [[ " ${bazel_targets[*]} " == *"$BAZEL_TARGET_PREFIX"* ]]; then
  echo "::set-output name=run-workflow::true"
  echo "Bazel targets found: ${bazel_targets[*]}"
  exit 0
fi

# Now check if we need to run some tests based on this change
# E.g. A change in Grid needs to trigger remote tests in other bindings
tests=$(bazel query \
    --keep_going \
    --noshow_progress \
    "kind(test, rdeps(//..., set(${bazel_targets[*]})))")

if [[ " ${tests[*]} " == *"$BAZEL_TARGET_PREFIX"* ]]; then
  echo "::set-output name=run-workflow::true"
  echo "Test targets found: ${tests[*]}"
  exit 0
fi
