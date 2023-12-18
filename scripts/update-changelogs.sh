#!/usr/bin/env bash

# Update changelogs in each of the bindings based on commits between provided reference and HEAD
VERSION=$1
IFS='.' read -r MAJOR_VERSION MINOR_VERSION PATCH_VERSION <<< "$VERSION"
LANGUAGE=$2

calculate_previous_tag() {
    if [ "$PATCH_VERSION" -ne 0 ]; then
        PREVIOUS_TAG="selenium-$MAJOR_VERSION.$MINOR_VERSION.$(($PATCH_VERSION - 1))"
        if [ -n "$LANGUAGE" ] && [ "$PATCH_VERSION" -gt 1 ]; then
            PREVIOUS_TAG="${PREVIOUS_TAG}-$(get_tag_language)"
        fi
    elif [ $MINOR_VERSION -ne 0 ]; then
        PREVIOUS_TAG="selenium-$MAJOR_VERSION.$(($MINOR_VERSION - 1)).0"
    else
        echo "Cannot determine the previous tag from $VERSION"
        exit 1
    fi
}

get_tag_language() {
    case $LANGUAGE in
        py) echo "python" ;;
        rb) echo "ruby" ;;
        *) echo "$LANGUAGE" ;;
    esac
}

prepend_git_log_to_file() {
    local FILE="$1"
    local DIR="${FILE%/*}"
    local TEMP_FILE="$(mktemp)"

    git --no-pager log "${PREVIOUS_TAG}...HEAD" --pretty=format:"* %B %n %an http://github.com/seleniumhq/selenium/commit/%H" --reverse -- "$DIR/" > "$TEMP_FILE"
    echo -e "\n\n" >> "$TEMP_FILE"

    cat "$FILE" >> "$TEMP_FILE"
    mv "$TEMP_FILE" "$FILE"
}

update_language_changelogs() {
    calculate_previous_tag

  for changelog in "${CHANGELOGS[@]}"; do
      lang=$(echo "$changelog" | cut -d/ -f1)
      if [[ "$LANGUAGE" == "$lang" || "$LANGUAGE" == "all" ]]; then
          prepend_git_log_to_file "$changelog"
      fi
  done
}

print_generic_changes() {
git --no-pager log "${PREVIOUS_TAG}...HEAD" --pretty=format:"* %B %n %an http://github.com/seleniumhq/selenium/commit/%H" --reverse -- . ':!rb/' ':!py/' ':!javascript/' ':!dotnet/' ':!java/' ':!rust/' >> changelog_updates.md
}

CHANGELOGS=(
    "dotnet/CHANGELOG"
    "java/CHANGELOG"
    "javascript/node/selenium-webdriver/CHANGES.md"
    "py/CHANGES"
    "rb/CHANGES"
    "rust/CHANGELOG.md"
)

update_language_changelogs
print_generic_changes
