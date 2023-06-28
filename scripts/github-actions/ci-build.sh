#!/usr/bin/env bash

set -eufo pipefail
# We want to see what's going on
set -x

# The ruby version may have been set by the CI runner. Stash
# changes while we check to see if we need to reformat the
# code.
git stash

# Fail the build if the format script needs to be re-run
./scripts/format.sh
git diff --exit-code

# Now we're made it out, reapply changes made by the build
# runner
git stash apply

# The NPM repository rule wants to write to the HOME directory
# but that's configured for the remote build machines, so run
# that repository rule first so that the subsequent remote
# build runs successfully. We don't care what the output is.
bazel query @npm//:all >/dev/null

# Now run the tests. The engflow build uses pinned browsers
# so this should be fine
bazel test --config=remote-ci --keep_going //java/...
