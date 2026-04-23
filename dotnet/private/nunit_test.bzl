load("@rules_dotnet//dotnet:defs.bzl", "csharp_test")
load("//dotnet/private:nuget_package.bzl", "nuget_package")

def nunit_test(name, srcs = [], deps = [], **kwargs):
    csharp_test(
        name = name,
        srcs = srcs + ["@rules_dotnet//dotnet/private/rules/common/nunit:shim.cs"],
        deps = deps + [
            nuget_package("NUnitLite"),
        ],
        **kwargs
    )
