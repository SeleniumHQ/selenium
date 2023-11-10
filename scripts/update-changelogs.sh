#!/usr/bin/env bash

# Update changelogs in each of the bindings based on commits between provided reference and HEAD
PREVIOUS_TAG=$1

prepend_git_log_to_file() {
    local FILE="$1"
    local DIR="${FILE%/*}"

    local TEMP_FILE="$(mktemp)"

    git --no-pager log "${PREVIOUS_TAG}...${HEAD}" --pretty=format:"* %B %n %an http://github.com/seleniumhq/selenium/commit/%H" --reverse -- "$DIR/" > "$TEMP_FILE"
    echo -e "\n\n" >> "$TEMP_FILE"

    cat "$FILE" >> "$TEMP_FILE"
    mv "$TEMP_FILE" "$FILE"
}

git --no-pager log "${PREVIOUS_TAG}...${HEAD}" --pretty=format:"* %B %n %an http://github.com/seleniumhq/selenium/commit/%H" --reverse -- . ':!rb/' ':!py/' ':!javascript/' ':!dotnet/' ':!java/' ':!rust/' >> changelog_updates.md

CHANGELOGS=(
    "dotnet/CHANGELOG"
    "java/CHANGELOG"
    "javascript/node/selenium-webdriver/CHANGES.md"
    "py/CHANGES"
    "rb/CHANGES"
    "rust/CHANGELOG.md"
)

for changelog in "${CHANGELOGS[@]}"; do
    prepend_git_log_to_file "$changelog"
done
