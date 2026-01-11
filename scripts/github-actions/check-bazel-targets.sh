#!/usr/bin/env bash
# Extracted from https://github.com/bazelbuild/bazel/blob/master/scripts/ci/ci.sh

set -euo pipefail

COMMIT_RANGE=${COMMIT_RANGE:-"HEAD^..HEAD"}
echo "${COMMIT_RANGE}"

# Go to the root of the repo
cd "$(git rev-parse --show-toplevel)"

# Get list of affected files by the diff
affected_files=$(git diff --name-only "${COMMIT_RANGE}")

# Map changed files to target labels
bazel_targets=()
for file in $affected_files; do
  if query_output=$(bazel query --keep_going --noshow_progress "file(${file})" 2>/dev/null); then
    bazel_targets+=(${query_output})
  fi
done

if (( ${#bazel_targets[@]} == 0 )); then
  echo "No bazel targets found after checking the diff."
  exit 0
fi

# Only consider test targets under the binding roots
BINDINGS_UNIVERSE="set(//java/... //py/... //rb/... //dotnet/... //javascript/selenium-webdriver/...)"

# Get test targets based on the changes
echo "Getting test targets..."
if query_output=$(bazel query \
  --keep_going \
  --noshow_progress \
  "kind(test, rdeps(${BINDINGS_UNIVERSE}, set(${bazel_targets[@]}))) \
   except attr('tags','manual', ${BINDINGS_UNIVERSE})" 2>/dev/null); then
  bazel_targets+=(${query_output})
fi

# Return unique set
mapfile -t bazel_targets < <(printf '%s\n' "${bazel_targets[@]}" | sort -u)

echo "bazel-targets='${bazel_targets[*]}'" | tee -a "$GITHUB_OUTPUT"
