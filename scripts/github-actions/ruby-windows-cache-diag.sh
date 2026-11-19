#!/usr/bin/env bash
# Throwaway diagnostic for Ruby Windows remote cache misses; never merge.
set -uo pipefail

out=build/diag
mkdir -p "$out"

code=0
bazel test --execution_log_compact_file="$out/exec.binpb.zst" "$@" || code=$?

ob="$(bazel info output_base)"
for repo in "$ob"/external/rules_ruby++ruby+*; do
  name="$(basename "$repo")"
  [ -d "$repo" ] || continue
  echo "Hashing $name"
  (cd "$repo" && find . \( -type f -o -type l \) -print0 | sort -z | xargs -0 -r sha256sum) > "$out/$name.sha256" 2>"$out/$name.err" || true
  (cd "$repo" && find . -type l -printf '%p -> %l\n' | sort) > "$out/$name.symlinks" || true
  du -sh "$repo" >> "$out/sizes.txt" 2>&1 || true
done
exit "$code"
