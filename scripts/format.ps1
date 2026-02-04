# Code formatter - runs targeted formatters based on what changed from trunk.
# Usage: format.ps1 [-All] [-PreCommit] [-PrePush] [-Lint]
#   (default)     Check all changes relative to trunk including uncommitted work
#   -All          Format everything, skip change detection
#   -PreCommit    Only check staged changes
#   -PrePush      Only check committed changes relative to trunk
#   -Lint         Also run linters before formatting

param(
    [switch]$All,
    [switch]$PreCommit,
    [switch]$PrePush,
    [switch]$Lint
)

Set-StrictMode -Version 'Latest'
$ErrorActionPreference = 'Stop'

# Validate mutually exclusive flags
if ($PreCommit -and $PrePush) {
    Write-Error "Cannot use both -PreCommit and -PrePush"
    exit 1
}

function section($message) {
    Write-Host "- $message" -ForegroundColor Green
}

# Find what's changed compared to trunk (skip if -All)
$formatAll = $All
$trunkRef = git rev-parse --verify trunk 2>$null

if (-not $formatAll -and $trunkRef) {
    $base = git merge-base HEAD $trunkRef 2>$null
    if ($base) {
        if ($PreCommit) {
            $changed = git diff --name-only --cached
        } elseif ($PrePush) {
            $changed = git diff --name-only $base HEAD
        } else {
            $committed = git diff --name-only $base HEAD
            $staged = git diff --name-only --cached
            $unstaged = git diff --name-only
            $untracked = git ls-files --others --exclude-standard
            $changed = ($committed + $staged + $unstaged + $untracked) | Sort-Object -Unique
        }
    } else {
        $formatAll = $true
    }
} elseif (-not $formatAll) {
    # No trunk ref found, format everything
    $formatAll = $true
}

# Helper to check if a pattern matches changed files
function changedMatches($pattern) {
    if ($formatAll) { return $true }
    return ($changed | Where-Object { $_ -match $pattern }).Count -gt 0
}

$WORKSPACE_ROOT = (bazel info workspace)

# Capture baseline to detect formatter-introduced changes
$baseline = git status --porcelain

# Always run buildifier and copyright
section "Buildifier"
Write-Host "    buildifier"
bazel run //:buildifier

section "Copyright"
Write-Host "    update_copyright"
bazel run //scripts:update_copyright

# Run language formatters only if those files changed
if (changedMatches '^java/') {
    section "Java"
    Write-Host "    google-java-format"
    $GOOGLE_JAVA_FORMAT = (bazel run --run_under=echo //scripts:google-java-format)
    Get-ChildItem -Path "$WORKSPACE_ROOT/java" -Include "*.java" -Recurse | ForEach-Object {
        & "$GOOGLE_JAVA_FORMAT" --replace $_.FullName
    }
}

if (changedMatches '^javascript/selenium-webdriver/') {
    section "JavaScript"
    Write-Host "    prettier"
    $NODE_WEBDRIVER = "$WORKSPACE_ROOT/javascript/selenium-webdriver"
    bazel run //javascript:prettier -- "$NODE_WEBDRIVER" --write "$NODE_WEBDRIVER/.prettierrc" --log-level=warn
}

if (changedMatches '^rb/|^rake_tasks/|^Rakefile') {
    section "Ruby"
    Write-Host "    rubocop -a"
    if ($Lint) {
        bazel run //rb:rubocop -- -a
    } else {
        bazel run //rb:rubocop -- -a --fail-level F
    }
}

if (changedMatches '^rust/') {
    section "Rust"
    Write-Host "    rustfmt"
    bazel run @rules_rust//:rustfmt
}

if (changedMatches '^py/') {
    section "Python"
    if ($Lint) {
        Write-Host "    ruff check"
        bazel run //py:ruff-check
    }
    Write-Host "    ruff format"
    bazel run //py:ruff-format
}

if (changedMatches '^dotnet/') {
    section ".NET"
    Write-Host "    dotnet format"
    bazel run //dotnet:format -- style --severity warn
    bazel run //dotnet:format -- whitespace
}

# Run shellcheck and actionlint when -Lint is passed
if ($Lint) {
    section "Shell/Actions"
    Write-Host "    actionlint (with shellcheck)"
    $SHELLCHECK = (bazel run --run_under=echo @multitool//tools/shellcheck)
    bazel run @multitool//tools/actionlint:cwd -- -shellcheck "$SHELLCHECK"
}

# Check if formatting introduced new changes (comparing to baseline)
$after = git status --porcelain
if ($after -ne $baseline) {
    Write-Host ""
    Write-Host "Formatters modified files:" -ForegroundColor Red
    git diff --name-only
    exit 1
}

Write-Host "Format check passed." -ForegroundColor Green
