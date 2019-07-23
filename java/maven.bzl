
MavenInfo = provider(
    fields = {
        "coordinates": "Maven coordinates of the library we're building (optional)",
        "artifact_jars": "Jars to include within the artifact when we build it",
        "source_jars": "Source jars to include within the maven source jar",
        "maven_deps": "Maven coordinates that this module depends on",
        "transitive_maven_deps": "All maven coordinates that are transitive dependencies",
        "transitive_runtime_jars": "Transitive set of jars that this library depends on (including artifact_jars)",
        "transitive_source_jars": "Transitive set of source jars that this library depends on",
    },
)

_PREFIX = "maven_coordinates="

def _has_maven_deps_impl(target, ctx):
    java_info = target[JavaInfo]

    tags = getattr(ctx.rule.attr, "tags", [])
    deps = getattr(ctx.rule.attr, "deps", [])
    exports = getattr(ctx.rule.attr, "exports", [])
    rt_deps = getattr(ctx.rule.attr, "runtime_deps", [])
    all_deps = deps + exports + rt_deps

    coordinates = []
    for tag in tags:
        if tag.startswith(_PREFIX):
            coordinates.append(tag[len(_PREFIX):])
    if len(coordinates) > 1:
        fail("Zero or one set of coordinates should be defined: %s" % coordinates)

    # Find all the deps that have coordinates
    all_infos = [dep[MavenInfo] for dep in all_deps if MavenInfo in dep]

    maven_deps = depset([], transitive = [info.transitive_maven_deps for info in all_infos])
    transitive_maven_deps = depset(coordinates, transitive = [info.transitive_maven_deps for info in all_infos])
    artifact_jars = depset(java_info.runtime_output_jars, transitive = [info.artifact_jars for info in all_infos if not info.coordinates])
    source_jars = depset(java_info.source_jars, transitive = [info.source_jars for info in all_infos if not info.coordinates])

    infos = []
    coordinate = coordinates[0] if len(coordinates) > 0 else None
    info = MavenInfo(
        coordinates = coordinate,
        maven_deps = maven_deps,
        artifact_jars = artifact_jars,
        source_jars = source_jars,
        transitive_maven_deps = transitive_maven_deps,
    )
    infos.append(info)

    return infos

_has_maven_deps = aspect(
    implementation = _has_maven_deps_impl,
    attr_aspects = [
        "deps",
        "exports",
        "runtime_deps",
    ],
)

def _combine_jars(ctx, inputs, output):
    args = ctx.actions.args()
    args.add_all(["--compression", "--normalize"])
    args.add("--output", output)
    args.add_all(inputs, before_each = "--sources")

    ctx.actions.run(
            mnemonic = "BuildMavenJar",
            inputs = inputs,
            outputs = [output],
            executable = ctx.executable._singlejar,
            arguments = [args],
    )

def _determine_name(coordinates):
    bits = coordinates.split(":")
    return bits[1]

def _maven_jars_impl(ctx):
    targets = ctx.attr.targets

    outs = []

    for target in targets:
        info = target[MavenInfo]
        if not info.coordinates:
            fail("No coordinates specified for %s" % target)

        name = _determine_name(info.coordinates)

        bin_jar = ctx.actions.declare_file("%s.jar" % name)
        outs.append(bin_jar)
        _combine_jars(ctx, info.artifact_jars.to_list(), bin_jar)
        src_jar = ctx.actions.declare_file("%s-sources.jar" % name)
        outs.append(src_jar)
        _combine_jars(ctx, info.source_jars.to_list(), src_jar)

        args = ctx.actions.args()
        args.add_all(["--compression", "--normalize"])
        args.add_all(info.artifact_jars.to_list(), before_each = "--sources")
        args.add("--output", bin_jar)

    return [
        DefaultInfo(files = depset(outs))
    ]

maven_jars = rule(
    _maven_jars_impl,
    attrs = {
      "targets": attr.label_list(
          allow_empty = False,
          aspects = [_has_maven_deps],
          providers = [JavaInfo, MavenInfo]),
       "_singlejar": attr.label(
          executable = True,
          cfg = "host",
          default = "@bazel_tools//tools/jdk:singlejar",
          allow_files = True),
    },
)
