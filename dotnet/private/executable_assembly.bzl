load("@d2l_rules_csharp//csharp/private:providers.bzl", "AnyTargetFrameworkInfo")
load("@d2l_rules_csharp//csharp/private:actions/assembly.bzl", "AssemblyAction")
load("@d2l_rules_csharp//csharp/private:actions/write_runtimeconfig.bzl", "write_runtimeconfig")
load(
    "@d2l_rules_csharp//csharp/private:common.bzl",
    "fill_in_missing_frameworks",
    "is_core_framework",
    "is_debug",
    "is_standard_framework",
)
load("//dotnet/private:copy_files.bzl", "copy_files")

def _generate_execution_script_file(ctx, target):
    tfm = target.actual_tfm
    assembly_file_name = target.out.basename
    shell_file_extension = "sh"
    execution_line = "$( cd \"$(dirname \"$BASH_SOURCE[0]}\")\" >/dev/null 2>&1 && pwd -P )/" + assembly_file_name + " $@"
    if ctx.attr.is_windows:
        shell_file_extension = "bat"
        execution_line = "%~dp0" + assembly_file_name + " %*"
    if is_core_framework(tfm) or tfm == "net5.0":
        execution_line = "dotnet " + execution_line
    else:
        execution_line = "mono " + execution_line

    toolchain = ctx.toolchains["@d2l_rules_csharp//csharp/private:toolchain_type"]
    dotnet_sdk_location = toolchain.runtime.executable.dirname
    environment = ""
    if not ctx.attr.is_windows:
        environment += "export DOTNET_CLI_HOME=%s\n" % dotnet_sdk_location
        environment += "export APPDATA=%s\n" % dotnet_sdk_location
        environment += "export PROGRAMFILES=%s\n" % dotnet_sdk_location
        environment += "export USERPROFILE=%s\n" % dotnet_sdk_location
        environment += "export DOTNET_CLI_TELEMETRY_OPTOUT=1\n"
    else:
        environment += "@echo off\n"

    shell_content = environment + execution_line

    shell_file_name = "bazelout/%s/%s.%s" % (tfm, assembly_file_name, shell_file_extension)
    shell_file = ctx.actions.declare_file(shell_file_name)
    ctx.actions.write(
        output = shell_file,
        content = shell_content,
        is_executable = True,
    )

    return shell_file

def _copy_dependency_files(ctx, provider_value):
    src_list = provider_value.transitive_runfiles.to_list()
    target_dir = "bazelout/%s/" % (provider_value.actual_tfm)
    file_list = []
    for src_file in src_list:
        file_list.append((src_file, src_file.basename))

    return copy_files(ctx, file_list, target_dir, ctx.attr.is_windows)

def create_executable_assembly(ctx, extra_srcs, extra_deps):
    stdrefs = [ctx.attr._stdrefs] if ctx.attr.include_stdrefs else []

    providers = {}
    for tfm in ctx.attr.target_frameworks:
        if is_standard_framework(tfm):
            fail("It doesn't make sense to build an executable for " + tfm)

        providers[tfm] = AssemblyAction(
            ctx.actions,
            name = ctx.attr.name,
            additionalfiles = ctx.files.additionalfiles,
            analyzers = ctx.attr.analyzers,
            debug = is_debug(ctx),
            defines = ctx.attr.defines,
            deps = ctx.attr.deps + extra_deps + stdrefs,
            keyfile = ctx.file.keyfile,
            langversion = ctx.attr.langversion,
            resources = ctx.files.resources,
            srcs = ctx.files.srcs + extra_srcs,
            out = ctx.attr.out,
            target = "exe",
            target_framework = tfm,
            toolchain = ctx.toolchains["@d2l_rules_csharp//csharp/private:toolchain_type"],
        )

    fill_in_missing_frameworks(providers)

    result = providers.values()
    dependency_files_list = _copy_dependency_files(ctx, result[0])

    runtimeconfig = write_runtimeconfig(
        ctx.actions,
        ctx.file.runtimeconfig_template,
        result[0].out.basename.replace("." + result[0].out.extension, ""),
        result[0].actual_tfm,
    )

    data_runfiles = [] if ctx.attr.data == None else [d.files for d in ctx.attr.data]

    shell_file = _generate_execution_script_file(ctx, result[0])

    direct_runfiles = [result[0].out, result[0].pdb]
    if runtimeconfig != None:
        direct_runfiles.append(runtimeconfig)

    result.append(DefaultInfo(
        executable = shell_file,
        runfiles = ctx.runfiles(
            files = direct_runfiles,
            transitive_files = depset(dependency_files_list, transitive = data_runfiles),
        ),
        files = depset([result[0].out, result[0].refout, result[0].pdb, shell_file]),
    ))

    return result

def _csharp_executable_impl(ctx):
    extra_srcs = []
    extra_deps = []
    return create_executable_assembly(ctx, extra_srcs, extra_deps)

csharp_executable = rule(
    _csharp_executable_impl,
    doc = "Create an executable C# exe",
    attrs = {
        "srcs": attr.label_list(
            doc = "C# source files.",
            allow_files = [".cs"],
        ),
        "additionalfiles": attr.label_list(
            doc = "Extra files to configure analyzers.",
            allow_files = True,
        ),
        "analyzers": attr.label_list(
            doc = "A list of analyzer references.",
            providers = AnyTargetFrameworkInfo,
        ),
        "keyfile": attr.label(
            doc = "The key file used to sign the assembly with a strong name.",
            allow_single_file = True,
        ),
        "langversion": attr.string(
            doc = "The version string for the C# language.",
        ),
        "resources": attr.label_list(
            doc = "A list of files to embed in the DLL as resources.",
            allow_files = True,
        ),
        "out": attr.string(
            doc = "File name, without extension, of the built assembly.",
        ),
        "target_frameworks": attr.string_list(
            doc = "A list of target framework monikers to build" +
                  "See https://docs.microsoft.com/en-us/dotnet/standard/frameworks",
            allow_empty = False,
        ),
        "defines": attr.string_list(
            doc = "A list of preprocessor directive symbols to define.",
            default = [],
            allow_empty = True,
        ),
        "include_stdrefs": attr.bool(
            doc = "Whether to reference @net//:StandardReferences (the default set of references that MSBuild adds to every project).",
            default = True,
        ),
        "runtimeconfig_template": attr.label(
            doc = "A template file to use for generating runtimeconfig.json",
            default = "@d2l_rules_csharp//csharp/private:runtimeconfig.json.tpl",
            allow_single_file = True,
        ),
        "_stdrefs": attr.label(
            doc = "The standard set of assemblies to reference.",
            default = "@net//:StandardReferences",
        ),
        "deps": attr.label_list(
            doc = "Other C# libraries, binaries, or imported DLLs",
            providers = AnyTargetFrameworkInfo,
        ),
        "data": attr.label_list(
            doc = "Additional data files or targets that are required to run the executable.",
            allow_files = True,
        ),
        "is_windows": attr.bool(default = False),
    },
    executable = True,
    toolchains = ["@d2l_rules_csharp//csharp/private:toolchain_type"],
)
