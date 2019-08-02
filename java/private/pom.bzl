load("//java/private:common.bzl", "MavenInfo", "has_maven_deps")

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

    out = ctx.outputs.out
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
            aspects = [has_maven_deps],
            providers = [JavaInfo, MavenInfo]),
        "template": attr.label(
            allow_single_file = True,
        ),
        "out": attr.output(),
        "_zip": attr.label(
            executable = True,
            cfg = "host",
            default = "@bazel_tools//tools/zip:zipper",
            allow_files = True ),
    },
)
