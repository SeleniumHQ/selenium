package(default_visibility = [ "//visibility:public" ])
load("@io_bazel_rules_dotnet//dotnet:defs.bzl", "net_import_library", "core_import_library")

net_import_library(
  name = "net45",
  src = "lib/net45/Moq.dll",
  deps = [
    "@castle.core//:net45",
    "@system.threading.tasks.extensions//:net45",
  ],
)

core_import_library(
  name = "netcore",
  src = "lib/netstandard13/Moq.dll",
  deps = [
    "@castle.core//:netcore",
    "@system.threading.tasks.extensions//:netcore",
  ],
)
