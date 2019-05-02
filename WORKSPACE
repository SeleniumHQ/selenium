workspace(name = "selenium")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "io_bazel_rules_closure",
    sha256 = "bc7b6edd8684953b851300ef7fa122f4e6e9ed52f509a13724e49ffddb9a14eb",
    strip_prefix = "rules_closure-d1110778a2e94bcdac5d5d00044dcb6cd07f1d51",
    urls = [
        "https://github.com/bazelbuild/rules_closure/archive/d1110778a2e94bcdac5d5d00044dcb6cd07f1d51.tar.gz",
    ],
)

load("@io_bazel_rules_closure//closure:defs.bzl", "closure_repositories")

closure_repositories()

http_archive(
    name = "io_bazel_rules_dotnet",
    sha256 = "1dad06a55e9543f69f4b4df5711910c9c2c9de554e9d2f1c5eb2ff60a62eb4a9",
    strip_prefix = "rules_dotnet-8fadcaaa395bca82cb21aa371f8c30e86df11912",
    urls = [
        "https://github.com/bazelbuild/rules_dotnet/archive/8fadcaaa395bca82cb21aa371f8c30e86df11912.tar.gz",
    ]
)

load("@io_bazel_rules_dotnet//dotnet:defs.bzl",
     "dotnet_register_toolchains",
     "net_register_sdk",
     "core_register_sdk",
     "mono_register_sdk",
     "dotnet_repositories",
     "dotnet_nuget_new",
     "nuget_package",
     "DOTNET_NET_FRAMEWORKS",
     "DOTNET_CORE_FRAMEWORKS")

dotnet_register_toolchains()
dotnet_repositories()

mono_register_sdk()

[net_register_sdk(
    framework
) for framework in DOTNET_NET_FRAMEWORKS]

[core_register_sdk(
    framework
) for framework in DOTNET_CORE_FRAMEWORKS]

# Default core_sdk
core_register_sdk("v2.1.502", name = "core_sdk")

# Default net_sdk
net_register_sdk("net472", name = "net_sdk")

dotnet_nuget_new(
   name = "json.net",
   package = "newtonsoft.json",
   version = "12.0.2",
   build_file = "//third_party/dotnet/nuget/packages:newtonsoft.json.bzl"
)

dotnet_nuget_new(
   name = "moq",
   package = "moq",
   version = "4.10.1",
   build_file = "//third_party/dotnet/nuget/packages:moq.bzl"
)

dotnet_nuget_new(
    name = "castle.core",
    package = "castle.core",
    version = "4.3.1",
    build_file = "//third_party/dotnet/nuget/packages:castle.core.bzl"
)

dotnet_nuget_new(
    name = "system.threading.tasks.extensions",
    package = "system.threading.tasks.extensions",
    version = "4.5.1",
    build_file = "//third_party/dotnet/nuget/packages:system.threading.tasks.extensions.bzl"
)

dotnet_nuget_new(
   name = "nunit",
   package = "nunit",
   version = "3.11.0",
   build_file = "//third_party/dotnet/nuget/packages:nunit.bzl"
)
