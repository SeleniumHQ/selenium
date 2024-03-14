#!/usr/bin/env bash
# Code formatter.
set -eufo pipefail

section() {
    echo "- $*" >&2
}

GOOGLE_JAVA_FORMAT="$(bazel run --run_under=echo //scripts:google-java-format)"

section "Buildifier"
echo "    buildifier" >&2
bazel run //:buildifier

section "Java"
echo "    google-java-format" >&2
find "$PWD/java" -type f -name '*.java' | xargs "$GOOGLE_JAVA_FORMAT" --replace

section "Python"
echo "    black" >&2
# Keep the flags here in sync with what we have in `//py:black-config`
bazel run //py/private:black -- --line-length 120 "$(pwd)/py"

section "Rust"
echo "   rustfmt" >&2
bazel run @rules_rust//:rustfmt

section "Copyright"
bazel run //scripts:update_copyright
