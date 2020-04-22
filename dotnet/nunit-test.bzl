"""
Rules for compiling NUnit tests.
"""
load("@d2l_rules_csharp//csharp/private:providers.bzl", "AnyTargetFrameworkInfo")
load("@d2l_rules_csharp//csharp/private:actions/assembly.bzl", "AssemblyAction")
load(
    "@d2l_rules_csharp//csharp/private:common.bzl",
    "fill_in_missing_frameworks",
    "is_debug",
    "is_standard_framework",
    "is_core_framework"
)

CORE_FRAMEWORK_VERSIONS = {
    "netcoreapp2.0": "2.0.9",
    "netcoreapp2.1": "2.1.15",
    "netcoreapp2.2": "2.2.8",
    "netcoreapp3.0": "3.0.3",
    "netcoreapp3.1": "3.1.1",
}

def _write_runtimeconfig(ctx, target):
    tfm = target.actual_tfm
    runtimeconfig_file_name = "bazelout/%s/%s.runtimeconfig.json" % (tfm, target.out.basename.replace("." + target.out.extension, ""))
    runtimeconfig = None
    if is_core_framework(tfm):
        runtimeconfig = ctx.actions.declare_file(runtimeconfig_file_name)
        ctx.actions.expand_template(
            template = ctx.file.runtimeconfig_template,
            output = runtimeconfig,
            substitutions = {
                "{RUNTIME_TFM}": tfm,
                "{RUNTIME_FRAMEWORK_VERSION}": CORE_FRAMEWORK_VERSIONS[tfm],
            },
        )

    return runtimeconfig

def _generate_execution_script_file(ctx, target):
    tfm = target.actual_tfm
    test_file_name = target.out.basename
    shell_file_extension = "sh"
    execution_line = "$( cd \"$(dirname \"$BASH_SOURCE[0]}\")\" >/dev/null 2>&1 && pwd -P )/" + test_file_name + " $@"
    if ctx.attr.is_windows:
        shell_file_extension = "bat"
        execution_line = "%~dp0" + test_file_name + " %*"

    if is_core_framework(tfm):
        execution_line = "dotnet " + execution_line

    dotnet_sdk_location = ""
    environment = ""
    if not ctx.attr.is_windows:
        # This needs to be fixed here for non-Windows platforms.
        environment += "export HOME=%s\n" % dotnet_sdk_location
        environment += "export DOTNET_CLI_HOME=%s\n" % dotnet_sdk_location
        environment += "export APPDATA=%s\n" % dotnet_sdk_location
        environment += "export PROGRAMFILES=%s\n" % dotnet_sdk_location
        environment += "export USERPROFILE=%s\n" % dotnet_sdk_location
        environment += "export DOTNET_CLI_TELEMETRY_OPTOUT=1%s\n"

    shell_content = environment + execution_line

    shell_file_name = "bazelout/%s/%s.%s" % (tfm, test_file_name, shell_file_extension)
    shell_file = ctx.actions.declare_file(shell_file_name)
    ctx.actions.write(
        output = shell_file,
        content = shell_content,
        is_executable = True,
    )

    return shell_file

def _copy_cmd(ctx, file_list, target_dir):
    dest_list = []

    if file_list == None or len(file_list) == 0:
      return dest_list

    shell_content = ""
    batch_file_name = "%s/%s-copydeps.bat" % (target_dir, ctx.attr.out)
    bat = ctx.actions.declare_file(batch_file_name)
    for src_file in file_list:
        dest_file = ctx.actions.declare_file(target_dir + src_file.basename)
        dest_list.append(dest_file)
        shell_content += "@copy /Y \"%s\" \"%s\" >NUL\n" % (
            src_file.path.replace("/", "\\"),
            dest_file.path.replace("/", "\\")
        )

    ctx.actions.write(
        output = bat,
        content = shell_content,
        is_executable = True,
    )
    ctx.actions.run(
        inputs = file_list,
        tools = [bat],
        outputs = dest_list,
        executable = "cmd.exe",
        arguments = ["/C", bat.path.replace("/", "\\")],
        mnemonic = "CopyFile",
        progress_message = "Copying files",
        use_default_shell_env = True,
    )

    return dest_list

def _copy_bash(ctx, src_list, target_dir):
    dest_list = []
    for src_file in src_list:
        dest_file = ctx.actions.declare_file(target_dir + src_file.basename)
        dest_list.append(dest_file)

        ctx.actions.run_shell(
            tools = [src_file],
            outputs = [dest_file],
            command = "cp -f \"$1\" \"$2\"",
            arguments = [src_file.path, dest_file.path],
            mnemonic = "CopyFile",
            progress_message = "Copying files",
            use_default_shell_env = True,
        )

    return dest_list

def _copy_dependency_files(ctx, provider_value):
    src_list =  provider_value.transitive_runfiles.to_list()
    target_dir = "bazelout/%s/" % (provider_value.actual_tfm)
    dest_list = []
    if ctx.attr.is_windows:
        dest_list = _copy_cmd(ctx, src_list, target_dir)
    else:
        dest_list = _copy_bash(ctx, src_list, target_dir)

    return dest_list

def _nunit_test_impl(ctx):
    providers = {}

    extra_deps = [ctx.attr._nunitlite, ctx.attr._nunitframework]
    stdrefs = [ctx.attr._stdrefs] if ctx.attr.include_stdrefs else []

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
            srcs = ctx.files.srcs + [ctx.file._nunit_shim],
            out = ctx.attr.out,
            target = "exe",
            target_framework = tfm,
            toolchain = ctx.toolchains["@d2l_rules_csharp//csharp/private:toolchain_type"],
        )

    fill_in_missing_frameworks(providers)

    result = providers.values()
    dependency_files_list = _copy_dependency_files(ctx, result[0])

    runtimeconfig = _write_runtimeconfig(ctx, result[0])

    data_runfiles = [] if ctx.attr.data == None else [d.files for d in ctx.attr.data]

    shell_file = _generate_execution_script_file(ctx, result[0])

    direct_runfiles = [result[0].out, result[0].pdb]
    if runtimeconfig != None:
        direct_runfiles += [runtimeconfig]

    result.append(DefaultInfo(
        executable = shell_file,
        runfiles = ctx.runfiles(
            files = direct_runfiles,
            transitive_files = depset(dependency_files_list, transitive = data_runfiles),
        ),
        files = depset([result[0].out, result[0].refout, result[0].pdb, shell_file]),
    ))

    return result

nunit_test = rule(
    _nunit_test_impl,
    doc = "Compile a C# exe",
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
            doc = "Additional data files or targets that are required to run tests.",
            allow_files = True,
        ),
        "_nunit_shim": attr.label(
            doc = "Entry point for NUnitLite",
            allow_single_file = [".cs"],
            default = "@d2l_rules_csharp//csharp/private:nunit/shim.cs",
        ),
        "_nunitlite": attr.label(
            doc = "The NUnitLite library",
            providers = AnyTargetFrameworkInfo,
            default = "@NUnitLite//:nunitlite",
        ),
        "_nunitframework": attr.label(
            doc = "The NUnit framework",
            providers = AnyTargetFrameworkInfo,
            default = "@NUnit//:nunit.framework",
        ),
        "is_windows": attr.bool(default=False),
    },
    test = True,
    executable = True,
    toolchains = ["@d2l_rules_csharp//csharp/private:toolchain_type"],
)
