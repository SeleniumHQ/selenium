package(default_visibility = ["//visibility:public"])

load("@io_bazel_rules_dotnet//dotnet:defs.bzl", "core_import_library", "net_import_library")

net_import_library(
    name = "net45",
    src = "lib/net45/BenderProxy.dll",
)

net_import_library(
    name = "net46",
    src = "lib/net46/BenderProxy.dll",
)

net_import_library(
    name = "net47",
    src = "lib/net47/BenderProxy.dll",
)

core_import_library(
    name = "netcore",
    src = "lib/netstandard15/BenderProxy.dll",
)
