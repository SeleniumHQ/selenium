#!/usr/bin/env bash
# Code formatter - runs targeted formatters based on what changed from trunk.
# Usage: format.sh [--all] [--pre-commit] [--pre-push] [--lint]
#   (default)     Check all changes relative to trunk including uncommitted work
#   --all         Format everything, skip change detection (previous behavior)
#   --pre-commit  Only check staged changes
#   --pre-push    Only check committed changes relative to trunk
#   --lint        Also run linters before formatting
set -eufo pipefail

run_lint=false
format_all=false
mode="default"
for arg in "$@"; do
    case "$arg" in
        --lint) run_lint=true ;;
        --all) format_all=true ;;

        --pre-commit|--pre-push)
            [[ "$mode" == "default" ]] || { echo "Cannot use both --pre-commit and --pre-push" >&2; exit 1; }
            mode="${arg#--}"
            ;;
        *)
            echo "Unknown option: $arg" >&2
            echo "Usage: $0 [--all] [--pre-commit] [--pre-push] [--lint]" >&2
            exit 1
            ;;
    esac
done

section() {
    echo "- $*" >&2
}

# Find what's changed compared to trunk (skip if --all)
# When on trunk, compare against origin/trunk instead.
current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
if [[ "$current_branch" == "trunk" ]]; then
    trunk_ref="$(git rev-parse --verify origin/trunk 2>/dev/null || echo "")"
else
    trunk_ref="$(git rev-parse --verify trunk 2>/dev/null || echo "")"
fi

if [[ "$format_all" == "false" && -n "$trunk_ref" ]]; then
    base="$(git merge-base HEAD "$trunk_ref" 2>/dev/null || echo "")"
    if [[ -n "$base" ]]; then
        case "$mode" in
            pre-commit)
                changed="$(git diff --name-only --cached)"
                ;;
            pre-push)
                changed="$(git diff --name-only "$base" HEAD)"
                ;;
            default)
                committed="$(git diff --name-only "$base" HEAD)"
                staged="$(git diff --name-only --cached)"
                unstaged="$(git diff --name-only)"
                untracked="$(git ls-files --others --exclude-standard)"
                changed="$(printf '%s\n%s\n%s\n%s' "$committed" "$staged" "$unstaged" "$untracked" | sort -u)"
                ;;
        esac
    else
        format_all=true
    fi
elif [[ "$format_all" == "false" ]]; then
    # No trunk ref found, format everything
    format_all=true
fi

# Helper to check if a pattern matches changed files
changed_matches() {
    [[ "$format_all" == "true" ]] || echo "$changed" | grep -qE "$1"
}

WORKSPACE_ROOT="$(bazel info workspace)"

# Capture baseline to detect formatter-introduced changes (allows pre-existing uncommitted work)
baseline="$(git status --porcelain)"

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
    find "${WORKSPACE_ROOT}/java" -type f -name '*.java' -exec "$GOOGLE_JAVA_FORMAT" --replace {} +
fi

if changed_matches '^javascript/selenium-webdriver/'; then
    section "JavaScript"
    echo "    prettier" >&2
    NODE_WEBDRIVER="${WORKSPACE_ROOT}/javascript/selenium-webdriver"
    bazel run //javascript:prettier -- "${NODE_WEBDRIVER}" --write "${NODE_WEBDRIVER}/.prettierrc" --log-level=warn
fi

if changed_matches '^rb/|^rake_tasks/|^Rakefile'; then
    section "Ruby"
    echo "    rubocop -a" >&2
    if [[ "$run_lint" == "true" ]]; then
        bazel run //rb:rubocop -- -a
    else
        bazel run //rb:rubocop -- -a --fail-level F
    fi
fi

if changed_matches '^rust/'; then
    section "Rust"
    echo "    rustfmt" >&2
    bazel run @rules_rust//:rustfmt
fi

if changed_matches '^py/'; then
    section "Python"
    RUFF="$(bazel run --run_under=echo @multitool//tools/ruff)"
    RUFF_COMMON=(--config=py/pyproject.toml --exclude '**/node_modules/**' --exclude '**/.bundle/**' --exclude '**/bidi/**' --exclude '**/devtools/**' py scripts common dotnet java javascript rb)
    echo "    ruff check" >&2
    # Apply auto-fixable lint issues; don't fail on unfixable violations (caught by py:lint)
    "$RUFF" check --fix --show-fixes "${RUFF_COMMON[@]}" || true
    echo "    ruff format" >&2
    "$RUFF" format "${RUFF_COMMON[@]}"
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
    echo "    actionlint (with shellcheck)" >&2
    SHELLCHECK="$(bazel run --run_under=echo @multitool//tools/shellcheck)"
    bazel run @multitool//tools/actionlint:cwd -- -shellcheck "$SHELLCHECK"
fi

# Check if formatting introduced new changes (comparing to baseline)
if [[ "$(git status --porcelain)" != "$baseline" ]]; then
    echo "" >&2
    echo "Formatters modified files:" >&2
    git diff --name-only >&2
    exit 1
fi

echo "Format check passed." >&2
