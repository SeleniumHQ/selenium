load("//java/private:common.bzl", "MavenInfo", "has_maven_deps", "read_coordinates", "explode_coordinates")
load("//java/private:module.bzl", "JavaModuleInfo")

DistZipInfo = provider(
    fields = {
        "dist_infos": "Transitive collection of structs containing base_name, binary_jar, and source_jar",
    },
)

_ATTR_ASPECTS = [
    "deps",
    "exports",
    "runtime_deps",
]

def _name(coordinates, default):
    if not coordinates:
        return default
    exploded = explode_coordinates(coordinates)
    return exploded[1] + "-" + exploded[2]

def _dist_aspect_impl(target, ctx):
    deps = getattr(ctx.rule.attr, "deps", [])
    exports = getattr(ctx.rule.attr, "exports", [])
    rt_deps = getattr(ctx.rule.attr, "runtime_deps", [])

    all_deps = deps + exports + rt_deps
    transitive_infos = [d[DistZipInfo].dist_infos for d in all_deps]

    name = None
    binary_jars = []
    source_jars = []

    if MavenInfo in target and target[MavenInfo].coordinates:
        name = _name(target[MavenInfo].coordinates, None)
        binary_jars = target[MavenInfo].artifact_jars
        source_jars = target[MavenInfo].source_jars
    elif JavaModuleInfo in target and target[JavaModuleInfo].name:
        coordinates = read_coordinates(ctx.rule.attr.tags)
        name = _name(coordinates, target[JavaModuleInfo].name)
        binary_jars = target[JavaInfo].runtime_output_jars
        source_jars = target[JavaInfo].source_jars
    elif JavaInfo in target:
        coordinates = read_coordinates(ctx.rule.attr.tags)
        if coordinates:
            name = _name(coordinates, None)
            binary_jars = target[JavaInfo].runtime_output_jars
            source_jars = target[JavaInfo].source_jars

    if len(binary_jars) > 1:
        fail("Unsure how to handle expanding binary jars for " + target)
    if len(source_jars) > 1:
        fail("Unsure how to handle expanding source jars for " + target)

    current = struct(
        target = str(target.label),
        name = name,
        binary_jar = binary_jars[0] if len(binary_jars) else None,
        source_jar = source_jars[0] if len(source_jars) else None,
    )

    return [
        DistZipInfo(
            dist_infos = depset([current], transitive = transitive_infos),
        ),
    ]

_dist_aspect = aspect(
    _dist_aspect_impl,
    attr_aspects = _ATTR_ASPECTS,
    provides = [
        DistZipInfo,
    ],
    required_aspect_providers = [
        [JavaInfo],
        [JavaInfo, JavaModuleInfo],
        [MavenInfo],
    ],
)

def is_third_party(prefixes, target):
    for prefix in prefixes:
        if target.startswith(prefix):
            return True
    return False

def _java_dist_zip_impl(ctx):
#    out = ctx.actions.declare_file("%s-dist.zip" % ctx.attr.name)

#    args = ctx.actions.args()
#    args.add_all(["c", out.path])

    inputs = []
    files = []
    for file in ctx.files.files:
        files.append("%s=%s" % (file.basename, file.path))
        inputs.append(file)

    infos = depset([d[DistZipInfo] for d in ctx.attr.deps]).to_list()

    first_party = []
    third_party = []

    for info in infos:
        for dist_info in info.dist_infos.to_list():
            if not dist_info.name:
                continue

            inputs.append(dist_info.binary_jar)
            if is_third_party(ctx.attr.third_party_prefixes, dist_info.target):
                third_party.append("lib/%s.jar=%s" % (dist_info.name, dist_info.binary_jar.path))
            else:
                first_party.append("%s.jar=%s" % (dist_info.name, dist_info.binary_jar.path))

            if dist_info.source_jar and not is_third_party(ctx.attr.third_party_prefixes, dist_info.target):
                inputs.append(dist_info.source_jar)
                first_party.append("%s-sources.jar=%s" % (dist_info.name, dist_info.source_jar.path))

    out = ctx.actions.declare_file("%s.zip" % ctx.attr.name)
    args = ctx.actions.args()
    args.add_all(["c", out])
    args.add_all(sorted(files))
    args.add_all(sorted(first_party))
    args.add_all(sorted(third_party))

    ctx.actions.run(
        executable = ctx.executable._zip,
        arguments = [args],
        outputs = [out],
        inputs = inputs,
    )

    return [
        DefaultInfo(files = depset([out])),
    ]

java_dist_zip = rule(
    _java_dist_zip_impl,
    attrs = {
        "files": attr.label_list(
            default = [],
            allow_files = True,
        ),
        "deps": attr.label_list(
            providers = [
                [DistZipInfo],
            ],
            aspects = [
                _dist_aspect, has_maven_deps,
            ],
        ),
        "third_party_prefixes": attr.string_list(
            default = [],
            allow_empty = True,
        ),
        "_zip": attr.label(
            default = "@bazel_tools//tools/zip:zipper",
            executable = True,
            cfg = "host",
        ),
    },
)
