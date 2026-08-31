#!/usr/bin/env bash

set -eufo pipefail
# We want to see what's going on
set -x

# Default to auto if no parameter is provided
CACHE_RESULTS="auto"

# If "disable test cache" is passed in and true
if [ $# -gt 0 ] && [ "$1" = "true" ]; then
  CACHE_RESULTS="no"
fi

# Beta browsers only run in the full profile: a beta regression is not the
# author's to fix, so it must not block their PR.
PROFILE="${SELENIUM_RBE_PROFILE:-full}"
case "${PROFILE}" in
  main) TAG_FILTERS=(--test_tag_filters=-skip-rbe,-chrome-beta,-firefox-beta) ;;
  full) TAG_FILTERS=() ;;
  *) echo "Unknown RBE profile: ${PROFILE}" >&2; exit 1 ;;
esac

# Now run the tests. The engflow build uses pinned browsers
# so this should be fine
# shellcheck disable=SC2046
bazel test --config=rbe-ci --build_tests_only \
  --keep_going --flaky_test_attempts=2 \
  --cache_test_results=${CACHE_RESULTS} \
  ${TAG_FILTERS[@]+"${TAG_FILTERS[@]}"} \
  //... -- $(cat .skipped-tests | tr '\n' ' ')

# Build the packages we want to ship to users
bazel build --config=rbe-ci --build_tag_filters=release-artifact //...
