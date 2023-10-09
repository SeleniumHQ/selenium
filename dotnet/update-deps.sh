#! /usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

(
    cd "$SCRIPT_DIR" || exit 1
    (dotnet tool restore && dotnet tool run paket install)
    bazel run @rules_dotnet//tools/paket2bazel:paket2bazel.exe -- --dependencies-file "$(pwd)"/paket.dependencies --output-folder "$(pwd)"
)
