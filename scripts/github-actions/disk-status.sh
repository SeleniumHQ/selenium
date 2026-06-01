#!/usr/bin/env bash
#
# Print a disk-status snapshot for use as a CI checkpoint:
# Also exports AVAIL_GB (available space in GB

# Sourced by CI steps running under `bash -eo pipefail`. du/find over trees that
# contain unreadable entries (e.g. /tmp) exit non-zero, which would otherwise
# abort the step; these are best-effort diagnostics, so disable that here.
# AVAIL_GB is still computed and exported below for callers that gate on it.
set +e +o pipefail

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

# Cache sizes above rarely explain a full disk. The real output base
# (bazel-out/execroot, where test logs/outputs land) is at ~/.bazel here, and
# browser/test runtime files live in TMP; measure those for a quick per-tick
# view. setup-bazel reports ~/.bazel as the output base, but ~/.cache/bazel
# holds the install tree, so show both.
if [[ "$RUNNER_OS" == "Windows" ]]; then
  output_base="/d/b"
  tmpdir="${RUNNER_TEMP:-/c/Users/runneradmin/AppData/Local/Temp}"
else
  output_base="$HOME/.bazel"
  tmpdir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
fi

echo "=== Other space consumers ==="
cache_size "Output base (~/.bazel)" "$output_base"
cache_size "Bazel install" "$HOME/.cache/bazel"
cache_size "Workspace (code)" "$GITHUB_WORKSPACE"
cache_size "Build dir" "$GITHUB_WORKSPACE/build"
cache_size "Temp" "$tmpdir"
[ "$tmpdir" = "/tmp" ] || cache_size "/tmp" "/tmp"

# When space is getting tight, account for ALL of it. Per-dir du can miss two
# things that still consume df space: directories we didn't think to scan, and
# files a process has unlinked but kept open (df counts them, du/find cannot
# see them). So scan the whole root fs with sudo, and list deleted-but-open
# files. sudo/lsof are best-effort; failures are ignored (set +e above).
if [ "${AVAIL_GB:-99}" -lt 50 ]; then
  echo "=== Largest dirs on / (sudo du -x -d3, top 30) (AVAIL ${AVAIL_GB}GB) ==="
  sudo du -x -d3 / 2>/dev/null | sort -rh | head -30 | sed 's/^/  /'
  echo "=== Largest files >200M on / ==="
  sudo find / -xdev -type f -size +200M 2>/dev/null \
    | xargs -r du -h 2>/dev/null | sort -rh | head -25 | sed 's/^/  /'
  echo "=== Deleted-but-open files (space df counts but du cannot see) ==="
  if command -v lsof >/dev/null 2>&1; then
    sudo lsof -nP 2>/dev/null | awk '/\(deleted\)/' | sort -k7 -rn | head -15 | sed 's/^/  /'
    sudo lsof -nP 2>/dev/null \
      | awk '/\(deleted\)/{s+=$7; n++} END{printf "  total deleted-open: ~%.2f GB across %d fds\n", s/1073741824, n+0}'
  else
    echo "  (lsof not installed)"
  fi
fi
