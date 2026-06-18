#!/usr/bin/env bash

set -eux -o pipefail

apt-get update
apt-get install -qy ca-certificates curl

curl -L -o /usr/bin/bazel https://github.com/bazelbuild/bazelisk/releases/download/v1.25.0/bazelisk-linux-amd64
chmod +x /usr/bin/bazel

temp="$(mktemp -d)"
cd "$temp"

cat > MODULE.bazel <<'EOF'
module(name = "ccregen")
bazel_dep(name = "rules_cc", version = "0.2.18")
cc_configure = use_extension("@rules_cc//cc:extensions.bzl", "cc_configure_extension")
use_repo(cc_configure, "local_config_cc")
EOF
touch BUILD.bazel

bazel build @local_config_cc//...

src="$(bazel info output_base)/external/rules_cc++cc_configure_extension+local_config_cc"
rm -rf /code/common/remote-build/cc
mkdir /code/common/remote-build/cc
cp -Lr "$src"/* /code/common/remote-build/cc
