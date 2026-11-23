#!/usr/bin/env bash
#
# Reclaim disk on Linux runners by deleting pre-installed toolchains and SDKs
# that Selenium's build and tests do not use.
#
# Only the fast, high-yield deletions are kept. The goal is just to clear the
# 20 GB gate on 72 GB runners, not to maximize freed space, so the slow,
# low-yield removals are intentionally skipped: android (~34 s, up to ~3 min),
# the docker image prune (~11 s), and gcloud-sdk (~8 s for <1 GB). What remains
# frees ~16 GB in ~13 s.

set -u

echo "Freeing disk space"

# Pre-installed language toolchains
sudo rm -rf -- \
  /usr/local/.ghcup \
  /usr/share/swift \
  /usr/local/julia* \
  /opt/hostedtoolcache/CodeQL

# App SDKs that Selenium has no binding for
sudo rm -rf -- \
  /usr/share/dotnet \
  /usr/local/share/powershell
