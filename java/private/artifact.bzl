load("//java/private:common.bzl", "MavenInfo", "combine_jars", "has_maven_deps")

def _maven_artifacts_impl(ctx):
    target = ctx.attr.target

    info = target[MavenInfo]
    if not info.coordinates:
        fail("No coordinates specified for %s" % target)

    bin_jar = ctx.outputs.binjar
    combine_jars(ctx, ctx.executable._singlejar, info.artifact_jars.to_list(), bin_jar)
    src_jar = ctx.outputs.srcjar
    combine_jars(ctx, ctx.executable._singlejar, info.source_jars.to_list(), src_jar)

    return [
        DefaultInfo(files = depset([bin_jar])),
        OutputGroupInfo(
            binjar = depset([bin_jar]),
            srcjar = depset([src_jar]),
            pom = depset([ctx.file.pom]),
        ),
    ]

_maven_artifacts = rule(
    _maven_artifacts_impl,
    attrs = {
        "target": attr.label(
            mandatory = True,
            aspects = [has_maven_deps],
            providers = [JavaInfo, MavenInfo],
        ),
        "pom": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
        "_singlejar": attr.label(
            executable = True,
            cfg = "host",
            default = "//java/client/src/org/openqa/selenium/tools/jar:MergeJars",
            allow_files = True,
        ),
        "binjar": attr.output(),
        "srcjar": attr.output(),
    },
)

def maven_artifacts(name, target, pom, **kwargs):
    _maven_artifacts(
        name = name,
        target = target,
        pom = pom,
        binjar = "%s.jar" % name,
        srcjar = "%s-source.jar" % name,
        **kwargs
    )
