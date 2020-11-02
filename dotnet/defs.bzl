load("//dotnet/private:assembly_info.bzl", _generated_assembly_info = "generated_assembly_info")
load("//dotnet/private:executable_assembly.bzl", _csharp_executable = "csharp_executable")
load("//dotnet/private:generate_devtools.bzl", _generate_devtools = "generate_devtools")
load("//dotnet/private:merge_assemblies.bzl", _merged_assembly = "merged_assembly")
load("//dotnet/private:nuget.bzl", _nuget_package = "nuget_package", _nuget_push = "nuget_push")
load("//dotnet/private:nunit_test.bzl", _nunit_test = "nunit_test")

generated_assembly_info = _generated_assembly_info
csharp_executable = _csharp_executable
generate_devtools = _generate_devtools
merged_assembly = _merged_assembly
nuget_package = _nuget_package
nuget_push = _nuget_push
nunit_test = _nunit_test
