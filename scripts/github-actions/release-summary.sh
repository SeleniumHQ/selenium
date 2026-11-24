#!/usr/bin/env bash
# Build the Slack summary of a Release - Finish run from the results of its jobs.
#
# Requires TAG, LANGUAGES (the JSON list from parse-release-tag.yml) and UNLOCK (the
# unrestrict-trunk result), plus GITHUB_REPOSITORY and GITHUB_RUN_ID to read the run's jobs.
# Prints the message and writes icon, color and message to GITHUB_OUTPUT.

set -euo pipefail

: "${TAG:?TAG is required}"
: "${UNLOCK:?UNLOCK is required}"
LANGUAGES="${LANGUAGES:-[]}"

declare -A label=([java]=Java [python]=Python [ruby]=Ruby [dotnet]=.NET [javascript]=JavaScript)
join() { local joined; printf -v joined '%s, ' "$@"; echo "${joined%, }"; }
linked() { if [ -n "$2" ]; then echo "<$2|$1>"; else echo "$1"; fi; }

jobs=$(gh api --paginate "repos/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID/jobs?per_page=100" \
  --jq '.jobs[] | [.conclusion // "pending", .html_url, .name] | @tsv')
job_url() { awk -F'\t' -v c="$1" -v p="$2" '$1 == c && index($3, p) == 1 { print $2; exit }' <<<"$jobs"; }

# The job names below must match the display names in release.yml
packages=()
mapfile -t languages < <(jq -r '.[]' <<<"$LANGUAGES")
for lang in "${languages[@]}"; do
  if [ "$lang" = python ]; then prefixes=("Publish Python to PyPI" "Build Python /"); else prefixes=("Build and Publish $lang /"); fi
  if [ -n "$(job_url success "${prefixes[0]}")" ]; then
    packages+=(":white_check_mark: ${label[$lang]:-$lang}")
  else
    link=""
    for prefix in "${prefixes[@]}"; do link=${link:-$(job_url failure "$prefix")}; done
    packages+=(":x: $(linked "${label[$lang]:-$lang}" "$link")")
  fi
done

declare -A seen=()
failed=()
while IFS=$'\t' read -r conclusion link name; do
  [ "$conclusion" = failure ] || continue
  case "$name" in
    "Parse Tag"* | "Create Tag") step=tag ;;
    "GitHub Release "*) step="GitHub release" ;;
    *Documentation*) step=docs ;;
    *"Nightly Versions"*) step="nightly versions" ;;
    *"Nightly Grid"*) step="nightly grid" ;;
    "Update Release Mirror"*) step=mirror ;;
    "Unrestrict Trunk Branch"*) step="trunk unlock" ;;
    *) continue ;;
  esac
  [ -z "${seen[$step]:-}" ] || continue
  seen[$step]=1
  failed+=("$(linked "$step" "$link")")
done <<<"$jobs"

if [ "$UNLOCK" != success ]; then
  icon=':rotating_light:' color=failure headline="$TAG release did not finish and trunk is still locked"
elif [ ${#failed[@]} -gt 0 ]; then
  icon=':warning:' color=warning headline="$TAG released and trunk unlocked"
else
  icon=':white_check_mark:' color=good headline="$TAG released and trunk unlocked"
fi

message=$(
  echo "$headline"
  [ ${#packages[@]} -eq 0 ] || printf '%s\n' "${packages[@]}"
  if [ "$UNLOCK" != success ] || [ ${#failed[@]} -gt 0 ]; then
    echo
    [ ${#failed[@]} -eq 0 ] || echo "Failed: $(join "${failed[@]}")"
    echo 'Fix the cause, then click the "Re-run failed jobs" button in GitHub'
  fi
)

echo "$message"
{
  echo "icon=$icon"
  echo "color=$color"
  echo "message<<EOF"
  echo "$message"
  echo "EOF"
} >> "${GITHUB_OUTPUT:-/dev/null}"
