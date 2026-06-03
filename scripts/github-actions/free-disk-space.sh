#!/usr/bin/env bash
#
# Reclaim disk on Linux runners by deleting pre-installed toolchains, SDKs and
# Docker images that Selenium's build and tests do not use.

set -u

echo "Freeing disk space"

# Pre-installed language toolchains
sudo rm -rf -- \
  /opt/ghc \
  /usr/local/.ghcup \
  /usr/local/share/boost \
  /usr/share/swift \
  /usr/local/julia* \
  /usr/lib/google-cloud-sdk \
  /opt/hostedtoolcache/CodeQL

# App SDKs that Selenium has no binding for
sudo rm -rf -- \
  /usr/local/lib/android \
  /usr/share/dotnet \
  /usr/local/graalvm \
  /usr/local/share/powershell

# Docker images pre-pulled by the runner image
docker image prune -af >/dev/null 2>&1 || true
