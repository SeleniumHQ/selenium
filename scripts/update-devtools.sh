#!/bin/bash

if [ -z "$1" ]; then
    echo "Please provide a language argument: java, dotnet, ruby, python, javascript, or all."
    exit 1
fi

LANGUAGE="$1"

FULL_VERSION=$(curl -s https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json | jq -r '.channels.Stable.version')

MAJOR_VERSION=$(echo "$FULL_VERSION" | cut -d'.' -f1)
PREVIOUS_VERSION=$((MAJOR_VERSION - 1))
REMOVING_VERSION=$((MAJOR_VERSION - 3))

# Update pdl files if target directory does not exist
TARGET_DIR="common/devtools/chromium/v${MAJOR_VERSION}"
if [ ! -d "$TARGET_DIR" ]; then
    REMOVING_DIR="common/devtools/chromium/v${REMOVING_VERSION}"
    if [ -d "$REMOVING_DIR" ]; then
        rm -r "$REMOVING_DIR"
        echo "Removed directory: $REMOVING_DIR"
    fi

    DEPS_CONTENT=$(curl -s "https://raw.githubusercontent.com/chromium/chromium/${FULL_VERSION}/DEPS")
    curl -O "https://raw.githubusercontent.com/chromium/chromium/${FULL_VERSION}/third_party/blink/public/devtools_protocol/browser_protocol.pdl"

    V8_REVISION=$(echo "$DEPS_CONTENT" | grep 'v8_revision' | awk -F': ' '{print $2}' | tr -d "',")
    curl -O "https://raw.githubusercontent.com/v8/v8/${V8_REVISION}/include/js_protocol.pdl"

    SOURCE_DIR="common/devtools/chromium/v${PREVIOUS_VERSION}"
    mkdir -p "$TARGET_DIR"

    if [ -d "$SOURCE_DIR" ]; then
        cp -r "$SOURCE_DIR/"* "$TARGET_DIR/"
    fi

    mv js_protocol.pdl "$TARGET_DIR"
    mv browser_protocol.pdl "$TARGET_DIR"
    echo "Contents from $SOURCE_DIR have been copied to $TARGET_DIR!"

    # Fix known syntax issue with downloaded pdl
    sed -i '' 's/`<script>`/`script`/g' "$TARGET_DIR/browser_protocol.pdl"

    git add "$TARGET_DIR/*"
fi

create_new_version_files() {
    SRC_BASE=$1
    SRC="$SRC_BASE/v${PREVIOUS_VERSION}"
    TARGET="$SRC_BASE/v${MAJOR_VERSION}"
    if [ ! -d "$TARGET" ]; then
        REMOVING="$SRC_BASE/v${REMOVING_VERSION}"
        if [ -d "$REMOVING" ]; then
            rm -r "$REMOVING"
            echo "Removed directory: $REMOVING"
        fi

        if [ -d "$SRC" ] && [ "$(ls -A $SRC)" ]; then
            mkdir -p "$TARGET"
            cp -v "$SRC"/* "$TARGET"
            for file in "$TARGET"/*; do
                filename=$(basename -- "$file")
                sed -i '' "s/$PREVIOUS_VERSION/$MAJOR_VERSION/g" "$file"
                new_filename="${filename//$PREVIOUS_VERSION/$MAJOR_VERSION}"
                mv "$file" "$TARGET/$new_filename"
            done
        else
            echo "$SRC does not exist or is empty."
        fi
        git add "$TARGET/*"
    fi
}

update_java() {
    create_new_version_files "java/src/org/openqa/selenium/devtools"
    sed -i '' "s/${REMOVING_VERSION}/${MAJOR_VERSION}/g" "java/src/org/openqa/selenium/devtools/versions.bzl"
    sed -i '' "s/v${REMOVING_VERSION}/v${MAJOR_VERSION}/g" "Rakefile"
}

update_dotnet() {
    create_new_version_files "dotnet/src/webdriver/DevTools"
    sed -i '' "s/v${REMOVING_VERSION}/v${MAJOR_VERSION}/g" "dotnet/selenium-dotnet-version.bzl"
    sed -i '' "s/${REMOVING_VERSION}/${MAJOR_VERSION}/g" "dotnet/src/webdriver/WebDriver.csproj.prebuild.cmd"
    sed -i '' "s/${REMOVING_VERSION}/${MAJOR_VERSION}/g" "dotnet/src/webdriver/WebDriver.csproj.prebuild.sh"
    sed -i '' "s/${REMOVING_VERSION}/${MAJOR_VERSION}/g" "dotnet/src/webdriver/DevTools/DevToolsDomains.cs"
    for file in dotnet/test/common/DevTools/*; do
        sed -i '' "s/V${PREVIOUS_VERSION}/V${MAJOR_VERSION}/g"  "$file"
    done
    sed -i '' "s/${PREVIOUS_VERSION}/${MAJOR_VERSION}/g" "dotnet/test/common/CustomDriverConfigs/StableChannelChromeDriver.cs"
}

update_ruby() {
    sed -i '' "s/${REMOVING_VERSION}/${MAJOR_VERSION}/g" "rb/lib/selenium/devtools/BUILD.bazel"
    sed -i '' "s/${PREVIOUS_VERSION}\.[0-9]*/${MAJOR_VERSION}.0/g" "rb/lib/selenium/devtools/version.rb"
}

update_python() {
    sed -i '' "s/${REMOVING_VERSION}/${MAJOR_VERSION}/g" "py/BUILD.bazel"
}

update_javascript() {
    sed -i '' "s/${REMOVING_VERSION}/${MAJOR_VERSION}/g" "javascript/node/selenium-webdriver/BUILD.bazel"
}

case $LANGUAGE in
    "java")
        update_java
        ;;
    "dotnet")
        update_dotnet
        ;;
    "ruby")
        update_ruby
        ;;
    "python")
        update_python
        ;;
    "javascript")
        update_javascript
        ;;
    "all")
        update_java
        update_dotnet
        update_ruby
        update_python
        update_javascript
        ;;
esac
