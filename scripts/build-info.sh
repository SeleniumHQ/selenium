#!/bin/bash

revision=$(git rev-parse --short HEAD)
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  dirty="*"
else
  dirty=""
fi

echo "STABLE_GIT_REVISION $revision$dirty"
