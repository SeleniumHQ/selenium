#!/usr/bin/env python
"""Update the pinned CDDL spec files downloaded from w3c/webref.

The WebDriver BiDi (and related) CDDL grammars are not published as an npm
package; they are extracted from the edited specs and committed to the
``ed/cddl`` directory of https://github.com/w3c/webref . We pin a single
webref commit plus a sha256 for the ``-all`` (union) CDDL file of each
protocol in that directory (see ``common/webref_cddl.bzl``) so the Bazel
build fetches them reproducibly. The per-end ``-local``/``-remote`` splits are
skipped: generation merges the union, so only the ``-all`` files are consumed.

This script repoints that pin at the tip of webref's "main" branch (the
continuous reffy extraction; the "curated" branch is a separate published
lineage with no shared history, so main keeps pin-to-pin diffs auditable),
refreshes every hash, and picks up files that upstream has added or removed.
Because the file set drifts over time, it regenerates both:

  - the ``_COMMIT`` and ``_CDDL_FILES`` entries in ``common/webref_cddl.bzl``
  - the matching ``use_repo(...)`` list for the extension in ``MODULE.bazel``

-----------------------------------------------------------------------------
usage: update_cddl.py [-h] [--commit COMMIT] [--branch BRANCH]

options:
  -h, --help       show this help message and exit
  --commit COMMIT  pin this exact webref commit instead of the branch tip
  --branch BRANCH  webref branch to resolve when --commit is omitted (default: main)
-----------------------------------------------------------------------------
"""

import argparse
import hashlib
import json
import os
import re
from pathlib import Path

import urllib3

http = urllib3.PoolManager()
root_dir = Path(os.path.realpath(__file__)).parent.parent

REPO = "w3c/webref"
CDDL_PATH = "ed/cddl"
API_HEADERS = {"Accept": "application/vnd.github+json", "User-Agent": "selenium-update-cddl"}

BZL_FILE = root_dir / "common" / "webref_cddl.bzl"
MODULE_FILE = root_dir / "MODULE.bazel"


def resolve_commit(branch):
    r = http.request("GET", f"https://api.github.com/repos/{REPO}/commits/{branch}", headers=API_HEADERS)
    if r.status != 200:
        raise RuntimeError(f"Failed to resolve {REPO}@{branch}: HTTP {r.status}")
    return json.loads(r.data)["sha"]


def list_cddl_files(commit):
    r = http.request("GET", f"https://api.github.com/repos/{REPO}/contents/{CDDL_PATH}?ref={commit}", headers=API_HEADERS)
    if r.status != 200:
        raise RuntimeError(f"Failed to list {CDDL_PATH} at {commit}: HTTP {r.status}")
    entries = json.loads(r.data)
    # Only the "-all" union of each protocol is consumed; the local/remote splits
    # feed nothing (BiDi generation merges the union), so they are not pinned.
    return sorted(e["name"] for e in entries if e["type"] == "file" and e["name"].endswith("-all.cddl"))


def repo_name(filename):
    """Derive the Bazel repo name from a CDDL filename.

    ``at-driver-all.cddl`` -> ``at_driver_all_cddl``
    """
    return filename[: -len(".cddl")].replace("-", "_") + "_cddl"


def sha256_of(commit, filename):
    url = f"https://raw.githubusercontent.com/{REPO}/{commit}/{CDDL_PATH}/{filename}"
    r = http.request("GET", url)
    if r.status != 200:
        raise RuntimeError(f"Failed to download {url}: HTTP {r.status}")
    return hashlib.sha256(r.data).hexdigest()


def build_entries(commit, filenames):
    return [(repo_name(name), name, sha256_of(commit, name)) for name in filenames]


def existing_repo_names(content):
    return set(re.findall(r'\(\s*"([a-z0-9_]+)"\s*,\s*"[^"]+\.cddl"', content))


def render_cddl_files(entries):
    lines = ["_CDDL_FILES = ["]
    for name, filename, sha256 in entries:
        lines.append(f'    ("{name}", "{filename}", "{sha256}"),')
    lines.append("]")
    return "\n".join(lines)


def update_pin(commit, entries):
    content = BZL_FILE.read_text()
    before = existing_repo_names(content)

    content = re.sub(r'_COMMIT = "[0-9a-f]+"', f'_COMMIT = "{commit}"', content)
    content = re.sub(r"_CDDL_FILES = \[.*?\n\]", render_cddl_files(entries), content, flags=re.S)

    BZL_FILE.write_text(content)

    after = {name for name, _, _ in entries}
    return sorted(after - before), sorted(before - after)


def update_module(entries):
    content = MODULE_FILE.read_text()
    repo_list = "\n".join(f'    "{name}",' for name, _, _ in sorted(entries))
    new_block = f"use_repo(\n    webref_cddl_extension,\n{repo_list}\n)"
    content, count = re.subn(
        r"use_repo\(\n    webref_cddl_extension,\n.*?\n\)",
        new_block,
        content,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError(f"Expected exactly one webref_cddl_extension use_repo block, found {count}")
    MODULE_FILE.write_text(content)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--commit", help="pin this exact webref commit instead of the branch tip")
    parser.add_argument(
        "--branch",
        default="main",
        help="webref branch to resolve when --commit is omitted (default: main)",
    )
    args = parser.parse_args()

    commit = args.commit or resolve_commit(args.branch)
    print(f"Pinning {REPO}@{commit}")

    filenames = list_cddl_files(commit)
    print(f"Found {len(filenames)} CDDL files in {CDDL_PATH}")

    entries = build_entries(commit, filenames)
    added, removed = update_pin(commit, entries)
    update_module(entries)

    for name in added:
        print(f"  added: {name}")
    for name in removed:
        print(f"  removed: {name}")
    print(f"Updated {BZL_FILE.relative_to(root_dir)} and {MODULE_FILE.relative_to(root_dir)}")


if __name__ == "__main__":
    main()
