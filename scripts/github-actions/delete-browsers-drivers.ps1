#!/usr/bin/env pwsh
#
# Delete pre-installed WebDriver binaries so browser tests exercise the driver
# that Selenium Manager downloads instead of the system copy.
#
# Unlike Linux/macOS, we intentionally keep the pre-installed browsers on Windows:
# removing them from Program Files is slow and unreliable (partial deletes leave a
# corrupt install that Selenium Manager still detects, so it skips downloading a
# clean copy and then fails to launch it). Selenium Manager is still exercised here
# by having it resolve and download a driver for the pre-installed browser.

Write-Host "Removing pre-installed drivers"

$paths = @(
  $env:ChromeWebDriver,
  $env:EdgeWebDriver,
  $env:GeckoWebDriver
) | Where-Object { $_ }

Remove-Item -Path $paths -Recurse -Force -ErrorAction SilentlyContinue
