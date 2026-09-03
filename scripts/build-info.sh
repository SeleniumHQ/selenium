#!/bin/bash

revision=$(git rev-parse --short HEAD)
full_revision=$(git rev-parse HEAD)
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  dirty="*"
else
  dirty=""
fi

echo "STABLE_GIT_REVISION $revision$dirty"
echo "STABLE_GIT_REVISION_FULL $full_revision$dirty"
