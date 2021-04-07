"""
Rules for compiling NUnit tests.
"""

load("@d2l_rules_csharp//csharp/private:providers.bzl", "AnyTargetFrameworkInfo")
load("//dotnet/private:executable_assembly.bzl", "create_executable_assembly")

def _nunit_test_impl(ctx):
    extra_srcs = [ctx.file._nunit_shim]
    extra_deps = [ctx.attr._nunitlite, ctx.attr._nunitframework]
    return create_executable_assembly(ctx, extra_srcs, extra_deps)

nunit_test = rule(
    _nunit_test_impl,
    doc = "Run NUnit tests",
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
        "is_windows": attr.bool(default = False),
    },
    test = True,
    executable = True,
    toolchains = ["@d2l_rules_csharp//csharp/private:toolchain_type"],
)
