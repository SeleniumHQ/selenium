load(
    "@io_bazel_rules_dotnet//dotnet/private:context.bzl",
    "dotnet_context"
)
load(
    "@io_bazel_rules_dotnet//dotnet/private:providers.bzl",
    "DotnetLibrary",
)

def _merged_assembly_impl(ctx):
    dotnet = dotnet_context(ctx)
    name = ctx.label.name

    deps = ctx.attr.deps
    result = ctx.outputs.out

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

    data = depset()

    runfiles = depset(direct = [result], transitive = [d[DotnetLibrary].runfiles for d in deps] + [data])
    transitive = depset(direct = deps, transitive = [a[DotnetLibrary].transitive for a in deps])

    merged_lib = dotnet.new_library(
        dotnet = dotnet,
        name = name,
        deps = deps,
        transitive = transitive,
        runfiles = runfiles,
        result = result,
    )

    return [
        merged_lib,
        DefaultInfo(
            files = depset([merged_lib.result]),
            runfiles = ctx.runfiles(files = [], transitive_files = merged_lib.runfiles),
        ),
    ]

merged_assembly = rule(
    implementation = _merged_assembly_impl,
    attrs = {
        "src_assembly": attr.label(),
        "deps": attr.label_list(),
        "out": attr.output(mandatory = True),
        "keyfile": attr.label(allow_single_file = True),
        "dotnet_context_data": attr.label(default = Label("@io_bazel_rules_dotnet//:dotnet_context_data")),
        "merge_tool": attr.label(
            executable = True,
            cfg = "host",
            default = Label("//third_party/dotnet/ilmerge:ilmerge.exe"),
            allow_single_file = True
        ),
    },
    toolchains = ["@io_bazel_rules_dotnet//dotnet:toolchain_net"],
)
