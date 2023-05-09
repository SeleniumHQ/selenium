#!/usr/bin/env bash

set -eux -o pipefail

apt-get update
apt-get install -qy ca-certificates curl

curl -L -o /usr/bin/bazel https://github.com/bazelbuild/bazelisk/releases/download/v1.16.0/bazelisk-linux-amd64
chmod +x /usr/bin/bazel

temp="$(mktemp -d)"
cd "$temp"

touch WORKSPACE BUILD.bazel
bazel build @local_config_cc//...
rm -rf /code/common/remote-build/cc
mkdir /code/common/remote-build/cc
cp -Lr $(bazel info output_base)/external/local_config_cc/* /code/common/remote-build/cc
