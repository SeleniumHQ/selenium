def _merge_jars_impl(ctx):
    out = ctx.actions.declare_file("%s.jar" % ctx.label.name)

    args = ctx.actions.args()
    args.add("--output", out)
    args.add_all(ctx.files.inputs, before_each = "--sources")

    ctx.actions.run(
        mnemonic = "MergeJars",
        executable = ctx.executable._merge_jars,
        inputs = ctx.files.inputs,
        outputs = [out],
        arguments = [args],
    )

    return [
        DefaultInfo(files = depset([out])),
    ]

merge_jars = rule(
    _merge_jars_impl,
    attrs = {
        "inputs": attr.label_list(
            mandatory = True,
            allow_files = True,
        ),
        "_merge_jars": attr.label(
            executable = True,
            cfg = "exec",
            default = "@rules_jvm_external//private/tools/java/com/github/bazelbuild/rules_jvm_external/jar:MergeJars",
        ),
        "_java_toolchain": attr.label(
            default = "@bazel_tools//tools/jdk:current_java_toolchain",
        ),
    },
)
