load("@bazel_skylib//rules:common_settings.bzl", "BuildSettingInfo")
load("//dotnet/private:copy_files.bzl", "copy_files")
load(
    "//dotnet:selenium-dotnet-version.bzl",
    "SUPPORTED_NET_FRAMEWORKS",
    "SUPPORTED_NET_STANDARD_VERSIONS",
)

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
            cfg = "exec",
            default = Label("//third_party/dotnet/nuget:nuget.exe"),
            allow_single_file = True,
        ),
    },
)

def _get_relative_destination_file(src_file):
    src_file_dirs = src_file.dirname.split("/")
    framework_dir = src_file_dirs[-1]
    for src_file_dir in reversed(src_file_dirs):
        if src_file_dir in SUPPORTED_NET_FRAMEWORKS or src_file_dir in SUPPORTED_NET_STANDARD_VERSIONS:
            framework_dir = src_file_dir
            break
    return "{}/{}".format(framework_dir, src_file.basename)

def _stage_files_for_packaging(ctx, staging_dir):
    src_list = []
    for dep in ctx.attr.deps:
        src_file = dep.files.to_list()[0]
        relative_dest_file = _get_relative_destination_file(src_file)
        src_list.append((src_file, relative_dest_file))
        if (ctx.attr.create_symbol_package):
            if (len(dep[DefaultInfo].default_runfiles.files.to_list()) > 0):
                symbol_file = dep[DefaultInfo].default_runfiles.files.to_list()[0]
                relative_dest_symbol_file = _get_relative_destination_file(symbol_file)
                src_list.append((symbol_file, relative_dest_symbol_file))

    return copy_files(ctx, src_list, staging_dir, ctx.attr.is_windows)

def _nuget_package_impl(ctx):
    args = [
        "pack",
    ]

    package_id = ctx.attr.package_id
    package_version = ctx.attr.package_version

    package_file = ctx.actions.declare_file("{}.{}.nupkg".format(package_id, package_version))
    output_path = ctx.expand_location(package_file.dirname)
    output_files = [package_file]

    if (ctx.attr.create_symbol_package):
        symbol_file = ctx.actions.declare_file("{}.{}.snupkg".format(package_id, package_version))
        output_files.append(symbol_file)

    # The dependencies are assembly output compiled into directories
    # with the appropriate target framework moniker ("<base>/net45",
    # "<base>/net46", etc.). The base path for creating the NuGet
    # package should be the "<base>" directory, which we need to
    # hard-code with the parent operator, because Bazel doesn't
    # provide proper path traversal for custom rules.
    base_path = ctx.files.deps[0].dirname + "/.."

    packaging_file_list = _stage_files_for_packaging(ctx, ctx.label.name)
    base_path = packaging_file_list[0].dirname + "/.."

    args.append(ctx.expand_location(ctx.attr.src.files.to_list()[0].path))
    args.append("-Properties")
    args.append("packageid={}".format(package_id))
    args.append("-Version")
    args.append(package_version)
    args.append("-BasePath")
    args.append(base_path)
    if (ctx.attr.create_symbol_package):
        args.append("-Symbols")
        args.append("-SymbolPackageFormat")
        args.append("snupkg")
    args.append("-OutputDirectory")
    args.append(output_path)

    ctx.actions.run(
        executable = ctx.executable.nuget_exe,
        progress_message = "Packaging {}".format(package_file.path),
        arguments = args,
        inputs = ctx.attr.src.files.to_list() + ctx.files.deps,
        outputs = output_files,
    )

    return DefaultInfo(files = depset(output_files), runfiles = ctx.runfiles(files = packaging_file_list))

nuget_package = rule(
    implementation = _nuget_package_impl,
    attrs = {
        "src": attr.label(
            allow_single_file = True,
        ),
        "deps": attr.label_list(),
        "package_id": attr.string(),
        "package_version": attr.string(),
        "create_symbol_package": attr.bool(default = False),
        "is_windows": attr.bool(default = False),
        "nuget_exe": attr.label(
            executable = True,
            cfg = "exec",
            default = Label("//third_party/dotnet/nuget:nuget.exe"),
            allow_single_file = True,
        ),
    },
)
