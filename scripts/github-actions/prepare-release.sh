#!/usr/bin/env bash

set -eufo pipefail
set -x

# Everything the publish jobs build; rbe-ci so nothing is downloaded here. On release-preparation
# PRs this replaces ci-build.sh's release-artifact build, so the gems are here too (under JRuby).
# shellcheck disable=SC2046
bazel build --config=rbe-ci --config=release \
  $(bazel query 'kind(maven_publish, //java/...)' | tr '\n' ' ') \
  //java/src/org/openqa/selenium:client-zip \
  //java/src/org/openqa/selenium/grid:server-zip \
  //java/src/org/openqa/selenium/grid:executable-grid \
  //py:selenium-wheel //py:selenium-sdist \
  //rb:selenium-webdriver //rb:selenium-devtools \
  //dotnet:release \
  //javascript/selenium-webdriver:selenium-webdriver
