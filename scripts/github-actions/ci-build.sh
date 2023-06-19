#!/usr/bin/env bash

set -eufo pipefail
# We want to see what's going on
set -x

# We want to use a pre-built Ruby version
echo 'RUBY_VERSION = "jruby-9.4.2.0"' >rb/ruby_version.bzl

# The NPM repository rule wants to write to the HOME directory
# but that's configured for the remote build machines, so run
# that repository rule first so that the subsequent remote
# build runs successfully.
bazel query @npm//:all

# Now run the tests. The engflow build uses pinned browsers
# so this should be fine
bazel test --config=remote --keep_going //java/...
