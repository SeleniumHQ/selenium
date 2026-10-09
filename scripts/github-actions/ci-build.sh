#!/usr/bin/env bash

set -eufo pipefail
# We want to see what's going on
set -x

# Script runs with reasonable defaults; passing true as an argument runs everything
FULL_RUN="${1:-false}"

# Bazel only sees the latest `--test_tag_filters`, so this overrides .bazelrc.remote
TEST_FILTER="--test_tag_filters=-skip-rbe,-se-manager,-chrome-beta,-firefox-beta"
CACHE_RESULTS="auto"

if [ "${FULL_RUN}" = "true" ]; then
  TEST_FILTER="--test_tag_filters=-skip-rbe,-se-manager"
  CACHE_RESULTS="no"
fi

# Now run the tests. The engflow build uses pinned browsers
# so this should be fine
# shellcheck disable=SC2046
bazel test --config=rbe-ci --build_tests_only \
  --keep_going --flaky_test_attempts=2 \
  --cache_test_results=${CACHE_RESULTS} \
  "${TEST_FILTER}" \
  //... -- $(cat .skipped-tests | tr '\n' ' ')

# Check the packaging rules in the test configuration so the analysis is reused; nightly and
# release-preparation PRs package the real manager
if [ "${SKIP_RELEASE_ARTIFACTS:-false}" != "true" ]; then
  bazel build --config=rbe-ci --manager=stub --build_tag_filters=release-artifact //...
fi
