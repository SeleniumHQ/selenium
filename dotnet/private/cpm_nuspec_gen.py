#!/usr/bin/env python3
"""Substitute the $dependencies$ token in a nuspec template with deps sourced from CPM.

Reads <PackageReference> entries from the given csproj, looks up each package's
version in Directory.Packages.props, and writes the template with $dependencies$
replaced by the rendered XML block. Other template tokens (e.g. $packageid$,
$version$) are left untouched for downstream substitution by Bazel's
ctx.actions.expand_template.

One <group> is emitted per TFM in --all-tfms. TFMs listed in --compat-tfms get
the full <dependency> set; other TFMs get an empty group. Packages with
PrivateAssets="all" in csproj are excluded.
"""

import argparse
import sys
import xml.etree.ElementTree as ET


def _strip_ns(elem):
    """Iterate descendants while ignoring XML namespaces on tags."""
    for e in elem.iter():
        tag = e.tag
        if "}" in tag:
            yield tag.split("}", 1)[1], e
        else:
            yield tag, e


def load_cpm_versions(path):
    versions = {}
    for tag, pkg in _strip_ns(ET.parse(path).getroot()):
        if tag != "PackageVersion":
            continue
        name = pkg.get("Include")
        version = pkg.get("Version")
        if name and version:
            versions[name] = version
    return versions


def load_csproj_packages(path):
    packages = []
    for tag, pkg in _strip_ns(ET.parse(path).getroot()):
        if tag != "PackageReference":
            continue
        name = pkg.get("Include")
        if not name:
            continue
        if (pkg.get("PrivateAssets") or "").lower() == "all":
            continue
        packages.append(name)
    return packages


def build_dependencies_block(packages, versions, compat_tfms, all_tfms):
    if not packages or not all_tfms:
        return ""
    deps = []
    for name in sorted(packages):
        if name not in versions:
            sys.exit(f"ERROR: package '{name}' referenced by csproj is not declared in Directory.Packages.props")
        deps.append(f'        <dependency id="{name}" version="{versions[name]}" exclude="Build,Analyzers" />')
    deps_xml = "\n".join(deps)
    groups = []
    for tfm in sorted(all_tfms):
        if tfm in compat_tfms:
            groups.append(f'      <group targetFramework="{tfm}">\n{deps_xml}\n      </group>')
        else:
            groups.append(f'      <group targetFramework="{tfm}">\n      </group>')
    return "<dependencies>\n{}\n    </dependencies>".format("\n".join(groups))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--template", required=True)
    p.add_argument("--cpm", required=True)
    p.add_argument("--csproj", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--compat-tfms", default="")
    p.add_argument("--all-tfms", default="")
    args = p.parse_args()

    compat_tfms = [t for t in args.compat_tfms.split(",") if t]
    all_tfms = [t for t in args.all_tfms.split(",") if t]

    versions = load_cpm_versions(args.cpm)
    packages = load_csproj_packages(args.csproj)
    deps_block = build_dependencies_block(packages, versions, compat_tfms, all_tfms)

    with open(args.template) as f:
        content = f.read()
    content = content.replace("$dependencies$", deps_block)

    with open(args.output, "w", newline="\n") as f:
        f.write(content)


if __name__ == "__main__":
    main()
