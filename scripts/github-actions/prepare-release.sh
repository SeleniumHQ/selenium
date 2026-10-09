#!/usr/bin/env bash

set -eufo pipefail
set -x

# Everything the publish jobs build; rbe-ci so nothing is downloaded here. On release-preparation
# PRs this replaces ci-build.sh's release-artifact build, so the gems are here too (under JRuby).
# Takes a language or a release-preparation branch; a language suffix means only that language is published.
language="${1:-all}"
language="${language##*-}"
case "$language" in java | python | ruby | dotnet | javascript) ;; *) language=all ;; esac

wanted() { [[ "$language" == "all" || "$language" == "$1" ]]; }

targets=()
if wanted java; then
  # shellcheck disable=SC2207
  targets+=($(bazel query 'kind(maven_publish, //java/...)'))
  targets+=(
    //java/src/org/openqa/selenium:client-zip
    //java/src/org/openqa/selenium/grid:server-zip
    //java/src/org/openqa/selenium/grid:executable-grid
  )
fi
if wanted python; then targets+=(//py:selenium-wheel //py:selenium-sdist); fi
if wanted ruby; then targets+=(//rb:selenium-webdriver //rb:selenium-devtools); fi
if wanted dotnet; then targets+=(//dotnet:release); fi
if wanted javascript; then targets+=(//javascript/selenium-webdriver:selenium-webdriver); fi

bazel build --config=rbe-ci --config=release "${targets[@]}"
