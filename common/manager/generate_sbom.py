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

"""Generate a CycloneDX SBOM for the Selenium Manager Rust binary.

Runs fully offline and cargo-free so it stays hermetic under Bazel. The
component list, purls, checksums, and dependency graph come from
``rust/Cargo.lock``. Licenses come from the crates' own ``Cargo.toml``
manifests, which crate_universe has already vendored on disk; the surrounding
Bazel aspect (see crate_metadata.bzl) harvests those manifests off the
dependency graph and passes them in via repeated ``--manifest`` arguments.
Any component without a matching manifest license is emitted as ``NOASSERTION``.
"""

import argparse
import json
import re


def parse_manifest(text):
    """Extract (name, version, SPDX-license) from a crate's Cargo.toml.

    Only the ``[package]`` table is inspected so keys such as a dependency's
    own ``version`` never leak in. ``license-file`` crates (no SPDX string)
    resolve to ``None`` here; their license text still ships for the NOTICE.
    """
    table = re.search(r"(?ms)^\[package\]\s*$(.*?)(?=^\[|\Z)", text)
    if not table:
        return None, None, None
    body = table.group(1)

    def field(key):
        match = re.search(r"(?m)^\s*" + re.escape(key) + r'\s*=\s*"([^"]*)"', body)
        return match.group(1) if match else None

    return field("name"), field("version"), field("license")


def load_licenses(manifest_paths):
    licenses = {}
    for path in manifest_paths:
        with open(path, encoding="utf-8") as handle:
            name, version, expression = parse_manifest(handle.read())
        if name and version and expression:
            licenses[f"{name}@{version}"] = expression
    return licenses


def parse_lockfile(text):
    """Parse the subset of Cargo.lock we need without a TOML dependency."""
    packages = []
    for block in text.split("[[package]]")[1:]:
        name = re.search(r'(?m)^name = "([^"]+)"', block)
        version = re.search(r'(?m)^version = "([^"]+)"', block)
        source = re.search(r'(?m)^source = "([^"]+)"', block)
        checksum = re.search(r'(?m)^checksum = "([^"]+)"', block)
        deps = []
        dep_block = re.search(r"(?ms)^dependencies = \[(.*?)\]", block)
        if dep_block:
            deps = re.findall(r'"([^"]+)"', dep_block.group(1))
        packages.append(
            {
                "name": name.group(1) if name else None,
                "version": version.group(1) if version else None,
                "source": source.group(1) if source else None,
                "checksum": checksum.group(1) if checksum else None,
                "deps": deps,
            }
        )
    return packages


def purl(pkg):
    return f"pkg:cargo/{pkg['name']}@{pkg['version']}"


def resolve_ref(dep, by_name):
    """Map a Cargo.lock dependency entry to a bom-ref.

    Entries are either ``"name"`` (unambiguous) or ``"name version"`` when the
    graph pins multiple versions of the same crate.
    """
    parts = dep.split(" ", 1)
    name = parts[0]
    if len(parts) == 2:
        return f"pkg:cargo/{name}@{parts[1]}"
    candidates = by_name.get(name)
    if candidates and len(candidates) == 1:
        return purl(candidates[0])
    return None


def build_component(pkg, licenses):
    component = {
        "type": "library",
        "bom-ref": purl(pkg),
        "name": pkg["name"],
        "version": pkg["version"],
        "purl": purl(pkg),
        "licenses": [{"expression": licenses.get(f"{pkg['name']}@{pkg['version']}", "NOASSERTION")}],
    }
    if pkg["checksum"]:
        component["hashes"] = [{"alg": "SHA-256", "content": pkg["checksum"]}]
    if pkg["source"] and pkg["source"].startswith("registry+"):
        component["externalReferences"] = [
            {
                "type": "distribution",
                "url": f"https://crates.io/api/v1/crates/{pkg['name']}/{pkg['version']}/download",
            }
        ]
    return component


def build_sbom(packages, licenses, serial):
    by_name = {}
    for pkg in packages:
        by_name.setdefault(pkg["name"], []).append(pkg)

    # The workspace crate (no source) is the thing the SBOM describes.
    roots = [p for p in packages if not p["source"]]
    root = roots[0] if roots else None

    dependencies = []
    for pkg in packages:
        refs = [resolve_ref(d, by_name) for d in pkg["deps"]]
        refs = [r for r in refs if r]
        if refs:
            dependencies.append({"ref": purl(pkg), "dependsOn": sorted(set(refs))})

    metadata_component = None
    if root:
        metadata_component = {
            "type": "application",
            "bom-ref": purl(root),
            "name": root["name"],
            "version": root["version"],
            "purl": purl(root),
            "licenses": [{"expression": "Apache-2.0"}],
        }

    return {
        "$schema": "http://cyclonedx.org/schema/bom-1.5.schema.json",
        "bomFormat": "CycloneDX",
        "specVersion": "1.5",
        "serialNumber": serial,
        "version": 1,
        "metadata": {
            "tools": [{"vendor": "SeleniumHQ", "name": "generate_sbom.py"}],
            **({"component": metadata_component} if metadata_component else {}),
        },
        "components": [build_component(p, licenses) for p in packages if not (root and p is root)],
        "dependencies": dependencies,
    }


def main():
    # Bazel passes the (long) argument list as an @param-file.
    parser = argparse.ArgumentParser(description=__doc__, fromfile_prefix_chars="@")
    parser.add_argument("--lockfile", required=True, help="Path to Cargo.lock")
    parser.add_argument("--output", required=True, help="Path to write the CycloneDX JSON")
    parser.add_argument(
        "--manifest",
        action="append",
        default=[],
        dest="manifests",
        help="Crate Cargo.toml to source a license from (repeatable)",
    )
    parser.add_argument(
        "--serial",
        default="urn:uuid:00000000-0000-0000-0000-000000000000",
        help="Stable serialNumber; keep deterministic for reproducible builds",
    )
    args = parser.parse_args()

    with open(args.lockfile, encoding="utf-8") as handle:
        packages = parse_lockfile(handle.read())

    licenses = load_licenses(args.manifests)

    sbom = build_sbom(packages, licenses, args.serial)
    with open(args.output, "w", encoding="utf-8") as handle:
        json.dump(sbom, handle, indent=2, sort_keys=False)
        handle.write("\n")


if __name__ == "__main__":
    main()
