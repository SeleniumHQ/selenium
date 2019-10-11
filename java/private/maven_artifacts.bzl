load("//java/private:common.bzl", "MavenInfo", "combine_jars", "has_maven_deps")
load("//java/private:module.bzl", "GatheredJavaModuleInfo", "JavaModuleInfo", "has_java_module_deps")

def _maven_artifacts_impl(ctx):
    target = ctx.attr.target
    info = target[MavenInfo]

    # Merge together all the binary jars
    temp_bin_jar = ctx.actions.declare_file("%s-temp.jar" % ctx.attr.name)
    combine_jars(ctx, ctx.executable._singlejar, info.artifact_jars.to_list(), temp_bin_jar)
    src_jar = ctx.outputs.srcjar
    combine_jars(ctx, ctx.executable._singlejar, info.source_jars.to_list(), src_jar)

    # Now generate the module info
    module_jar = ctx.actions.declare_file("%s-module.jar" % ctx.attr.name)

    args = ctx.actions.args()
    args.add_all(["--coordinates", ctx.attr.maven_coordinates])
    args.add_all(["--in", temp_bin_jar.path])
    args.add_all(["--out", module_jar.path])

    paths = [file.path for file in target[GatheredJavaModuleInfo].module_jars.to_list()]
    if len(paths) > 0:
        args.add_all(["--module-path", ctx.host_configuration.host_path_separator.join(paths)])
    if len(ctx.attr.module_exclude_patterns) > 0:
        args.add_all(ctx.attr.module_exclude_patterns, before_each = "--exclude")

    ctx.actions.run(
        mnemonic = "BuildModuleJar",
        inputs = [temp_bin_jar] + target[GatheredJavaModuleInfo].module_jars.to_list(),
        outputs = [module_jar],
        executable = ctx.executable._generate_module,
        arguments = [args],
    )

    # Now merge the module info and the binary jars
    combine_jars(ctx, ctx.executable._singlejar, [temp_bin_jar, module_jar], ctx.outputs.binjar)

    defaultInfo = target[DefaultInfo]

    return [
        target[JavaInfo],
        JavaModuleInfo(
            binary_jars = depset([ctx.outputs.binjar]),
            module_jars = depset([ctx.outputs.binjar], transitive = [target[GatheredJavaModuleInfo].module_jars]),
        ),
        OutputGroupInfo(
            binjar = depset([ctx.outputs.binjar]),
            srcjar = depset([ctx.outputs.srcjar]),
        ),
        DefaultInfo(
            files = depset(defaultInfo.files.to_list() + [ctx.outputs.binjar, ctx.outputs.srcjar]),
            data_runfiles = defaultInfo.data_runfiles,
            default_runfiles = defaultInfo.default_runfiles,
        ),
    ]

maven_artifacts = rule(
    _maven_artifacts_impl,
    attrs = {
        "maven_coordinates": attr.string(
            mandatory = True,
        ),
        "target": attr.label(
            mandatory = True,
            aspects = [has_java_module_deps, has_maven_deps],
            providers = [GatheredJavaModuleInfo, JavaInfo],
        ),
        "module_exclude_patterns": attr.string_list(
            default = [],
        ),
        "binjar": attr.output(
            mandatory = True,
        ),
        "srcjar": attr.output(
            mandatory = True,
        ),
        "_generate_module": attr.label(
            executable = True,
            cfg = "host",
            default = "//java/client/src/org/openqa/selenium/tools/modules:ModuleGenerator",
            allow_files = True,
        ),
        "_singlejar": attr.label(
            executable = True,
            cfg = "host",
            default = "//java/client/src/org/openqa/selenium/tools/jar:MergeJars",
            allow_files = True,
        ),
    },
)
