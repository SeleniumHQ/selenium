#! /usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
REPO_ROOT="$SCRIPT_DIR/.."

if [[ -d "$REPO_ROOT/bazel-selenium/external" ]]; then
    DOTNET_DIR=$(find "$REPO_ROOT/bazel-selenium/external" -maxdepth 1 -name "rules_dotnet++dotnet+dotnet_*" -type d | head -1)
    if [[ -n "$DOTNET_DIR" && -x "$DOTNET_DIR/dotnet" ]]; then
        DOTNET="$DOTNET_DIR/dotnet"
        echo "Using bazel-managed dotnet: $DOTNET"
    fi
fi
DOTNET="${DOTNET:-dotnet}"

(
    cd "$SCRIPT_DIR" || exit 1
    ("$DOTNET" tool restore && "$DOTNET" tool run paket install)
    bazel run @rules_dotnet//tools/paket2bazel:paket2bazel -- --dependencies-file "$(pwd)/paket.dependencies" --output-folder "$(pwd)"
)
