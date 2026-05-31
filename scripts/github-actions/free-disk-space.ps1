#!/usr/bin/env pwsh

function FreeBytes { (Get-PSDrive C).Free }

function Clean($Label, $Path) {
  if (-not $Path) {
    "{0}  {1,-13} (path not set, skipping)" -f (Get-Date -Format HH:mm:ss), $Label
    return
  }
  $before = FreeBytes
  $t0 = Get-Date
  Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
  $after = FreeBytes
  $duration = [math]::Round((Get-Date).Subtract($t0).TotalSeconds, 0)
  $freedMB = [math]::Round(($after - $before) / 1MB, 0)
  "{0}  {1,-13} {2,3}s  {3,5}GB -> {4,5}GB free  (freed {5}MB)" -f `
    (Get-Date -Format HH:mm:ss), $Label, $duration, `
    [math]::Round($before/1GB, 1), [math]::Round($after/1GB, 1), $freedMB
}

Write-Host "=== Disk before cleanup ==="
Get-PSDrive C, D | Format-Table -AutoSize | Out-String | Write-Host
Write-Host
Write-Host "=== Per-step delete (time + free-space delta on C:) ==="

# Pre-installed language toolchains
Clean "miniconda"    "C:\Miniconda"
Clean "ghc"          "C:\tools\ghc"
Clean "llvm"         "C:\Program Files\LLVM"
Clean "postgres"     "C:\Program Files\PostgreSQL"
Clean "mongo"        "C:\Program Files\MongoDB"
Clean "mysql"        "C:\Program Files\MySQL"

# WebDriver binaries (Selenium tests use bazel-pinned drivers)
Clean "chromedriver" $env:ChromeWebDriver
Clean "edgedriver"   $env:EdgeWebDriver
Clean "geckodriver"  $env:GeckoWebDriver

Write-Host
Write-Host "=== Disk after cleanup ==="
Get-PSDrive C, D | Format-Table -AutoSize | Out-String | Write-Host
