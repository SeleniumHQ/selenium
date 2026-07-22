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

"""Harvest vendored crate license metadata off the Rust dependency graph.

crate_universe has already fetched every crate's source, so each crate's
``Cargo.toml`` (its SPDX ``license``) and its ``LICENSE``/``NOTICE`` text files
are on disk and reachable as Bazel inputs via the crate rule's ``compile_data``.
This aspect walks the dependency graph and collects both, so the SBOM's licenses
and the third-party attribution NOTICE are a hermetic, cargo-free function of
what Bazel already downloaded.
"""

CrateMetadataInfo = provider(
    doc = "Transitive vendored crate manifests and license-text files.",
    fields = {
        "manifests": "depset of root Cargo.toml File objects",
        "license_files": "depset of root LICENSE/NOTICE text File objects",
    },
)

# rust_binary/rust_library attributes that carry crate edges to follow.
_CRATE_EDGES = ["deps", "proc_macro_deps"]

# The binary links a different crate subset per OS/arch (e.g. winapi only on
# Windows). Seed the aspect under every shipped target platform and union the
# results so the SBOM/NOTICE cover all of them. Only the crates' vendored
# source files (Cargo.toml, LICENSE) are consumed, so nothing is cross-compiled.
_TARGET_PLATFORMS = [
    "@rules_rs//rs/platforms:aarch64-apple-darwin",
    "@rules_rs//rs/platforms:x86_64-apple-darwin",
    "@rules_rs//rs/platforms:aarch64-unknown-linux-gnu",
    "@rules_rs//rs/platforms:x86_64-unknown-linux-gnu",
    "@rules_rs//rs/platforms:aarch64-pc-windows-msvc",
    "@rules_rs//rs/platforms:x86_64-pc-windows-msvc",
]

def _platforms_split_impl(_settings, _attr):
    return {platform: {"//command_line_option:platforms": platform} for platform in _TARGET_PLATFORMS}

_platforms_split = transition(
    implementation = _platforms_split_impl,
    inputs = [],
    outputs = ["//command_line_option:platforms"],
)

# Root filenames (uppercased) that hold reproducible license/attribution text.
_LICENSE_PREFIXES = ["LICENSE", "LICENCE", "COPYING", "COPYRIGHT", "NOTICE", "UNLICENSE"]

def _is_repo_root(file):
    """True when the file sits at a vendored crate's repo root.

    Filters out nested fixtures like ``crates__foo-1.0/tests/bar/LICENSE``.
    """
    tail = file.path.rsplit("crates__", 1)
    return len(tail) == 2 and tail[1].count("/") == 1

def _is_license_file(name):
    upper = name.upper()
    for prefix in _LICENSE_PREFIXES:
        if upper.startswith(prefix):
            return True
    return False

def _collect(ctx):
    manifests = []
    license_files = []
    for attr in ["compile_data", "data"]:
        if not hasattr(ctx.rule.attr, attr):
            continue
        for dep in getattr(ctx.rule.attr, attr):
            for file in dep.files.to_list():
                if not _is_repo_root(file):
                    continue
                if file.basename == "Cargo.toml":
                    manifests.append(file)
                elif _is_license_file(file.basename):
                    license_files.append(file)
    return manifests, license_files

def _aspect_impl(_target, ctx):
    manifests, license_files = _collect(ctx)
    manifest_deps = []
    license_deps = []
    for attr in _CRATE_EDGES:
        if hasattr(ctx.rule.attr, attr):
            for dep in getattr(ctx.rule.attr, attr):
                if CrateMetadataInfo in dep:
                    manifest_deps.append(dep[CrateMetadataInfo].manifests)
                    license_deps.append(dep[CrateMetadataInfo].license_files)
    return [CrateMetadataInfo(
        manifests = depset(direct = manifests, transitive = manifest_deps),
        license_files = depset(direct = license_files, transitive = license_deps),
    )]

crate_manifests_aspect = aspect(
    implementation = _aspect_impl,
    attr_aspects = _CRATE_EDGES,
    doc = "Collects transitive vendored crate Cargo.toml and license-text files.",
)

def _crate_targets(crates_attr):
    """Flatten the crates attr, whether a plain list or a split-transition dict.

    A split transition makes a label_list surface as ``dict[str, list[Target]]``
    (one entry per target platform); each platform contributes its own crate
    closure, which we merge.
    """
    if type(crates_attr) == "dict":
        targets = []
        for per_platform in crates_attr.values():
            targets.extend(per_platform)
        return targets
    return crates_attr

def _transitive(crates_attr, field):
    return depset(transitive = [
        getattr(dep[CrateMetadataInfo], field)
        for dep in _crate_targets(crates_attr)
        if CrateMetadataInfo in dep
    ])

def _sbom_impl(ctx):
    manifests = _transitive(ctx.attr.crates, "manifests")
    out = ctx.actions.declare_file(ctx.attr.out or (ctx.label.name + ".cdx.json"))

    args = ctx.actions.args()
    args.add("--lockfile", ctx.file.lockfile)
    args.add("--output", out)
    args.add_all(manifests, before_each = "--manifest")
    args.use_param_file("@%s", use_always = True)
    args.set_param_file_format("multiline")

    ctx.actions.run(
        outputs = [out],
        inputs = depset([ctx.file.lockfile], transitive = [manifests]),
        executable = ctx.executable._generator,
        arguments = [args],
        mnemonic = "SeleniumManagerSbom",
        progress_message = "Generating CycloneDX SBOM %{output}",
    )
    return [DefaultInfo(files = depset([out]))]

selenium_manager_sbom = rule(
    implementation = _sbom_impl,
    doc = "Generate a cargo-free CycloneDX SBOM for the Selenium Manager binary.",
    attrs = {
        "crates": attr.label_list(
            aspects = [crate_manifests_aspect],
            cfg = _platforms_split,
            doc = "Seed target(s) whose transitive crate graph supplies licenses.",
        ),
        "lockfile": attr.label(
            allow_single_file = True,
            mandatory = True,
            doc = "Cargo.lock defining the component list and dependency graph.",
        ),
        "out": attr.string(doc = "Output filename; defaults to <name>.cdx.json."),
        "_generator": attr.label(
            default = "//common/manager:sbom_generator",
            executable = True,
            cfg = "exec",
        ),
    },
)

def _notice_impl(ctx):
    manifests = _transitive(ctx.attr.crates, "manifests")
    license_files = _transitive(ctx.attr.crates, "license_files")
    out = ctx.actions.declare_file(ctx.attr.out or (ctx.label.name + ".txt"))

    args = ctx.actions.args()
    args.add("--output", out)
    args.add_all(manifests, before_each = "--manifest")
    args.add_all(license_files, before_each = "--license-file")
    args.use_param_file("@%s", use_always = True)
    args.set_param_file_format("multiline")

    ctx.actions.run(
        outputs = [out],
        inputs = depset(transitive = [manifests, license_files]),
        executable = ctx.executable._generator,
        arguments = [args],
        mnemonic = "SeleniumManagerNotice",
        progress_message = "Generating third-party notices %{output}",
    )
    return [DefaultInfo(files = depset([out]))]

selenium_manager_notice = rule(
    implementation = _notice_impl,
    doc = "Generate a cargo-free third-party attribution NOTICE for Selenium Manager.",
    attrs = {
        "crates": attr.label_list(
            aspects = [crate_manifests_aspect],
            cfg = _platforms_split,
            doc = "Seed target(s) whose transitive crate graph supplies attributions.",
        ),
        "out": attr.string(doc = "Output filename; defaults to <name>.txt."),
        "_generator": attr.label(
            default = "//common/manager:notice_generator",
            executable = True,
            cfg = "exec",
        ),
    },
)
