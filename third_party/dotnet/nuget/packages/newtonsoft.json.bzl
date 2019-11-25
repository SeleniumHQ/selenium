package(default_visibility = ["//visibility:public"])

load("@io_bazel_rules_dotnet//dotnet:defs.bzl", "core_import_library", "net_import_library")

net_import_library(
    name = "net45",
    src = "lib/net45/Newtonsoft.Json.dll",
)

core_import_library(
    name = "netcore",
    src = "lib/netstandard2.0/Newtonsoft.Json.dll",
)
