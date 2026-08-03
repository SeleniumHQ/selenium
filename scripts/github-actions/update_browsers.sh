#!/usr/bin/env bash
# Refresh pinned browsers/drivers; when a new stable Chrome major has no checked-in DevTools
# version, regenerate CDP so the two never drift. Writes the job "output" as space-separated tags
# the PR reports: "major" on a Chrome/Firefox major bump (CI then runs the full Ruby matrix) and
# "cdp" when DevTools was regenerated.
#
# set -e is load-bearing: if update_cdp fails the job fails before "output" is written, so
# create-pr is skipped and a Chrome bump can never land ahead of its CDP.
set -euo pipefail

old="$RUNNER_TEMP/repositories-old.bzl"
git show HEAD:common/repositories.bzl > "$old"

bazel run //scripts:pinned_browsers

# Sorted-unique major versions of one family in a repositories.bzl; $1 = file, $2 = ERE matching
# "<download-url marker><major digits>".
majors_for() { grep -oE "$2" "$1" | grep -oE '[0-9]+$' | sort -un; }

# Only Chrome and Firefox majors warrant the full matrix: they ship ~monthly and are the likeliest
# to break the bindings. Edge tracks Chromium; driver-only and build/patch bumps do not count. Each
# ERE matches the marker preceding the major in the download URLs pinned in repositories.bzl.
declare -A families=(
  [chrome]='chrome-for-testing-public/[0-9]+'
  [firefox]='(firefox/releases/|Firefox%20)[0-9]+'
)

# New stable Chrome is the lowest pinned major (beta runs ahead); regenerate CDP if its dir is absent.
chrome_majors=$(majors_for common/repositories.bzl "${families[chrome]}")
chrome=${chrome_majors%%$'\n'*}
regen_cdp=false
if [ ! -d "common/devtools/chromium/v${chrome}" ]; then
  bazel run //scripts:update_cdp -- --chrome_channel=Stable
  regen_cdp=true
fi

major=false
for pattern in "${families[@]}"; do
  if [ "$(majors_for "$old" "$pattern")" != "$(majors_for common/repositories.bzl "$pattern")" ]; then
    major=true
    break
  fi
done

output=""
[ "$major" = true ] && output="major"
[ "$regen_cdp" = true ] && output="${output:+$output }cdp"
echo "output=$output" >> "$GITHUB_OUTPUT"
