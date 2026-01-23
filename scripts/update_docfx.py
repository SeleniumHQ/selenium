#!/usr/bin/env python
"""Update docfx_repo.bzl to the latest DocFX package on NuGet.

This script fetches the latest stable DocFX version (or a user-specified one),
computes the nupkg sha256, and rewrites dotnet/private/docfx_repo.bzl.
"""

import argparse
import hashlib
import json
import os
from pathlib import Path

import urllib3
from packaging.version import InvalidVersion, Version

NUGET_INDEX_URL = "https://api.nuget.org/v3-flatcontainer/docfx/index.json"
NUGET_NUPKG_URL = "https://api.nuget.org/v3-flatcontainer/docfx/{version}/docfx.{version}.nupkg"

http = urllib3.PoolManager()


def fetch_json(url):
    r = http.request("GET", url)
    return json.loads(r.data)


def choose_version(versions, allow_prerelease, explicit_version=None):
    if explicit_version:
        if explicit_version not in versions:
            raise ValueError(f"Requested DocFX version {explicit_version!r} not found in NuGet index")
        return explicit_version

    parsed = []
    for v in versions:
        try:
            pv = Version(v)
        except InvalidVersion:
            continue
        if not allow_prerelease and pv.is_prerelease:
            continue
        parsed.append((pv, v))

    if not parsed:
        if allow_prerelease:
            raise ValueError("No parseable DocFX versions found in NuGet index")
        else:
            raise ValueError("No stable DocFX versions found. Use --allow-prerelease to include prereleases.")

    return max(parsed, key=lambda item: item[0])[1]


def sha256_of_url(url):
    digest = hashlib.sha256()
    r = http.request("GET", url, preload_content=False)
    for chunk in r.stream(1024 * 1024):
        digest.update(chunk)
    r.release_conn()
    return digest.hexdigest()


def render_docfx_repo(version, sha256):
    return f'''\
"""Repository rule to download the docfx NuGet package."""

_BUILD = """
package(default_visibility = ["//visibility:public"])
exports_files(glob(["**/*"]))
filegroup(name = "docfx_dll", srcs = ["tools/net8.0/any/docfx.dll"])
"""

def _docfx_repo_impl(ctx):
    ctx.download_and_extract(
        url = "https://api.nuget.org/v3-flatcontainer/docfx/{{0}}/docfx.{{0}}.nupkg".format(ctx.attr.version),
        sha256 = ctx.attr.sha256,
        type = "zip",
    )
    ctx.file("BUILD.bazel", _BUILD)

docfx_repo = repository_rule(
    implementation = _docfx_repo_impl,
    attrs = {{
        "version": attr.string(mandatory = True),
        "sha256": attr.string(mandatory = True),
    }},
)

def _docfx_extension_impl(module_ctx):
    docfx_repo(
        name = "docfx",
        version = "{version}",
        sha256 = "{sha256}",
    )
    return module_ctx.extension_metadata(reproducible = True)

docfx_extension = module_extension(implementation = _docfx_extension_impl)
'''


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--version",
        help="Use this DocFX version instead of the latest stable.",
    )
    parser.add_argument(
        "--allow-prerelease",
        action="store_true",
        help="Allow prerelease versions when selecting latest.",
    )
    parser.add_argument(
        "--output",
        default="dotnet/private/docfx_repo.bzl",
        help="Output file path (default: dotnet/private/docfx_repo.bzl)",
    )
    args = parser.parse_args()

    index = fetch_json(NUGET_INDEX_URL)
    versions = index.get("versions", [])
    if not versions:
        raise ValueError("NuGet index returned no versions for DocFX")

    version = choose_version(versions, args.allow_prerelease, args.version)
    nupkg_url = NUGET_NUPKG_URL.format(version=version)
    sha256 = sha256_of_url(nupkg_url)

    output_path = Path(args.output)
    if not output_path.is_absolute():
        workspace_dir = os.environ.get("BUILD_WORKSPACE_DIRECTORY")
        if workspace_dir:
            output_path = Path(workspace_dir) / output_path
    output_path.write_text(render_docfx_repo(version, sha256))

    print(f"Updated {output_path} to DocFX {version}")


if __name__ == "__main__":
    main()
