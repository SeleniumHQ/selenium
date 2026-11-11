#!/usr/bin/env bash
# Regenerate common/mirror/selenium from the GitHub releases API. Selenium Manager reads this file
# from raw.githubusercontent.com to resolve `--grid <version>`, so it is the release index for every
# binding, not just a convenience copy. Writes the file; committing is left to the caller.
set -euo pipefail

target="$(git rev-parse --show-toplevel)/common/mirror/selenium"

# Unauthenticated requests are capped at 60/hour, which a few reruns will exhaust. Fall back to the
# local gh login so this works outside Actions without the caller exporting anything.
token="${GITHUB_TOKEN:-}"
if [ -z "$token" ] && command -v gh >/dev/null 2>&1; then
  token="$(gh auth token 2>/dev/null || true)"
fi
auth=()
[ -n "$token" ] && auth=(-H "Authorization: token $token")

jq_filter='[.[] | {tag_name: .tag_name, assets: [.assets[] | {browser_download_url: .browser_download_url} ] } ]'
pages="$(mktemp)"
generated="$(mktemp)"
trap 'rm -f "$pages" "$generated"' EXIT
: > "$pages"

page=1
while :; do
  echo "Fetching SeleniumHQ/selenium releases page $page..."
  resp=$(curl -fsSL "${auth[@]}" \
    "https://api.github.com/repos/SeleniumHQ/selenium/releases?per_page=100&page=${page}")
  if [ "$(echo "$resp" | jq 'length')" -eq 0 ]; then
    break
  fi
  echo "$resp" | jq "$jq_filter" >> "$pages"
  page=$((page + 1))
done

jq -s 'add' "$pages" > "$generated"

# The nightly release is deleted and recreated over the course of a release. A snapshot taken inside
# that window silently drops the tag, and `selenium-manager --grid nightly` then fails repo-wide
# with "selenium-server release not available". Refuse to overwrite a good mirror with such a snapshot.
if ! jq -e '.[] | select(.tag_name == "nightly") | .assets[]
            | select(.browser_download_url | test("selenium-server-.*-SNAPSHOT\\.jar$"))' \
      "$generated" >/dev/null; then
  echo "::error::No selenium-server SNAPSHOT jar under the nightly tag; refusing to write a mirror that would break --grid nightly. Re-run once the nightly release has been recreated." >&2
  exit 1
fi

cp "$generated" "$target"
echo "Mirrored $(jq 'length' "$target") releases"
