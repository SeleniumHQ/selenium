load("@io_bazel_rules_dotnet//dotnet/private:context.bzl", "dotnet_context")

def _merged_assembly_impl(ctx):
    args = [
        "-v4",
        "-xmldocs",
        "-internalize",
    ]

    if ctx.attr.keyfile != None:
        key_path = ctx.expand_location(ctx.attr.keyfile.files.to_list()[0].path)
        args.append("-keyfile:{}".format(key_path))

    args.append("-out={}".format(ctx.outputs.out.path))
    args.append(ctx.attr.src_assembly.files.to_list()[0].path)
    for dep in ctx.files.deps:
        args.append(ctx.expand_location(dep.path))

    ctx.actions.run(
        executable = ctx.executable.merge_tool,
        arguments = args,
        inputs = ctx.attr.src_assembly.files,
        outputs = [ctx.outputs.out]
    )

merged_assembly = rule(
    implementation = _merged_assembly_impl,
    attrs = {
        "src_assembly": attr.label(),
        "deps": attr.label_list(),
        "out": attr.output(mandatory = True),
        "keyfile": attr.label(allow_single_file = True),
        "merge_tool": attr.label(
            executable = True,
            cfg = "host",
            default = Label("//third_party/dotnet/ilmerge:ilmerge.exe"),
            allow_single_file = True
        ),
    },
    toolchains = ["@io_bazel_rules_dotnet//dotnet:toolchain_net"],
)
