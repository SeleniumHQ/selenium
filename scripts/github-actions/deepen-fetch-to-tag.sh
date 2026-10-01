#!/usr/bin/env bash
# Deepen a shallow checkout back through the release before the given one and fetch the tags the
# changelog tasks look up. Takes the release tag being prepared, e.g. selenium-4.51.0 or selenium-4.51.2-python.
set -euo pipefail

release="${1:?release tag required}"
head="$(git rev-parse HEAD)"

IFS=.- read -r _ major minor patch language <<< "$release"

# Determine the previous release tag to compare against depending on tag pattern
if [ "$patch" -gt 1 ]; then previous_release="selenium-${major}.${minor}.$((patch-1))-${language}"
elif [ "$patch" -eq 1 ]; then previous_release="selenium-${major}.${minor}.0"
elif [ "$minor" -gt 0 ]; then previous_release="selenium-${major}.$((minor-1)).0"
else previous_release="$(git ls-remote --tags --refs origin "selenium-$((major-1)).*" | awk -F/ '{print $NF}' | grep -E '^selenium-[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -1)"
fi

# Fetch history backward from HEAD to the previous release tag
git fetch --no-tags --shallow-exclude="$previous_release" origin "$head"

# Make the previous release commit available for symmetric difference commands (`<tag>...HEAD`).
git fetch --no-tags --deepen=1 origin "$head"

# Determine which tags the changelog generator needs.
# Minor: get any patch release tags of the previous minor line
# Patch: only needs the previous release tag.
if [ "$patch" -eq 0 ]; then pattern="${previous_release%.*}.*"; else pattern="$previous_release"; fi

# Label tags locally without fetching additional/unnecessary data.
git fetch --no-tags origin "+refs/tags/${pattern}:refs/tags/${pattern}"
