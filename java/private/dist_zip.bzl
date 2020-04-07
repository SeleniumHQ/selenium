load("//java/private:common.bzl", "has_maven_deps")
load("//java/private:dist_info.bzl", "DistZipInfo", "dist_aspect", "separate_first_and_third_party")

def _java_dist_zip_impl(ctx):
    inputs = []
    files = []
    for file in ctx.files.files:
        files.append("%s=%s" % (file.basename, file.path))
        inputs.append(file)

    infos = depset([d[DistZipInfo] for d in ctx.attr.deps]).to_list()

    (first, third) = separate_first_and_third_party(ctx.attr.third_party_prefixes, [dep[DistZipInfo] for dep in ctx.attr.deps])

    first_party = []
    third_party = []

    for info in first:
        inputs.extend(info.binary_jars)
        inputs.extend(info.source_jars)
        [first_party.append("%s.jar=%s" % (info.name, fp.path)) for fp in info.binary_jars]
        [first_party.append("%s-sources.jar=%s" % (info.name, fp.path)) for fp in info.source_jars]

    for info in third:
        inputs.extend(info.binary_jars)
        inputs.extend(info.source_jars)
        [third_party.append("lib/%s.jar=%s" % (info.name, tp.path)) for tp in info.binary_jars]

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
                dist_aspect, has_maven_deps,
            ],
        ),
        "third_party_prefixes": attr.string_list(),
        "_zip": attr.label(
            default = "@bazel_tools//tools/zip:zipper",
            executable = True,
            cfg = "host",
        ),
    },
)
