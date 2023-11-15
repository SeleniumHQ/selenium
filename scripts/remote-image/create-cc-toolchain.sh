#!/usr/bin/env bash

set -eux -o pipefail

docker build --platform linux/amd64 -t selenium-remote-build -f scripts/remote-image/Dockerfile scripts/remote-image

docker run \
    -v $(pwd):/code \
    --rm  \
    --platform linux/amd64 \
    -w /code \
    --entrypoint /code/scripts/remote-image/create-cc-toolchain-within-image.sh \
    selenium-remote-build
