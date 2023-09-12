load("@rules_dotnet//dotnet:defs.bzl", _csharp_binary = "csharp_binary", _csharp_library = "csharp_library", _csharp_test = "csharp_test")
load("//dotnet:selenium-dotnet-version.bzl", "SUPPORTED_DEVTOOLS_VERSIONS")
load("//dotnet/private:dotnet_nunit_test_suite.bzl", _dotnet_nunit_test_suite = "dotnet_nunit_test_suite")
load("//dotnet/private:framework.bzl", _framework = "framework")
load("//dotnet/private:generate_devtools.bzl", _generate_devtools = "generate_devtools")
load("//dotnet/private:generated_assembly_info.bzl", _generated_assembly_info = "generated_assembly_info")
load("//dotnet/private:nuget_pack.bzl", _nuget_pack = "nuget_pack")
load("//dotnet/private:nunit_test.bzl", _nunit_test = "nunit_test")

def devtools_version_targets():
    targets = []
    for devtools_version in SUPPORTED_DEVTOOLS_VERSIONS:
        targets.append("//dotnet/src/webdriver/cdp:generate-{}".format(devtools_version))
    return targets

csharp_binary = _csharp_binary
csharp_library = _csharp_library
csharp_test = _csharp_test
dotnet_nunit_test_suite = _dotnet_nunit_test_suite
framework = _framework
generate_devtools = _generate_devtools
generated_assembly_info = _generated_assembly_info
nuget_pack = _nuget_pack
nunit_test = _nunit_test
