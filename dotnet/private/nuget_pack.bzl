load("@rules_dotnet//dotnet/private:common.bzl", "is_debug")
load("@rules_dotnet//dotnet/private:providers.bzl", "DotnetAssemblyRuntimeInfo")
load(":dotnet_utils.bzl", "dotnet_preamble")

_CSPROJ_TEMPLATE = """\
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <TargetFramework>netstandard2.0</TargetFramework>
        <AssemblyName>{id}</AssemblyName>
    </PropertyGroup>
</Project>
"""

def _guess_dotnet_version(assembly_info):
    if len(assembly_info.libs) == 0:
        fail("Cannot guess .Net version without an output dll: ", assembly_info.name)

    # The dirname will be something like
    # `bazel-out/darwin_arm64-fastbuild-ST-5c013bc87029/bin/dotnet/src/webdriver/bazelout/net5.0`
    # The last segment of the path is the target framework.
    return assembly_info.libs[0].dirname.split("/")[::-1][0]

def nuget_pack_impl(ctx):
    nuspec = ctx.actions.declare_file("%s-generated.nuspec" % ctx.label.name)
    ctx.actions.expand_template(
        template = ctx.file.nuspec_template,
        output = nuspec,
        substitutions = {
            "$packageid$": ctx.attr.id,
            "$version$": ctx.attr.version,
        },
    )

    build_flavor = "Debug" if is_debug(ctx) else "Release"

    # Collect files and their target paths within the package layout
    layout = {}
    for (lib, name) in ctx.attr.libs.items():
        assembly_info = lib[DotnetAssemblyRuntimeInfo]
        tfm = _guess_dotnet_version(assembly_info)
        for dll in assembly_info.libs:
            layout[dll] = "lib/%s/%s.dll" % (tfm, name)
        for pdb in assembly_info.pdbs:
            layout[pdb] = "lib/%s/%s.pdb" % (tfm, name)
        for doc in assembly_info.xml_docs:
            layout[doc] = "lib/%s/%s.xml" % (tfm, name)

    for (file, name) in ctx.attr.files.items():
        layout[file.files.to_list()[0]] = name

    csproj_file = ctx.actions.declare_file("%s-generated.csproj" % ctx.label.name)
    ctx.actions.write(csproj_file, _CSPROJ_TEMPLATE.format(id = ctx.attr.id))

    # Prepare transitive NuGet package cache
    transitive_libs = depset(transitive = [l[DotnetAssemblyRuntimeInfo].deps for l in ctx.attr.libs]).to_list()
    package_files = depset([lib.nuget_info.nupkg for lib in transitive_libs if lib.nuget_info]).to_list()

    packages = ctx.actions.declare_directory("%s-nuget-packages" % ctx.label.name)
    packages_cmd = "mkdir -p '%s'" % packages.path
    if package_files:
        packages_cmd += " && cp " + " ".join(["'%s'" % f.path for f in package_files]) + " '%s'" % packages.path

    ctx.actions.run_shell(
        outputs = [packages],
        inputs = package_files,
        command = packages_cmd,
        mnemonic = "LayoutNugetPackages",
    )

    # Create nupkg via dotnet pack
    toolchain = ctx.toolchains["@rules_dotnet//dotnet:toolchain_type"]
    nupkg_stem = "%s.%s" % (ctx.attr.id, ctx.attr.version)
    dotnet = toolchain.runtime.files_to_run.executable
    pkg = ctx.actions.declare_file("%s.nupkg" % nupkg_stem)
    symbols_pkg = ctx.actions.declare_file("%s.snupkg" % nupkg_stem)

    working_dir = ctx.label.name + "-working-dir"

    # Copy files directly into the working directory layout (no intermediate zip)
    copy_cmds = []
    for (file, rel_path) in layout.items():
        dest = working_dir + "/" + rel_path
        copy_cmds.append("mkdir -p \"$(dirname '{dest}')\" && cp '{src}' '{dest}'".format(
            dest = dest,
            src = file.path,
        ))

    cmd_parts = [
        "rm -rf '%s'" % working_dir,
        "mkdir -p '%s'" % working_dir,
    ] + copy_cmds + [
        "cp '{src}' '{dir}/project.nuspec'".format(src = nuspec.path, dir = working_dir),
        "cp '{src}' '{dir}/project.csproj'".format(src = csproj_file.path, dir = working_dir),
        "cd '%s'" % working_dir,
        "echo '<configuration><packageSources><clear /><add key=\"local\" value=\"%CWD%/{packages}\" /></packageSources></configuration>' >nuget.config".format(
            packages = packages.path,
        ),
        "$DOTNET restore --no-dependencies",
        " ".join([
            "$DOTNET pack --no-build --include-symbols",
            "-p:NuspecFile=project.nuspec",
            "-p:SymbolPackageFormat=snupkg",
            "-p:NoWarn=NU5048",  # suppress 'iconUrl is deprecated, use icon' warning since nuspec uses both
            "-p:Configuration=" + build_flavor,
            "-p:PackageId=" + ctx.attr.id,
            "-p:Version=" + ctx.attr.version,
            "-p:PackageVersion=" + ctx.attr.version,
            "-p:NuspecProperties=\"version=" + ctx.attr.version + "\"",
        ]),
        "cp 'bin/{flavor}/{stem}.nupkg' '../{pkg}'".format(
            flavor = build_flavor,
            stem = nupkg_stem,
            pkg = pkg.path,
        ),
        "cp 'bin/{flavor}/{stem}.snupkg' '../{symbols}'".format(
            flavor = build_flavor,
            stem = nupkg_stem,
            symbols = symbols_pkg.path,
        ),
    ]

    cmd = dotnet_preamble(toolchain) + " && ".join(cmd_parts)

    ctx.actions.run_shell(
        outputs = [pkg, symbols_pkg],
        inputs = list(layout.keys()) + [nuspec, csproj_file, dotnet, packages],
        tools = [dotnet] + toolchain.default.files.to_list() + toolchain.runtime.default_runfiles.files.to_list() + toolchain.runtime.data_runfiles.files.to_list(),
        command = cmd,
        mnemonic = "CreateNupkg",
    )

    return [
        DefaultInfo(
            files = depset([pkg, symbols_pkg]),
            runfiles = ctx.runfiles(files = [pkg, symbols_pkg]),
        ),
    ]

nuget_pack = rule(
    nuget_pack_impl,
    attrs = {
        "id": attr.string(
            doc = "Nuget ID of the package",
            mandatory = True,
        ),
        "version": attr.string(
            mandatory = True,
        ),
        "libs": attr.label_keyed_string_dict(
            doc = "The .Net libraries that are being published",
            providers = [DotnetAssemblyRuntimeInfo],
        ),
        "files": attr.label_keyed_string_dict(
            doc = "Mapping of files to paths within the nuget package",
            allow_empty = True,
            allow_files = True,
        ),
        "nuspec_template": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
    },
    toolchains = ["@rules_dotnet//dotnet:toolchain_type"],
)
