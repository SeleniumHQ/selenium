# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

"""Generate a third-party attribution NOTICE for the Selenium Manager binary.

Cargo-free and hermetic: the surrounding Bazel aspect (crate_metadata.bzl)
harvests each bundled crate's ``Cargo.toml`` and its ``LICENSE``/``NOTICE`` text
files off the dependency graph and passes them in via ``--manifest`` and
``--license-file``. The permissive licenses that dominate the crate graph
(MIT, BSD, ISC, Apache-2.0) require reproducing their copyright notice and
license text in binary distributions; this file is that reproduction.

License bodies are deduplicated: each distinct text is printed once and
referenced by number, so a hundred MIT crates do not emit a hundred copies.
"""

import argparse
import re

HEADER = """\
Selenium Manager bundles the following third-party Rust crates. Each crate is
listed with its version and SPDX license, followed by the full text of every
license it ships. This file is generated from the crates' own metadata and
covers the crates linked into the binary on every supported platform.

"""


def parse_manifest(text):
    table = re.search(r"(?ms)^\[package\]\s*$(.*?)(?=^\[|\Z)", text)
    if not table:
        return None, None, None
    body = table.group(1)

    def field(key):
        match = re.search(r"(?m)^\s*" + re.escape(key) + r'\s*=\s*"([^"]*)"', body)
        return match.group(1) if match else None

    return field("name"), field("version"), field("license")


def crate_id(path):
    """The vendored crate's repo id, e.g. ``reqwest-0.12.28``."""
    tail = path.rsplit("crates__", 1)
    if len(tail) != 2:
        return None
    return tail[1].split("/", 1)[0]


def read_text(path):
    with open(path, encoding="utf-8", errors="replace") as handle:
        return handle.read().strip("\n")


def build_notice(manifest_paths, license_paths):
    crates = {}
    for path in manifest_paths:
        cid = crate_id(path)
        if not cid:
            continue
        name, version, expression = parse_manifest(read_text(path))
        crates[cid] = {
            "name": name or cid,
            "version": version or "",
            "license": expression or "NOASSERTION",
            "texts": [],
        }

    for path in license_paths:
        cid = crate_id(path)
        if cid is None or cid not in crates:
            continue
        crates[cid]["texts"].append(read_text(path))

    # Deduplicate license bodies: text -> reference number.
    text_ids = {}
    ordered_texts = []
    for crate in crates.values():
        ids = []
        for text in crate["texts"]:
            if text not in text_ids:
                text_ids[text] = len(ordered_texts) + 1
                ordered_texts.append(text)
            ref = text_ids[text]
            if ref not in ids:
                ids.append(ref)
        crate["refs"] = ids

    lines = [HEADER, "=" * 78, "COMPONENTS", "=" * 78, ""]
    for cid in sorted(crates):
        crate = crates[cid]
        label = f"{crate['name']} {crate['version']}"
        refs = ", ".join(f"#{r}" for r in crate["refs"]) if crate["refs"] else "no bundled license text"
        lines.append(f"{label:<45} {crate['license']:<28} [{refs}]")

    lines += ["", "=" * 78, "LICENSE TEXTS", "=" * 78, ""]
    for index, text in enumerate(ordered_texts, start=1):
        lines.append("-" * 78)
        lines.append(f"[#{index}]")
        lines.append("-" * 78)
        lines.append(text)
        lines.append("")

    return "\n".join(lines) + "\n"


def main():
    # Bazel passes the (long) argument list as an @param-file.
    parser = argparse.ArgumentParser(description=__doc__, fromfile_prefix_chars="@")
    parser.add_argument("--output", required=True, help="Path to write the NOTICE file")
    parser.add_argument(
        "--manifest",
        action="append",
        default=[],
        dest="manifests",
        help="Crate Cargo.toml for a bundled crate (repeatable)",
    )
    parser.add_argument(
        "--license-file",
        action="append",
        default=[],
        dest="license_files",
        help="Crate LICENSE/NOTICE text file (repeatable)",
    )
    args = parser.parse_args()

    notice = build_notice(args.manifests, args.license_files)
    with open(args.output, "w", encoding="utf-8") as handle:
        handle.write(notice)


if __name__ == "__main__":
    main()
