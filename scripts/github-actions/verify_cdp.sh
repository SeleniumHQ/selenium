#!/usr/bin/env bash
# Fail if the current Stable Chrome major has no checked-in DevTools, so a release can't ship a
# CDP that predates the browser most users are on. Comparing majors means routine Chrome patch
# bumps never hold up a release; only a promotion the daily Pin Browsers workflow has yet to land.
set -euo pipefail

versions_url="https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json"
major=$(curl -fsS --retry 3 --retry-delay 2 --max-time 30 "$versions_url" |
  jq -r '.channels.Stable.version | split(".")[0]')

# Guard the parse so an upstream schema change reads as itself rather than as a hunt for "vnull".
if ! [[ "$major" =~ ^[0-9]+$ ]]; then
  echo "::error::Could not parse a stable Chrome major from ${versions_url} (got: '${major}')" >&2
  exit 1
fi

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
if [ ! -d "${root}/common/devtools/chromium/v${major}" ]; then
  echo "::error::No CDP for Chrome v${major}; merge the pending browser update before releasing" >&2
  exit 1
fi

echo "CDP for Chrome v${major} is checked in"
