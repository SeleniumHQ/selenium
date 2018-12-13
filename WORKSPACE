workspace(name = "selenium")

http_archive(
    name = "io_bazel_rules_closure",
    sha256 = "b29a8bc2cb10513c864cb1084d6f38613ef14a143797cea0af0f91cd385f5e8c",
    strip_prefix = "rules_closure-0.8.0",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_closure/archive/0.8.0.tar.gz",
        "https://github.com/bazelbuild/rules_closure/archive/0.8.0.tar.gz",
    ],
)
load("@io_bazel_rules_closure//closure:defs.bzl", "closure_repositories")
closure_repositories()

git_repository(
    name = "windows_cc_config_init",
    remote = "https://github.com/excitoon/bazel-win32-toolchain",
    commit = "40000006ca052634bed4a870e89cecf957ea3344"
)

load("@windows_cc_config_init//:windows_toolchain.bzl", "windows_toolchain")
windows_toolchain(
    name = "windows_cc_config"
)

git_repository(
    name = "io_bazel_rules_dotnet",
    remote = "https://github.com/bazelbuild/rules_dotnet",
    commit = "bdfc24001b2463dbdb483b1fd9cd6420002adc7d"
)

load("@io_bazel_rules_dotnet//dotnet:defs.bzl", "dotnet_register_toolchains", "dotnet_repositories", "dotnet_nuget_new")

dotnet_repositories()
dotnet_register_toolchains(net_version="4.5")

dotnet_nuget_new(
   name = "json.net",
   package = "newtonsoft.json",
   version = "11.0.2",
   build_file_content = """
package(default_visibility = [ "//visibility:public" ])
load("@io_bazel_rules_dotnet//dotnet:defs.bzl", "net_import_library", "core_import_library")

net_import_library(
    name = "net35",
    src = "lib/net35/Newtonsoft.Json.dll"
)
net_import_library(
    name = "net40",
    src = "lib/net40/Newtonsoft.Json.dll"
)
net_import_library(
    name = "net45",
    src = "lib/net45/Newtonsoft.Json.dll"
)
core_import_library(
    name = "netcore",
    src = "lib/netstandard2.0/Newtonsoft.Json.dll"
)
    """
)

