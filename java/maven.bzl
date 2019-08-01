
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

    # Because of the way that maven works, if a rule has maven coordinates,
    # it's enough to set set the transitive deps to just be the rule for
    # anything that depends upon it. Otherwise, gather them up, and carry on
    # as if nothing really mattered.

    if len(coordinates) > 0:
      transitive_maven_deps = depset(coordinates)
    else:
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

_PLAIN_DEP = """    <dependency>
      <groupId>{0}</groupId>
      <artifactId>{1}</artifactId>
      <version>{2}</version>
    </dependency>"""

_TYPED_DEP = """    <dependency>
      <groupId>{0}</groupId>
      <artifactId>{1}</artifactId>
      <version>{2}</version>
      <type>{3}</type>
    </dependency>"""


def explode_coordinates(coords):
    """Takes a maven coordinate and explodes it into a tuple of
    (groupId, artifactId, version, type)
    """
    parts = coords.split(":")
    if len(parts) == 3:
        return (parts[0], parts[1], parts[2], "jar")
    if len(parts) == 4:
        # Assume a buildr coordinate: groupId:artifactId:type:version
        return (parts[0], parts[1], parts[3], parts[2])

    fail("Unparsed: %s" % coords)


def _pom_file_impl(ctx):
    # Ensure the target has coordinates
    if not ctx.attr.target[MavenInfo].coordinates:
        fail("pom_file target must have maven coordinates.")

    info = ctx.attr.target[MavenInfo]

    # Separate out the various parts of the

    coordinates = explode_coordinates(info.coordinates)
    substitutions = {
        "{groupId}": coordinates[0],
        "{artifactId}": coordinates[1],
        "{version}": coordinates[2],
        "{type}": coordinates[3],
    }

    deps = []
    for dep in sorted(info.maven_deps.to_list()):
        exploded = explode_coordinates(dep)
        if (exploded[3] == "jar"):
            template = _PLAIN_DEP
        else:
            template = _TYPED_DEP
        deps.append(template.format(*exploded))
    substitutions.update({"{dependencies}": "\n".join(deps)})

    out = ctx.actions.declare_file("%s.xml" % ctx.attr.name)
    ctx.actions.expand_template(
        template = ctx.file.template,
        output = out,
        substitutions = substitutions,
    )

    return [
        DefaultInfo(files = depset([out]))
    ]

pom_file = rule(
    _pom_file_impl,
    attrs = {
        "target": attr.label(
            aspects = [_has_maven_deps],
            providers = [JavaInfo, MavenInfo]),
        "template": attr.label(
            allow_single_file = True,
        ),
        "_zip": attr.label(
            executable = True,
            cfg = "host",
            default = "@bazel_tools//tools/zip:zipper",
            allow_files = True ),
    },
)

def java_export(
        name,
        maven_coordinates=None,
        pom_template=None,
        tags=[],
        srcs=None,
        deps=None,
        exports=None,
        resources=None,
        runtime_deps=None,
        neverlink=False,
        visibility=None):

    actual_tags = tags
    if maven_coordinates:
        actual_tags = tags + ["%s%s" % (_PREFIX, maven_coordinates)]
        if not pom_template:
            fail("java_export requires pom_template to be set if coordinates given: %s" % maven_coordinates)

    native.java_library(
        name = name,
        srcs = srcs,
        resources = resources,
        deps = deps,
        exports = exports,
        runtime_deps = runtime_deps,
        tags = actual_tags,
        visibility = visibility)

    pom_file(
        name = "%s-pom" % name,
        target = ":%s" % name,
        template = pom_template,
        visibility = visibility,
    )

    maven_jars(
        name = "%s-maven" % name,
        targets = [":%s" % name],
        visibility = visibility,
    )
