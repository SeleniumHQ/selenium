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

# Cache sizes above rarely explain a full disk: build outputs (bazel-out /
# execroot under the output base), the checked-out source, and browser/test
# runtime files (in TMP) live elsewhere and are what actually balloon.
if [[ "$RUNNER_OS" == "Windows" ]]; then
  output_base="/d/b"
  tmpdir="${RUNNER_TEMP:-/c/Users/runneradmin/AppData/Local/Temp}"
else
  output_base="$HOME/.bazel"
  tmpdir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
fi

echo "=== Other space consumers ==="
cache_size "Bazel output base" "$output_base"
cache_size "Workspace (code)" "$GITHUB_WORKSPACE"
cache_size "Build dir" "$GITHUB_WORKSPACE/build"
cache_size "Temp" "$tmpdir"
[ "$tmpdir" = "/tmp" ] || cache_size "/tmp" "/tmp"

# When space is getting tight, drill into the biggest directories and files so
# the culprit is obvious in the log (catches the ~29GB balloon, skips healthy
# ~100GB+ runs). du/find are depth- and size-bounded to stay fast and do not
# follow symlinks, so the bazel-out symlink in the workspace is not traversed.
if [ "${AVAIL_GB:-99}" -lt 50 ]; then
  roots=()
  [ -d "$output_base" ] && roots+=("$output_base")
  [ -d "$tmpdir" ] && roots+=("$tmpdir")
  [ "$tmpdir" != "/tmp" ] && [ -d /tmp ] && roots+=("/tmp")
  [ -n "$GITHUB_WORKSPACE" ] && [ -d "$GITHUB_WORKSPACE" ] && roots+=("$GITHUB_WORKSPACE")
  if [ ${#roots[@]} -gt 0 ]; then
    echo "=== Largest directories (AVAIL ${AVAIL_GB}GB) ==="
    du -h -d 3 "${roots[@]}" 2>/dev/null | sort -rh | head -25 | sed 's/^/  /'
    echo "=== Largest files (>200M) ==="
    find "${roots[@]}" -type f -size +200M 2>/dev/null \
      | xargs -r du -h 2>/dev/null | sort -rh | head -25 | sed 's/^/  /'
  fi
fi
