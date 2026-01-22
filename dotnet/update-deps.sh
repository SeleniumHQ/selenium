#! /usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
REPO_ROOT="$SCRIPT_DIR/.."

OUTPUT_BASE=$(cd "$REPO_ROOT" && bazel info output_base 2>/dev/null)
if [[ -n "$OUTPUT_BASE" && -d "$OUTPUT_BASE/external" ]]; then
    EXTERNAL_DIR="$OUTPUT_BASE/external"
    DOTNET_DIR=$(find "$EXTERNAL_DIR" -maxdepth 1 -name "rules_dotnet++dotnet+dotnet_*" -type d 2>/dev/null | head -1)
    if [[ -n "$DOTNET_DIR" && -x "$DOTNET_DIR/dotnet" ]]; then
        DOTNET="$DOTNET_DIR/dotnet"
        echo "Using bazel-managed dotnet: $DOTNET"
    fi
else
    echo "Warning: bazel info output_base failed; falling back to system dotnet" >&2
fi
DOTNET="${DOTNET:-dotnet}"

(
    cd "$SCRIPT_DIR" || exit 1
    ("$DOTNET" tool restore && "$DOTNET" tool run paket install)
    bazel run @rules_dotnet//tools/paket2bazel:paket2bazel -- --dependencies-file "$(pwd)/paket.dependencies" --output-folder "$(pwd)"
)
