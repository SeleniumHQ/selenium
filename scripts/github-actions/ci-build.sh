#!/usr/bin/env bash

set -eufo pipefail
# We want to see what's going on
set -x

# The NPM repository rule wants to write to the HOME directory
# but that's configured for the remote build machines, so run
# that repository rule first so that the subsequent remote
# build runs successfully. We don't care what the output is.
bazel query @npm//:all >/dev/null

# Now run the tests. The engflow build uses pinned browsers
# so this should be fine
# shellcheck disable=SC2046
bazel test --config=remote-ci --build_tests_only \
  --test_tag_filters=-exclusive-if-local,-skip-remote \
  --keep_going --flaky_test_attempts=2 \
  //dotnet/...  \
  //java/... \
  //javascript/atoms/... \
  //javascript/node/selenium-webdriver/... \
  //javascript/webdriver/... \
  //py/... \
  //rb/spec/... -- $(cat .skipped-tests | tr '\n' ' ')

# Build the packages we want to ship to users
bazel build --config=remote-ci \
  //dotnet:all \
  //java/src/... \
  //javascript/node/selenium-webdriver:selenium-webdriver \
  //py:selenium-wheel \
  //rb:selenium-devtools //rb:selenium-webdriver
