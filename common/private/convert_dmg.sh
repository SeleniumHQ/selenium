#!/bin/bash
# Copyright 2018 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
################################################################################
#
set -euo pipefail

DMGFILE=$1
OUTFILE=$2

CWD="$(pwd)"
case "$OUTFILE" in
    /*) OUTFILE_ABS="$OUTFILE" ;;
    *)  OUTFILE_ABS="$CWD/$OUTFILE" ;;
esac

# Scratch path local to the repository working dir so concurrent dmg_archive
# fetches don't race on a shared /tmp file.
SCRATCH="$CWD/.convert_dmg.$$.zip"
VOLUME=""

cleanup() {
    if [ -n "$VOLUME" ]; then
        hdiutil detach "$VOLUME" >/dev/null 2>&1 || true
    fi
    rm -f "$SCRATCH"
}
trap cleanup EXIT

if ! ATTACH_OUTPUT="$(hdiutil attach "$DMGFILE" 2>&1)"; then
    echo "hdiutil attach failed for $DMGFILE" >&2
    echo "$ATTACH_OUTPUT" >&2
    exit 1
fi
VOLUME="$(printf '%s\n' "$ATTACH_OUTPUT" | tail -1 | awk -F'\t' '{print $NF}')"
if [ -z "$VOLUME" ] || [ ! -d "$VOLUME" ]; then
    echo "hdiutil attach did not produce a mount point for $DMGFILE" >&2
    echo "$ATTACH_OUTPUT" >&2
    exit 1
fi

(cd "$VOLUME" && zip -r "$SCRATCH" ./*.app)
mv "$SCRATCH" "$OUTFILE_ABS"
