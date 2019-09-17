load("//java/private:common.bzl", "MAVEN_PREFIX", "MavenInfo", "explode_coordinates", "has_maven_deps")
load("//java/private:module.bzl", "GatheredJavaModuleInfo", "has_java_module_deps")

DistZipInfo = provider(
    fields = {
        "dist_infos": "Transitive collection of structs containing base_name, binary_jar, and source_jar",
    },
)

def _dist_aspect_impl(target, ctx):
    deps = getattr(ctx.rule.attr, "deps", [])
    exports = getattr(ctx.rule.attr, "exports", [])
    rt_deps = getattr(ctx.rule.attr, "runtime_deps", [])
    tgt = getattr(ctx.rule.attr, "target", None)

    all_deps = deps + exports + rt_deps
    if tgt:
        all_deps.append(tgt)

    name = None
    tags = getattr(ctx.rule.attr, "tags", [])
    for tag in tags:
        if tag.startswith(MAVEN_PREFIX):
            raw = tag[len(MAVEN_PREFIX):]
            coords = explode_coordinates(raw)
            if "jar" == coords[3]:
                name = "%s-%s" % (coords[1], coords[2])

    transitive_infos = [d[DistZipInfo].dist_infos for d in all_deps if DistZipInfo in d]

    if not name:
        # Return accumulated dist infos
        return [
            DistZipInfo(
                dist_infos = depset([], transitive = transitive_infos),
            ),
        ]

    source_jars = depset()
    binary_jars = depset()

    if "maven_artifacts" == ctx.rule.kind:
        binary_jars = target[OutputGroupInfo].binjar
        source_jars = target[OutputGroupInfo].srcjar
    elif JavaInfo in target:
        binary_jars = depset(target[JavaInfo].runtime_output_jars)
    elif GatheredJavaModuleInfo in target:
        binary_jars = depset(target[GatheredJavaModuleInfo].binary_jars)
        source_jars = depset(target[GatheredJavaModuleInfo].source_jars)

    binary_jar = None
    if len(binary_jars.to_list()) > 1:
        fail("Unable to process more than one binary jar")
    elif len(binary_jars.to_list()) == 1:
        binary_jar = binary_jars.to_list()[0]
    source_jar = None
    if len(source_jars.to_list()) > 1:
        fail("Unable to process more than one source jar")
    elif len(source_jars.to_list()) == 1:
        source_jar = source_jars.to_list()[0]

    current = struct(
        target = str(target.label),
        base_name = name,
        binary_jar = binary_jar,
        source_jar = source_jar,
    )

    return [
        DistZipInfo(
            dist_infos = depset([current], transitive = transitive_infos),
        ),
    ]

_dist_aspect = aspect(
    _dist_aspect_impl,
    attr_aspects = [
        "deps",
        "exports",
        "runtime_deps",
        "target",
    ],
    provides = [
        DistZipInfo,
    ],
    required_aspect_providers = [
        [DistZipInfo],
        [GatheredJavaModuleInfo],
        [JavaInfo],
        [MavenInfo],
    ],
)

def is_third_party(prefixes, target):
    for prefix in prefixes:
        if target.startswith(prefix):
            return True
    return False

def _java_dist_zip_impl(ctx):
    out = ctx.actions.declare_file("%s-dist.zip" % ctx.attr.name)

    args = ctx.actions.args()
    args.add_all(["c", out.path])

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
          if not dist_info.binary_jar:
              continue

          inputs.append(dist_info.binary_jar)
          if is_third_party(ctx.attr.third_party_prefixes, dist_info.target):
              third_party.append("lib/%s.jar=%s" % (dist_info.base_name, dist_info.binary_jar.path))
          else:
              first_party.append("%s.jar=%s" % (dist_info.base_name, dist_info.binary_jar.path))

          if dist_info.source_jar:
              inputs.append(dist_info.source_jar)
              if is_third_party(ctx.attr.third_party_prefixes, dist_info.target):
                  third_party.append("lib/%s-sources.jar=%s" % (dist_info.base_name, dist_info.source_jar.path))
              else:
                  first_party.append("%s-sources.jar=%s" % (dist_info.base_name, dist_info.source_jar.path))

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
            allow_empty = False,
            providers = [
                [DistZipInfo],
            ],
            aspects = [
                _dist_aspect,
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
