#!/usr/bin/env bash
# Code formatter.
set -eufo pipefail

section() {
    echo "- $*" >&2
}

WORKSPACE_ROOT="$(bazel info workspace)"

GOOGLE_JAVA_FORMAT="$(bazel run --run_under=echo //scripts:google-java-format)"

section "Buildifier"
echo "    buildifier" >&2
bazel run //:buildifier

section "Java"
echo "    google-java-format" >&2
find "$PWD/java" -type f -name '*.java' | xargs "$GOOGLE_JAVA_FORMAT" --replace

section "Javascript"
echo "    javascript/selenium-webdriver - prettier" >&2
NODE_WEBDRIVER="${WORKSPACE_ROOT}/javascript/selenium-webdriver"
bazel run //javascript:prettier -- "${NODE_WEBDRIVER}" --write "${NODE_WEBDRIVER}/.prettierrc"

section "Ruby"
echo "    rubocop" >&2
bazel run //rb:lint

section "Rust"
echo "   rustfmt" >&2
bazel run @rules_rust//:rustfmt

section "Python"
echo "    python - ruff" >&2
bazel run @multitool//tools/ruff:cwd -- check --fix --show-fixes
bazel run @multitool//tools/ruff:cwd -- format

section "Copyright"
bazel run //scripts:update_copyright
