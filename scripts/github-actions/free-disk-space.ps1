#!/usr/bin/env pwsh

function FreeMB { [math]::Round((Get-PSDrive C).Free / 1MB, 0) }

function Clean($Label, $Path) {
  if (-not $Path) { return }
  $beforeMB = FreeMB
  $t0 = Get-Date
  Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
  $afterMB = FreeMB
  $duration = [math]::Round((Get-Date).Subtract($t0).TotalSeconds, 0)
  "{0}  {1,-13} {2,3}s  {3,5}GB -> {4,5}GB free  (freed {5}MB)" -f `
    (Get-Date -Format HH:mm:ss), $Label, $duration, `
    [math]::Round($beforeMB/1024, 1), [math]::Round($afterMB/1024, 1), ($afterMB - $beforeMB)
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
