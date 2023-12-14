#!/usr/bin/env bash

if [ ! -n "${GITHUB_WORKFLOW}" ]; then
  echo "Do not run this script locally; use ./scripts/format.sh"
else
  set -eufo pipefail
  # We want to see what's going on
  set -x

  # The ruby version may have been set by the CI runner. Stash
  # changes while we check to see if we need to reformat the
  # code.
  git config user.email "selenium@example.com"
  git config user.name "CI Build"
  git commit -am 'Temp commit to allow format to run cleanly'

  # Fail the build if the format script needs to be re-run
  ./scripts/format.sh
  git diff --exit-code

  # Now we're made it out, reapply changes made by the build
  # runner
  git reset --soft HEAD^
fi
