load("@rules_dotnet//dotnet:defs.bzl", "csharp_test")
load("//dotnet/private:framework.bzl", "framework")

def nunit_test(name, srcs = [], deps = [], **kwargs):
    csharp_test(
        name = name,
        srcs = srcs + ["@rules_dotnet//dotnet/private/rules/common/nunit:shim.cs"],
        deps = deps + [
            framework("nuget", "NUnitLite"),
        ],
        **kwargs
    )
