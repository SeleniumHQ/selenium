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

def _nuget_package_impl(ctx):
    args = [
        "pack",
    ]

    package_id = ctx.attr.package_id
    package_version = ctx.attr.package_version

    package_file = ctx.actions.declare_file("{}.{}.nupkg".format(package_id, package_version))
    output_path = ctx.expand_location(package_file.dirname)

    # The dependencies are assembly output compiled into directories
    # with the appropriate target framework moniker ("<base>/net45",
    # "<base>/net46", etc.). The base path for creating the NuGet
    # package should be the "<base>" directory, which we need to
    # hard-code with the parent operator, because Bazel doesn't
    # provide proper path traversal for custom rules. 
    base_path = ctx.files.deps[0].dirname + "/.."

    args.append(ctx.expand_location(ctx.attr.src.files.to_list()[0].path))
    args.append("-Properties")
    args.append("packageid={}".format(package_id))
    args.append("-Version")
    args.append(package_version)
    args.append("-BasePath")
    args.append(base_path)
    args.append("-OutputDirectory")
    args.append(output_path)

    ctx.actions.run(
        executable = ctx.executable.nuget_exe,
        arguments = args,
        inputs = ctx.attr.src.files + ctx.files.deps,
        outputs = [
            package_file,
        ]
    )

    return DefaultInfo(files = depset([
        package_file,
    ]))

nuget_package = rule(
    implementation = _nuget_package_impl,
    attrs = {
        "src": attr.label(
            allow_single_file = True
        ),
        "deps": attr.label_list(),
        "package_id": attr.string(),
        "package_version": attr.string(),
        "nuget_exe": attr.label(
            executable = True,
            cfg = "host",
            default = Label("//third_party/dotnet/nuget:nuget.exe"),
            allow_single_file = True
        ),
    }
)