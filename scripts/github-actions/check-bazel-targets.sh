#!/usr/bin/env bash
# Determines which test targets are affected by changed files

set -euo pipefail

COMMIT_RANGE=${COMMIT_RANGE:-"HEAD^..HEAD"}
echo "Commit range: ${COMMIT_RANGE}"

cd "$(git rev-parse --show-toplevel)"

affected_files=$(git diff --name-only "${COMMIT_RANGE}")
file_count=$(echo "${affected_files}" | wc -l | tr -d ' ')
echo "Changed files: ${file_count}"
if [[ -z "${affected_files}" ]]; then
  echo "" > bazel-targets.txt
  exit 0
fi

# Convert file paths to bazel labels
echo "Finding bazel labels for changed files..."
labels=()
for file in $affected_files; do
  [[ -f "$file" ]] || continue

  dir=$(dirname "$file")
  filename=$(basename "$file")

  while [[ "$dir" != "." && ! -f "$dir/BUILD.bazel" && ! -f "$dir/BUILD" ]]; do
    filename="$(basename "$dir")/$filename"
    dir=$(dirname "$dir")
  done

  if [[ -f "$dir/BUILD.bazel" || -f "$dir/BUILD" ]]; then
    labels+=("//${dir}:${filename}")
  fi
done

echo "Bazel labels: ${#labels[@]}"
if (( ${#labels[@]} == 0 )); then
  echo "" > bazel-targets.txt
  exit 0
fi

# Query all labels at once
source_targets=$(bazel query --keep_going --noshow_progress "set(${labels[*]})" 2>/dev/null || true)
target_count=$(echo "${source_targets}" | wc -l | tr -d ' ')
echo "Source targets: ${target_count}"
if [[ -z "${source_targets}" ]]; then
  echo "" > bazel-targets.txt
  exit 0
fi

# Query each binding and accumulate results
test_targets=""

# Hack for Python since it takes CI 5 minutes to run rdeps for some reason only to always return all //py test targets
py_changed=false
for file in $affected_files; do
  if [[ "$file" == py/* ]]; then
    py_changed=true
    break
  fi
done

if [[ "$py_changed" == true ]]; then
  echo "Python files changed, adding all Python tests targets..."
  result=$(bazel query --keep_going --noshow_progress \
    "kind(test, //py/...) except attr('tags','manual', //py/...) except attr('tags','lint', //py/...)" 2>/dev/null || true)
  if [[ -n "$result" ]]; then
    count=$(echo "$result" | wc -l | tr -d ' ')
    echo "Finished //py/...: ${count} targets"
    test_targets="$result"
  else
    echo "Finished //py/...: 0 targets"
  fi
fi

bindings=("//java/..." "//rb/..." "//dotnet/..." "//javascript/selenium-webdriver/...")

for binding in "${bindings[@]}"; do
  echo "Starting query for ${binding}..."
  result=$(bazel query --keep_going --noshow_progress \
    "kind(test, rdeps(set(${binding}), set(${source_targets}))) \
     except attr('tags','manual', set(${binding})) \
     except attr('tags','lint', set(${binding}))" 2>/dev/null || true)
  if [[ -n "$result" ]]; then
    count=$(echo "$result" | wc -l | tr -d ' ')
    echo "Finished ${binding}: ${count} targets"
    test_targets="${test_targets}"$'\n'"${result}"
  else
    echo "Finished ${binding}: 0 targets"
  fi
done

echo "All queries complete"

test_targets=$(echo "${test_targets}" | xargs -n1 | sort -u | xargs)

if [[ -z "${test_targets}" ]]; then
  echo "No test targets found for the changed files."
  echo "" > bazel-targets.txt
  exit 0
fi

echo "Found test targets:"
echo "${test_targets}" | xargs -n1

echo "${test_targets}" > bazel-targets.txt
