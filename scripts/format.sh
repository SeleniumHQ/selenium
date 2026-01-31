#!/usr/bin/env bash
# Code formatter - runs targeted formatters based on what changed from trunk.
# Can be run manually or as a pre-push/pre-commit hook.
# Usage: format.sh [--lint]
set -eufo pipefail

echo "Note: for more flexibility, use './go format' or './go dotnet:format' or './go format -dotnet', etc" >&2
echo "" >&2

run_lint=false
for arg in "$@"; do
    case "$arg" in
        --lint) run_lint=true ;;
        *)
            echo "Unknown option: $arg" >&2
            echo "Usage: $0 [--lint]" >&2
            exit 1
            ;;
    esac
done

section() {
    echo "- $*" >&2
}

# Find what's changed compared to trunk
format_all=false
trunk_ref="$(git rev-parse --verify selenium/trunk 2>/dev/null \
          || git rev-parse --verify origin/trunk 2>/dev/null \
          || git rev-parse --verify trunk 2>/dev/null \
          || echo "")"

if [[ -n "$trunk_ref" ]]; then
    base="$(git merge-base HEAD "$trunk_ref" 2>/dev/null || echo "")"
    if [[ -n "$base" ]]; then
        # Include both committed changes (for pre-push) and staged changes (for pre-commit)
        committed="$(git diff --name-only "$base" HEAD)"
        staged="$(git diff --name-only --cached)"
        changed="$(printf '%s\n%s' "$committed" "$staged" | sort -u)"
    else
        format_all=true
        changed=""
    fi
else
    # No trunk ref found, format everything
    format_all=true
    changed=""
fi

# Helper to check if a pattern matches changed files
changed_matches() {
    [[ "$format_all" == "true" ]] || echo "$changed" | grep -qE "$1"
}

WORKSPACE_ROOT="$(bazel info workspace)"

# Always run buildifier and copyright
section "Buildifier"
echo "    buildifier" >&2
bazel run //:buildifier

section "Copyright"
echo "    update_copyright" >&2
bazel run //scripts:update_copyright

# Run language formatters only if those files changed
if changed_matches '^java/'; then
    section "Java"
    echo "    google-java-format" >&2
    GOOGLE_JAVA_FORMAT="$(bazel run --run_under=echo //scripts:google-java-format)"
    find "${WORKSPACE_ROOT}/java" -type f -name '*.java' | xargs "$GOOGLE_JAVA_FORMAT" --replace
fi

if changed_matches '^javascript/selenium-webdriver/'; then
    section "Javascript"
    echo "    prettier" >&2
    NODE_WEBDRIVER="${WORKSPACE_ROOT}/javascript/selenium-webdriver"
    bazel run //javascript:prettier -- "${NODE_WEBDRIVER}" --write "${NODE_WEBDRIVER}/.prettierrc" --log-level=warn
fi

if changed_matches '^rb/|^rake_tasks/|^Rakefile'; then
    section "Ruby"
    echo "    rubocop -a" >&2
    bazel run //rb:rubocop -- -a --fail-level F
    if [[ "$run_lint" == "true" ]]; then
        echo "    rubocop" >&2
        bazel run //rb:rubocop
    fi
fi

if changed_matches '^rust/'; then
    section "Rust"
    echo "    rustfmt" >&2
    bazel run @rules_rust//:rustfmt
fi

if changed_matches '^py/'; then
    section "Python"
    echo "    ruff format" >&2
    bazel run //py:ruff-format
    if [[ "$run_lint" == "true" ]]; then
        echo "    ruff check" >&2
        bazel run //py:ruff
    fi
fi

if changed_matches '^dotnet/'; then
    section ".NET"
    echo "    dotnet format" >&2
    bazel run //dotnet:format -- style --severity warn
    bazel run //dotnet:format -- whitespace
fi

# Run shellcheck and actionlint when --lint is passed
if [[ "$run_lint" == "true" ]]; then
    section "Shell/Actions"
    echo "    shellcheck + actionlint" >&2
    SHELLCHECK="$(bazel run --run_under=echo @multitool//tools/shellcheck)"
    bazel run @multitool//tools/actionlint:cwd -- -shellcheck "$SHELLCHECK"
fi

# Check if formatting made changes
if ! git diff --quiet; then
    echo "" >&2
    echo "Formatters modified files:" >&2
    git diff --name-only >&2
    exit 1
fi

echo "Format check passed." >&2
