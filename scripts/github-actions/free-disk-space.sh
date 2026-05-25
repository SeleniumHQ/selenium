#!/usr/bin/env bash

set -u

free_gb() { df -BG / | awk 'NR==2 {print $4}' | tr -d 'G'; }

clean() {
  local label="$1" path="$2"
  local before after t0
  before=$(free_gb)
  t0=$SECONDS
  # shellcheck disable=SC2086  # intentional word-split for globs (julia*)
  sudo rm -rf $path
  after=$(free_gb)
  printf "%s  %-13s %3ds  %3sG -> %3sG free  (freed %sG)\n" \
    "$(date +%T)" "$label" "$((SECONDS - t0))" "$before" "$after" "$((after - before))"
}

echo "=== Disk before cleanup ==="
df -h /
echo
echo "=== Per-step delete (time + free-space delta) ==="

# Pre-installed language toolchains
clean ghc        /opt/ghc
clean ghcup      /usr/local/.ghcup
clean boost      /usr/local/share/boost
clean swift      /usr/share/swift
clean julia      '/usr/local/julia*'
clean gcloud-sdk /usr/lib/google-cloud-sdk
clean codeql     /opt/hostedtoolcache/CodeQL

# App SDKs that Selenium has no binding for
clean dotnet     /usr/share/dotnet
clean graalvm    /usr/local/graalvm
clean powershell /usr/local/share/powershell

# WebDriver binaries (Selenium tests use bazel-pinned drivers)
clean chromedriver "${CHROMEWEBDRIVER:-}"
clean edgedriver   "${EDGEWEBDRIVER:-}"
clean geckodriver  "${GECKOWEBDRIVER:-}"

# Docker images pre-pulled by the runner image
before=$(free_gb); t0=$SECONDS
docker image prune -af >/dev/null 2>&1 || true
after=$(free_gb)
printf "%s  %-13s %3ds  %3sG -> %3sG free  (freed %sG)\n" \
  "$(date +%T)" "docker-images" "$((SECONDS - t0))" "$before" "$after" "$((after - before))"

sync

echo
echo "=== Disk after cleanup ==="
df -h /
