#!/usr/bin/env pwsh
#
# Delete pre-installed browsers and WebDriver binaries so browser tests resolve
# the bazel-pinned / Selenium-Manager-downloaded versions instead of the system copies.

Write-Host "Removing pre-installed drivers and browsers"

$paths = @(
  $env:ChromeWebDriver,
  $env:EdgeWebDriver,
  $env:GeckoWebDriver,
  "C:\Program Files\Google\Chrome",
  "C:\Program Files\Mozilla Firefox",
  "C:\Program Files (x86)\Microsoft\Edge"
) | Where-Object { $_ }

Remove-Item -Path $paths -Recurse -Force -ErrorAction SilentlyContinue
