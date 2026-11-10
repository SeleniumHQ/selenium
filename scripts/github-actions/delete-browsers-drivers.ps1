#!/usr/bin/env pwsh
#
# Delete pre-installed drivers so Selenium Manager downloads them. Unlike
# Linux/macOS, browsers are kept: removing them from Program Files is unreliable
# and a partial delete leaves a corrupt install that breaks the tests.

Write-Host "Removing pre-installed drivers"

$paths = @(
  $env:ChromeWebDriver,
  $env:EdgeWebDriver,
  $env:GeckoWebDriver
) | Where-Object { $_ }

if ($paths) {
  Remove-Item -Path $paths -Recurse -Force -ErrorAction SilentlyContinue
}
