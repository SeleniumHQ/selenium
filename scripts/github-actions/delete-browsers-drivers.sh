#!/usr/bin/env bash
#
# Delete pre-installed browsers and WebDriver binaries so browser tests resolve
# the bazel-pinned / Selenium-Manager-downloaded versions instead of the system
# copies. Runs on Linux and macOS.

set -u

echo "Removing pre-installed drivers and browsers"

# Drivers: the runner exposes their locations via env vars on Linux and macOS.
# `--` guards against any env value that begins with a dash.
sudo rm -rf -- "${CHROMEWEBDRIVER:-}" "${EDGEWEBDRIVER:-}" "${GECKOWEBDRIVER:-}"

# Browsers: no env var points at these, so the paths are OS-specific.
if [ "${RUNNER_OS:-}" = "macOS" ]; then
  sudo rm -rf -- "/Applications/Google Chrome.app" \
                 "/Applications/Firefox.app" \
                 "/Applications/Microsoft Edge.app"
else
  sudo rm -rf -- /opt/google/chrome /opt/firefox /opt/microsoft/msedge
fi
