#!/usr/bin/env bash
# Wrap `bazel test` so that exit code 4 (no test targets matched the
# configured filters) is reported as a notice and treated as success.
# Keeps `inputs.run` a single command word so rerun-failures.sh can
# strip ` //...` targets and re-append failed ones without mangling
# shell control characters.

set -uo pipefail

code=0
bazel test "$@" || code=$?

case "$code" in
  0) exit 0 ;;
  4)
    echo "::notice::No test targets matched the configured filters"
    exit 0
    ;;
  *) exit "$code" ;;
esac
