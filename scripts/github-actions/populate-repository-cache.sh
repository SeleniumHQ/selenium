#!/usr/bin/env bash
# Refill this OS's GitHub Actions repository cache from origin.
# Run by gh-cache.yml one OS at a time; setup-bazel saves the cache in its post step.

set -euo pipefail

# Keep only the newest setup-bazel cache of each kind and OS on this ref. Running before this OS saves removes the
# copy the previous OS's run superseded, so the repo never holds more than one extra copy.
gh cache list -R "$GITHUB_REPOSITORY" --ref "$GITHUB_REF" --key setup-bazel- --limit 1000 --json id,key,createdAt \
  --jq '[.[] | . + {group: (.key | sub("-[0-9a-f]+$"; ""))}]
        | group_by(.group) | map(sort_by(.createdAt) | reverse | .[1:])
        | flatten | .[].id' |
  while read -r id; do
    gh cache delete -R "$GITHUB_REPOSITORY" "$id" || echo "::warning::Could not delete superseded cache $id"
  done

# Start empty so downloads the current lock files no longer need don't carry over
repository_cache=$(bazel info repository_cache)
rm -rf "$repository_cache"

# setup-bazel keys the cache on this file too, so the save key never equals the restored key and the save always runs
mkdir -p build
echo "$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT" > build/repository-cache-run

# Extracted repos take as long to restore as to extract, so cache only the downloads. Leave out pinned browsers and
# prebuilt Selenium Manager binaries: GitHub test jobs build Selenium Manager from source (--manager=host).
flags=(--nobuild --keep_going --pin_browsers=false --manager=host --repo_contents_cache=)
bazel build "${flags[@]}" --build_tests_only \
  //java/test/... '//py:*' //rb/spec/... //rust/tests/... '//javascript/selenium-webdriver:*' //dotnet/test/...
# Format and lint jobs run only on Linux x64, and --build_tests_only above skips these
if [[ "$RUNNER_OS" == Linux && "$RUNNER_ARCH" == X64 ]]; then
  bazel build "${flags[@]}" //:buildifier //py:ruff-format //scripts:google-java-format //py:mypy //py:sphinx-autogen \
    //py:docs @multitool//tools/shellcheck @multitool//tools/actionlint
fi
