#!/usr/bin/env bash
# Code formatter.
set -eufo pipefail

section() {
    echo "- $*" >&2
}

WORKSPACE_ROOT="$(bazel info workspace 2>/dev/null)"

GOOGLE_JAVA_FORMAT="$(bazel run --run_under=echo //scripts:google-java-format)"

section "Buildifier"
echo "    buildifier" >&2
bazel run //:buildifier

section "Java"
echo "    google-java-format" >&2
find "$PWD/java" -type f -name '*.java' | xargs "$GOOGLE_JAVA_FORMAT" --replace

section "Javascript"
echo "    javascript/node/selenium-webdriver - prettier" >&2
NODE_WEBDRIVER="${WORKSPACE_ROOT}/javascript/node/selenium-webdriver"
bazel run //javascript:prettier -- "${NODE_WEBDRIVER}" --write "${NODE_WEBDRIVER}/.prettierrc"

section "Ruby"
echo "    rubocop" >&2
bazel run //rb:lint

section "Rust"
echo "   rustfmt" >&2
bazel run @rules_rust//:rustfmt

# TODO: use bazel target when rules_python supports formatting
section "Python"
echo "    python - isort, black, flake8, docformatter" >&2
pip install tox
export TOXENV=linting
tox -c py/tox.ini

section "Copyright"
bazel run //scripts:update_copyright
