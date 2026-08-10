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
It also refreshes two companion pins at the same time so they stay in lockstep:
the per-spec ``dfns`` indexes (same webref commit), and the rendered core spec
HTML pinned from ``w3c/webdriver-bidi``'s ``gh-pages`` branch (its prose section
anchors are the source of the readable ``#type-``/``#command-`` spec links, and
that branch is a separate repo, so it is pinned to its own tip). It regenerates:

  - ``_COMMIT``, ``_CDDL_FILES``, ``_DFNS_FILES``, and the ``_BIDI_SPEC_HTML_*``
    pins in ``common/webref_cddl.bzl``
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
DFNS_PATH = "ed/dfns"
API_HEADERS = {"Accept": "application/vnd.github+json", "User-Agent": "selenium-update-cddl"}

# The webref dfns index for each spec merged into the BiDi schema (a deliberate subset
# of everything webref publishes — only these feed generation). Each is (repo_name,
# dfns_filename); the sha256 is refreshed from the pinned webref commit. Keep in sync
# with the javascript/ and py/ BUILD merge lists.
MERGED_DFNS = [
    ("webdriver_bidi_dfns", "webdriver-bidi.json"),
    ("permissions_dfns", "permissions.json"),
    ("prefetch_dfns", "prefetch.json"),
    ("ua_client_hints_dfns", "ua-client-hints.json"),
    ("web_bluetooth_dfns", "web-bluetooth.json"),
]

# The rendered core spec is pinned separately: it lives in w3c/webdriver-bidi's
# "gh-pages" branch (which commits the built HTML), not in webref. Its prose section
# anchors are the only source of the readable `#type-`/`#command-` links.
BIDI_SPEC_REPO = "w3c/webdriver-bidi"
BIDI_SPEC_BRANCH = "gh-pages"
BIDI_SPEC_FILE = "index.html"
BIDI_SPEC_REPO_NAME = "webdriver_bidi_spec_html"

BZL_FILE = root_dir / "common" / "webref_cddl.bzl"
MODULE_FILE = root_dir / "MODULE.bazel"


def resolve_commit(branch):
    return resolve_commit_for(REPO, branch)


def list_cddl_files(commit):
    r = http.request(
        "GET",
        f"https://api.github.com/repos/{REPO}/contents/{CDDL_PATH}?ref={commit}",
        headers=API_HEADERS,
    )
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


def sha256_of_url(url):
    r = http.request("GET", url)
    if r.status != 200:
        raise RuntimeError(f"Failed to download {url}: HTTP {r.status}")
    return hashlib.sha256(r.data).hexdigest()


def sha256_of(commit, filename):
    return sha256_of_url(f"https://raw.githubusercontent.com/{REPO}/{commit}/{CDDL_PATH}/{filename}")


def build_entries(commit, filenames):
    return [(repo_name(name), name, sha256_of(commit, name)) for name in filenames]


def build_dfns_entries(commit):
    """(repo, dfns_filename, sha256) for each merged spec, hashed at the webref commit."""
    return [
        (name, filename, sha256_of_url(f"https://raw.githubusercontent.com/{REPO}/{commit}/{DFNS_PATH}/{filename}"))
        for name, filename in MERGED_DFNS
    ]


def resolve_bidi_spec(branch):
    """Resolve the w3c/webdriver-bidi gh-pages tip and hash its rendered index.html."""
    commit = resolve_commit_for(BIDI_SPEC_REPO, branch)
    url = f"https://raw.githubusercontent.com/{BIDI_SPEC_REPO}/{commit}/{BIDI_SPEC_FILE}"
    return commit, sha256_of_url(url)


def resolve_commit_for(repo, branch):
    r = http.request("GET", f"https://api.github.com/repos/{repo}/commits/{branch}", headers=API_HEADERS)
    if r.status != 200:
        raise RuntimeError(f"Failed to resolve {repo}@{branch}: HTTP {r.status}")
    return json.loads(r.data)["sha"]


def existing_repo_names(content):
    return set(re.findall(r'\(\s*"([a-z0-9_]+)"\s*,\s*"[^"]+\.cddl"', content))


def render_files(var, entries):
    lines = [f"{var} = ["]
    for name, filename, sha256 in entries:
        lines.append(f'    ("{name}", "{filename}", "{sha256}"),')
    lines.append("]")
    return "\n".join(lines)


def sub_once(content, pattern, replacement, where):
    content, n = re.subn(pattern, replacement, content, flags=re.S)
    if n != 1:
        raise RuntimeError(f"Expected exactly one {where} in {BZL_FILE.name}, found {n}")
    return content


def update_pin(commit, cddl_entries, dfns_entries, bidi_commit, bidi_sha256):
    content = BZL_FILE.read_text()

    # Anchor so this does not also match the tail of `_BIDI_SPEC_HTML_COMMIT = "…"`.
    content = sub_once(content, r'(?<![A-Z_])_COMMIT = "[0-9a-f]+"', f'_COMMIT = "{commit}"', "_COMMIT assignment")
    content = sub_once(
        content, r"_CDDL_FILES = \[.*?\n\]", lambda _: render_files("_CDDL_FILES", cddl_entries), "_CDDL_FILES block"
    )
    content = sub_once(
        content, r"_DFNS_FILES = \[.*?\n\]", lambda _: render_files("_DFNS_FILES", dfns_entries), "_DFNS_FILES block"
    )
    content = sub_once(
        content,
        r'_BIDI_SPEC_HTML_COMMIT = "[0-9a-f]+"',
        f'_BIDI_SPEC_HTML_COMMIT = "{bidi_commit}"',
        "_BIDI_SPEC_HTML_COMMIT assignment",
    )
    content = sub_once(
        content,
        r'_BIDI_SPEC_HTML_SHA256 = "[0-9a-f]+"',
        f'_BIDI_SPEC_HTML_SHA256 = "{bidi_sha256}"',
        "_BIDI_SPEC_HTML_SHA256 assignment",
    )

    BZL_FILE.write_text(content)


def update_module(repo_names):
    content = MODULE_FILE.read_text()
    repo_list = "\n".join(f'    "{name}",' for name in sorted(repo_names))
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

    before = existing_repo_names(BZL_FILE.read_text())

    filenames = list_cddl_files(commit)
    print(f"Found {len(filenames)} CDDL files in {CDDL_PATH}")
    cddl_entries = build_entries(commit, filenames)

    dfns_entries = build_dfns_entries(commit)
    print(f"Refreshed {len(dfns_entries)} dfns indexes in {DFNS_PATH}")

    bidi_commit, bidi_sha256 = resolve_bidi_spec(BIDI_SPEC_BRANCH)
    print(f"Pinning {BIDI_SPEC_REPO}@{bidi_commit} ({BIDI_SPEC_FILE})")

    update_pin(commit, cddl_entries, dfns_entries, bidi_commit, bidi_sha256)

    cddl_names = {name for name, _, _ in cddl_entries}
    repo_names = cddl_names | {name for name, _, _ in dfns_entries} | {BIDI_SPEC_REPO_NAME}
    update_module(repo_names)

    for name in sorted(cddl_names - before):
        print(f"  added: {name}")
    for name in sorted(before - cddl_names):
        print(f"  removed: {name}")
    print(f"Updated {BZL_FILE.relative_to(root_dir)} and {MODULE_FILE.relative_to(root_dir)}")


if __name__ == "__main__":
    main()
