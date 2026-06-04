#!/usr/bin/env bash
#
# Print a disk-status snapshot for use as a CI checkpoint:
# Also exports AVAIL_GB (available space in GB

echo "=== Disk space ==="
df -h "$GITHUB_WORKSPACE" || true
# Also show the Windows system drive (C:) for reference. The build runs on the
# workspace drive (D: on Windows, / on Linux), so that is what we measure below.
if [[ "$RUNNER_OS" == "Windows" ]]; then df -h /c || true; fi

# Available space on the drive the build actually uses (the workspace).
AVAIL_GB=$(df -k "$GITHUB_WORKSPACE" | awk 'NR==2 {printf "%.0f", $4/1024/1024}')
if ! [[ "$AVAIL_GB" =~ ^[0-9]+$ ]]; then
  echo "::error::Could not determine available disk space (got: '${AVAIL_GB}')"
  AVAIL_GB=0
fi
export AVAIL_GB
echo "Available: ${AVAIL_GB}GB"

if [[ "$RUNNER_OS" == "Windows" ]]; then
  external="/d/b/external"
  repos="/d/b-repo"
  bazelisk="/c/Users/runneradmin/AppData/Local/bazelisk"
else
  external="$HOME/.bazel/external"
  repos="$HOME/.cache/bazel-repo"
  bazelisk="$HOME/.cache/bazelisk"
fi

echo "=== Bazel cache sizes ==="
cache_size() {
  local label="$1" path="$2"
  if [ -d "$path" ]; then
    local size
    size=$(du -sh "$path" 2>/dev/null | awk '{print $1}')
    printf "  %-25s %s\n" "${label}:" "$size"
  else
    printf "  %-25s (not present)\n" "${label}:"
  fi
}
cache_size "External" "$external"
if [ -d "$repos" ]; then
  for sub in "$repos"/*/; do
    [ -d "$sub" ] || continue
    case "$(basename "$sub")" in
      content_addressable) label="Repository Cache" ;;
      contents)            label="Repo Contents Cache" ;;
      *)                   label="Repository/$(basename "$sub")" ;;
    esac
    cache_size "$label" "$sub"
  done
else
  cache_size "Repository Cache" "$repos"
fi
cache_size "Bazelisk" "$bazelisk"
