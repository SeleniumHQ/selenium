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

MAVEN_PREFIX = "maven_coordinates="

def _has_maven_deps_impl(target, ctx):
    java_info = target[JavaInfo]

    tags = getattr(ctx.rule.attr, "tags", [])
    deps = getattr(ctx.rule.attr, "deps", [])
    exports = getattr(ctx.rule.attr, "exports", [])
    rt_deps = getattr(ctx.rule.attr, "runtime_deps", [])
    all_deps = deps + exports + rt_deps

    coordinates = []
    for tag in tags:
        if tag == "maven:compile_only":
            return MavenInfo(
                coordinates = None,
                maven_deps = depset(),
                artifact_jars = depset(),
                source_jars = depset(),
                transitive_maven_deps = depset(),
            )
        if tag.startswith(MAVEN_PREFIX):
            coordinates.append(tag[len(MAVEN_PREFIX):])
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

has_maven_deps = aspect(
    implementation = _has_maven_deps_impl,
    attr_aspects = [
        "deps",
        "exports",
        "runtime_deps",
    ],
)

def combine_jars(ctx, singlejar, inputs, output):
    args = ctx.actions.args()
    args.add_all(["--compression", "--normalize"])
    args.add("--output", output)
    args.add_all(inputs, before_each = "--sources")

    ctx.actions.run(
        mnemonic = "BuildMavenJar",
        inputs = inputs,
        outputs = [output],
        executable = singlejar,
        arguments = [args],
    )

def explode_coordinates(coords):
    """Takes a maven coordinate and explodes it into a tuple of
    (groupId, artifactId, version, type)
    """
    if not coords:
        return None

    parts = coords.split(":")
    if len(parts) == 3:
        return (parts[0], parts[1], parts[2], "jar")
    if len(parts) == 4:
        # Assume a buildr coordinate: groupId:artifactId:type:version
        return (parts[0], parts[1], parts[3], parts[2])

    fail("Unparsed: %s" % coords)
