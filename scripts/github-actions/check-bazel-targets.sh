#!/usr/bin/env bash
# Extracted from https://github.com/bazelbuild/bazel/blob/master/scripts/ci/ci.sh

set -euo pipefail

COMMIT_RANGE=${COMMIT_RANGE:-"HEAD^..HEAD"}
echo "Commit range: ${COMMIT_RANGE}"

# Go to the root of the repo
cd "$(git rev-parse --show-toplevel)"

# Get list of affected files by the diff
affected_files=$(git diff --name-only "${COMMIT_RANGE}")

# Convert file paths to bazel labels (//package:filename format)
echo "Finding bazel labels for changed files..."
source_targets=()
for file in $affected_files; do
  # Skip if file doesn't exist (deleted files)
  [[ -f "$file" ]] || continue

  dir=$(dirname "$file")
  filename=$(basename "$file")

  # Walk up directory tree to find the BUILD file
  while [[ "$dir" != "." && ! -f "$dir/BUILD.bazel" && ! -f "$dir/BUILD" ]]; do
    filename="$(basename "$dir")/$filename"
    dir=$(dirname "$dir")
  done

  # If we found a BUILD file, construct the label and query
  if [[ -f "$dir/BUILD.bazel" || -f "$dir/BUILD" ]]; then
    label="//${dir}:${filename}"
    if query_output=$(bazel query --keep_going --noshow_progress "${label}" 2>/dev/null); then
      source_targets+=(${query_output})
    fi
  fi
done

if (( ${#source_targets[@]} == 0 )); then
  echo "No bazel targets found after checking the diff."
  echo "bazel-targets=''" >> "$GITHUB_OUTPUT"
  exit 0
fi

echo "Found ${#source_targets[@]} source targets"

# Only consider test targets under the binding roots
BINDINGS_UNIVERSE="set(//java/... //py/... //rb/... //dotnet/... //javascript/selenium-webdriver/...)"

# Get test targets based on the changes
echo "Getting test targets..."
test_targets=""
if query_output=$(bazel query \
  --keep_going \
  --noshow_progress \
  "kind(test, rdeps(${BINDINGS_UNIVERSE}, set(${source_targets[@]}))) \
   except attr('tags','manual', ${BINDINGS_UNIVERSE}) \
   except attr('tags','lint', ${BINDINGS_UNIVERSE})" 2>/dev/null); then
  test_targets="${query_output}"
fi

if [[ -z "${test_targets}" ]]; then
  echo "No test targets found for the changed files."
  echo "bazel-targets=''" >> "$GITHUB_OUTPUT"
  exit 0
fi

# Return unique set of test targets
unique_targets=$(printf '%s\n' ${test_targets} | sort -u)

echo "Found test targets:"
echo "${unique_targets}"

# GitHub Actions multiline output format
{
  echo "bazel-targets<<EOF"
  echo "${unique_targets}"
  echo "EOF"
} >> "$GITHUB_OUTPUT"
