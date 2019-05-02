package(default_visibility = [ "//visibility:public" ])
load("@io_bazel_rules_dotnet//dotnet:defs.bzl", "net_import_library", "core_import_library")

net_import_library(
    name = "net45",
    src = "lib/net45/nunit.framework.dll"
)

core_import_library(
    name = "netcore",
    src = "lib/netstandard20/nunit.framework.dll"
)
