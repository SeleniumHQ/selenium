load("@rules_dotnet//dotnet:defs.bzl", _csharp_binary = "csharp_binary", _csharp_library = "csharp_library", _csharp_test = "csharp_test")
load("//dotnet:selenium-dotnet-version.bzl", "SUPPORTED_DEVTOOLS_VERSIONS")
load("//dotnet/private:dotnet_format.bzl", _dotnet_format = "dotnet_format")
load("//dotnet/private:dotnet_nunit_test_suite.bzl", _dotnet_nunit_test_suite = "dotnet_nunit_test_suite")
load("//dotnet/private:generate_devtools.bzl", _generate_devtools = "generate_devtools")
load("//dotnet/private:generate_resources.bzl", _generated_resource_utilities = "generated_resource_utilities")
load("//dotnet/private:generated_assembly_info.bzl", _generated_assembly_info = "generated_assembly_info")
load("//dotnet/private:nuget_pack.bzl", _nuget_pack = "nuget_pack")
load("//dotnet/private:nuget_package.bzl", _nuget_package = "nuget_package")
load("//dotnet/private:nuget_push.bzl", _nuget_push = "nuget_push")
load("//dotnet/private:nunit_test.bzl", _nunit_test = "nunit_test")
load("//dotnet/private:paket_deps.bzl", _paket_deps = "paket_deps")

def devtools_version_targets():
    targets = []
    for devtools_version in SUPPORTED_DEVTOOLS_VERSIONS:
        targets.append("//dotnet/src/webdriver/DevTools:generate-{}".format(devtools_version))
    return targets

csharp_binary = _csharp_binary
csharp_library = _csharp_library
csharp_test = _csharp_test
dotnet_format = _dotnet_format
dotnet_nunit_test_suite = _dotnet_nunit_test_suite
generate_devtools = _generate_devtools
generated_resource_utilities = _generated_resource_utilities
generated_assembly_info = _generated_assembly_info
nuget_pack = _nuget_pack
nuget_package = _nuget_package
nuget_push = _nuget_push
nunit_test = _nunit_test
paket_deps = _paket_deps
