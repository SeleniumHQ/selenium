#!/usr/bin/env bash

set -eufo pipefail
# We want to see what's going on
set -x

# Script runs with reasonable defaults; passing true as an argument runs everything
FULL_RUN="${1:-false}"

# Bazel only sees the latest `--test_tag_filters`, so this overrides .bazelrc.remote
TEST_FILTER="--test_tag_filters=-skip-rbe,-chrome-beta,-firefox-beta"
CACHE_RESULTS="auto"

if [ "${FULL_RUN}" = "true" ]; then
  TEST_FILTER="--test_tag_filters=-skip-rbe"
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

# Build the packages we want to ship to users
bazel build --config=rbe-ci --build_tag_filters=release-artifact //...
