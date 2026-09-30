#!/usr/bin/env bash
# List or drop the OSSRH staging repositories tied to the Sonatype token in the environment. The
# staging service scopes a repository to the exact credential that created it and never shows an
# open one on the Portal, so only the CI token can see what a failed Java deploy left behind.
# usage: sonatype-staging.sh [list|drop] [open|closed|all]

set -euo pipefail

action="${1:-list}"
state="${2:-open}"
user="${MAVEN_USER:-${SEL_M2_USER:-}}"
pass="${MAVEN_PASSWORD:-${SEL_M2_PASS:-}}"
if [ -z "$user" ] || [ -z "$pass" ]; then
  echo "::error::Set SEL_M2_USER and SEL_M2_PASS (or MAVEN_USER and MAVEN_PASSWORD)" >&2
  exit 2
fi

base=https://ossrh-staging-api.central.sonatype.com/manual
# Feed the credential through curl's config on stdin so it never appears in the process list.
sonatype() {
  curl -fsS -K - -H 'Accept: application/json' "$@" <<<"user = \"${user}:${pass}\""
}

repos=$(sonatype "$base/search/repositories?ip=any")
jq -r '.repositories[] | "\(.state)\t\(.key)\tportal_deployment_id=\(.portal_deployment_id // "none")"' <<<"$repos"
echo "$(jq '.repositories | length' <<<"$repos") staging repositories"
[ "$action" = drop ] || exit 0

if [ "$state" = all ]; then
  filter='.repositories[] | select(.state == "open" or .state == "closed") | .key'
else
  filter=".repositories[] | select(.state == \"$state\") | .key"
fi
jq -r "$filter" <<<"$repos" | while read -r key; do
  [ -n "$key" ] || continue
  echo "Dropping $key"
  sonatype -X DELETE "$base/drop/repository/$key"
done
