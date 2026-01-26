# Code formatter.

Set-StrictMode -Version 'Latest'
$ErrorActionPreference = 'Stop'

function section($message) {
    Write-Host "- $message" -ForegroundColor Green
}

$WORKSPACE_ROOT = (bazel info workspace)
$GOOGLE_JAVA_FORMAT = (bazel run --run_under=echo //scripts:google-java-format)

section "Buildifier"
Write-Host "    buildifier" -ForegroundColor Green
bazel run //:buildifier

section "Java"
Write-Host "    google-java-format" -ForegroundColor Green
Get-ChildItem -Path "$PWD/java" -Include "*.java" -Recurse | ForEach-Object {
    &"$GOOGLE_JAVA_FORMAT" --replace $_.FullName
}

section "Javascript"
Write-Host "    javascript/selenium-webdriver - prettier" -ForegroundColor Green
$NODE_WEBDRIVER = "$WORKSPACE_ROOT/javascript/selenium-webdriver"
bazel run //javascript:prettier -- "$NODE_WEBDRIVER" --write "$NODE_WEBDRIVER/.prettierrc" --log-level=warn

section "Ruby"
Write-Host "    rubocop" -ForegroundColor Green
bazel run //rb:lint

section "Rust"
Write-Host "    rustfmt" -ForegroundColor Green
bazel run @rules_rust//:rustfmt

section "Python"
Write-Host "    python - ruff" -ForegroundColor Green
bazel run //py:ruff-format

section "Copyright"
bazel run //scripts:update_copyright
