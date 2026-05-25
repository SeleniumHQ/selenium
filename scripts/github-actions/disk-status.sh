#!/usr/bin/env bash
#
# Print a disk-status snapshot for use as a CI checkpoint:
# Also exports AVAIL_GB (available space in GB

echo "=== Disk space ==="
df -h "$GITHUB_WORKSPACE" || true
if [[ "$RUNNER_OS" == "Windows" ]]; then df -h /c || true; fi

# On Windows the workspace is on D: but C: is the constrained drive
if [[ "$RUNNER_OS" == "Windows" ]]; then
  AVAIL_GB=$(df -k /c | awk 'NR==2 {printf "%.0f", $4/1024/1024}')
else
  AVAIL_GB=$(df -k "$GITHUB_WORKSPACE" | awk 'NR==2 {printf "%.0f", $4/1024/1024}')
fi
export AVAIL_GB
echo "Available: ${AVAIL_GB}GB"

if [[ "$RUNNER_OS" == "Windows" ]]; then
  output_base="/d/b"
  repos="/d/b-repo"
  bazelisk="/c/Users/runneradmin/AppData/Local/bazelisk"
else
  output_base="$HOME/.bazel"
  repos="$HOME/.cache/bazel-repo"
  bazelisk="$HOME/.cache/bazelisk"
fi

measure() {
  local label="$1" path="$2"
  echo "=== $label ($path) ==="
  if [ -d "$path" ]; then
    du -sh "$path" 2>/dev/null | awk '{print "total:  " $0}'
    du -sh "$path"/* 2>/dev/null | sort -h
  else
    echo "  (not present)"
  fi
}

measure "Bazel output_base" "$output_base"
measure "External cache"    "$output_base/external"
measure "Repository cache"  "$repos"
measure "Bazelisk cache"    "$bazelisk"
