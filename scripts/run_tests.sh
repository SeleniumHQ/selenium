#!/usr/bin/env bash
set -euo pipefail

# Default to headless unless overridden
HEADLESS=${HEADLESS:-true}
export HEADLESS

python -m pytest "${@}"
