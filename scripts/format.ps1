# Code formatter.

Set-StrictMode -Version 'Latest'
$ErrorActionPreference = 'Stop'

function section($message) {
    Write-Host "- $message" -ForegroundColor Green
}

$GOOGLE_JAVA_FORMAT = (bazel run --run_under=echo //scripts:google-java-format)

section "Buildifier"
Write-Host "    buildifier" -ForegroundColor Green
bazel run //:buildifier

section "Java"
Write-Host "    google-java-format" -ForegroundColor Green
Get-ChildItem -Path "$PWD/java" -Include "*.java" -Recurse | ForEach-Object {
    &"$GOOGLE_JAVA_FORMAT" --replace $_.FullName
}
