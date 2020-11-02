load("@bazel_skylib//rules:common_settings.bzl", "BuildSettingInfo")

def _nuget_push_impl(ctx):
    args = [
        "push",
    ]

    apikey = ctx.attr.api_key[BuildSettingInfo].value
    package_to_publish = ctx.attr.src.files.to_list()[0].path

    output_file = ctx.actions.declare_file("done.txt")

    args.append(ctx.expand_location(ctx.attr.src.files.to_list()[0].path))
    args.append("-Source")
    args.append(ctx.attr.package_repository_url)
    args.append("-SkipDuplicate")
    args.append("-ApiKey")
    args.append(apikey)
    args.append("> {}".format(output_file.path))

    ctx.actions.run(
        executable = ctx.executable.nuget_exe,
        progress_message = "Publishing {}".format(package_to_publish),
        arguments = args,
        inputs = ctx.attr.src.files.to_list() + ctx.files.deps,
        outputs = [output_file],
    )

    return DefaultInfo(files = depset([
        output_file,
    ]))


nuget_push = rule(
    implementation = _nuget_push_impl,
    attrs = {
        "src": attr.label(
            allow_single_file = True,
        ),
        "deps": attr.label_list(),
        "package_repository_url": attr.string(
            default = "https://nuget.org",
        ),
        "api_key": attr.label(default = ":nuget-api-key"),
        "nuget_exe": attr.label(
            executable = True,
            cfg = "host",
            default = Label("//third_party/dotnet/nuget:nuget.exe"),
            allow_single_file = True,
        ),
    },
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
        progress_message = "Packaging {}".format(package_file.path),
        arguments = args,
        inputs = ctx.attr.src.files.to_list() + ctx.files.deps,
        outputs = [
            package_file,
        ],
    )

    return DefaultInfo(files = depset([
        package_file,
    ]))

nuget_package = rule(
    implementation = _nuget_package_impl,
    attrs = {
        "src": attr.label(
            allow_single_file = True,
        ),
        "deps": attr.label_list(),
        "package_id": attr.string(),
        "package_version": attr.string(),
        "nuget_exe": attr.label(
            executable = True,
            cfg = "host",
            default = Label("//third_party/dotnet/nuget:nuget.exe"),
            allow_single_file = True,
        ),
    },
)
