load("@rules_dotnet//dotnet/private:common.bzl", "is_debug")
load("@rules_dotnet//dotnet/private:providers.bzl", "DotnetAssemblyRuntimeInfo")
load(":dotnet_utils.bzl", "dotnet_preamble")

def _guess_dotnet_version(label, assembly_info):
    if len(assembly_info.libs) == 0:
        fail("Cannot guess .Net version without an output dll: ", assembly_info.name)

    # We're going to rely on the structure of the output names for now
    # rather than scanning through the dependencies. If this works,
    # life will be good.

    # The dirname will be something like `bazel-out/darwin_arm64-fastbuild-ST-5c013bc87029/bin/dotnet/src/webdriver/bazelout/net5.0`
    # Note that the last segment of the path is the framework we're
    # targeting. Happy days!
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

    # A mapping of files to the paths in which we expect to find them in the package
    paths = {}

    for (lib, name) in ctx.attr.libs.items():
        assembly_info = lib[DotnetAssemblyRuntimeInfo]

        for dll in assembly_info.libs:
            paths[dll] = "lib/%s/%s.dll" % (_guess_dotnet_version(lib.label, assembly_info), name)
        for pdb in assembly_info.pdbs:
            paths[pdb] = "lib/%s/%s.pdb" % (_guess_dotnet_version(lib.label, assembly_info), name)
        for doc in assembly_info.xml_docs:
            paths[doc] = "lib/%s/%s.xml" % (_guess_dotnet_version(lib.label, assembly_info), name)

    csproj_template = """<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <TargetFramework>netstandard2.0</TargetFramework>
        <AssemblyName>%s</AssemblyName>
        <RootNamespace>OpenQA.Selenium</RootNamespace>
    </PropertyGroup>
</Project>
""" % ctx.attr.id

    csproj_file = ctx.actions.declare_file("%s-generated.csproj" % ctx.label.name)
    ctx.actions.write(csproj_file, csproj_template)
    paths[csproj_file] = "project.csproj"

    for (file, name) in ctx.attr.files.items():
        paths[file.files.to_list()[0]] = name

    # Zip everything up so we have the right file structure
    zip_file = ctx.actions.declare_file("%s-intermediate.zip" % ctx.label.name)
    args = ctx.actions.args()
    args.add_all(["Cc", zip_file])
    for (file, path) in paths.items():
        args.add("%s=%s" % (path, file.path))
    args.add("project.nuspec=%s" % (nuspec.path))

    ctx.actions.run(
        executable = ctx.executable._zip,
        arguments = [args],
        inputs = paths.keys() + [nuspec],
        outputs = [zip_file],
    )

    # Now lay everything out on disk and execute the dotnet pack rule

    # Now we have everything, let's build our package
    toolchain = ctx.toolchains["@rules_dotnet//dotnet:toolchain_type"]

    nupkg_name_stem = "%s.%s" % (ctx.attr.id, ctx.attr.version)

    dotnet = toolchain.runtime.files_to_run.executable
    pkg = ctx.actions.declare_file("%s.nupkg" % nupkg_name_stem)
    symbols_pkg = ctx.actions.declare_file("%s.snupkg" % nupkg_name_stem)

    # Prepare our cache of nupkg files
    packages = ctx.actions.declare_directory("%s-nuget-packages" % ctx.label.name)
    packages_cmd = "mkdir -p %s " % packages.path

    transitive_libs = depset(transitive = [l[DotnetAssemblyRuntimeInfo].deps for l in ctx.attr.libs]).to_list()
    package_files = depset([lib.nuget_info.nupkg for lib in transitive_libs if lib.nuget_info]).to_list()

    if len(package_files):
        packages_cmd += "&& cp " + " ".join([f.path for f in package_files]) + " " + packages.path

    ctx.actions.run_shell(
        outputs = [packages],
        inputs = package_files,
        command = packages_cmd,
        mnemonic = "LayoutNugetPackages",
    )

    cmd = dotnet_preamble(toolchain) + \
          "mkdir %s-working-dir && " % ctx.label.name + \
          "echo $(pwd) && " + \
          "$(location @bazel_tools//tools/zip:zipper) x %s -d %s-working-dir && " % (zip_file.path, ctx.label.name) + \
          "cd %s-working-dir && " % ctx.label.name + \
          "echo '<configuration><packageSources><clear /><add key=\"local\" value=\"%%CWD%%/%s\" /></packageSources></configuration>' >nuget.config && " % packages.path + \
          "$DOTNET restore --no-dependencies && " + \
          "$DOTNET pack --no-build --include-symbols -p:NuspecFile=project.nuspec --include-symbols -p:SymbolPackageFormat=snupkg -p:Configuration=%s -p:PackageId=%s -p:Version=%s -p:PackageVersion=%s -p:NuspecProperties=\"version=%s\" && " % (build_flavor, ctx.attr.id, ctx.attr.version, ctx.attr.version, ctx.attr.version) + \
          "cp bin/%s/%s.%s.nupkg ../%s && " % (build_flavor, ctx.attr.id, ctx.attr.version, pkg.path) + \
          "cp bin/%s/%s.%s.snupkg ../%s" % (build_flavor, ctx.attr.id, ctx.attr.version, symbols_pkg.path)

    cmd = ctx.expand_location(
        cmd,
        targets = [
            ctx.attr._zip,
        ],
    )

    ctx.actions.run_shell(
        outputs = [pkg, symbols_pkg],
        inputs = [
            zip_file,
            dotnet,
            packages,
        ],
        tools = [
            ctx.executable._zip,
            dotnet,
        ] + toolchain.default.files.to_list() + toolchain.runtime.default_runfiles.files.to_list() + toolchain.runtime.data_runfiles.files.to_list(),
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
        "property_group_vars": attr.string_dict(
            doc = "Keys and values for variables declared in `PropertyGroup`s in the `csproj_file`",
            allow_empty = True,
        ),
        "nuspec_template": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
        "_zip": attr.label(
            default = "@bazel_tools//tools/zip:zipper",
            executable = True,
            cfg = "exec",
        ),
    },
    toolchains = ["@rules_dotnet//dotnet:toolchain_type"],
)
