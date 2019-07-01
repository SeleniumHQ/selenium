workspace(
    name = "selenium",
    managed_directories = {
        # Share the node_modules directory between Bazel and other tooling
        "@npm": ["node_modules"],
    }
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "io_bazel_rules_closure",
    sha256 = "b6936ecc0b5a1ef616b9d7e76694d414aa5605265c11322257a610fb256b1bf7",
    strip_prefix = "rules_closure-7434c41542ca9e1b05166d897b90073d1b8b2cf8",
    urls = [
        "https://github.com/bazelbuild/rules_closure/archive/7434c41542ca9e1b05166d897b90073d1b8b2cf8.tar.gz",
    ],
)

load("@io_bazel_rules_closure//closure:defs.bzl", "closure_repositories")

closure_repositories()

http_archive(
    name = "io_bazel_rules_dotnet",
    sha256 = "9ee5429417190f00b2c970ba628db833e7ce71323efb646b9ce6b3aaaf56f125",
    strip_prefix = "rules_dotnet-e9537b4a545528b11b270dfa124f3193bdb2d78e",
    urls = [
        "https://github.com/bazelbuild/rules_dotnet/archive/e9537b4a545528b11b270dfa124f3193bdb2d78e.tar.gz",
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
   version = "4.12.0",
   build_file = "//third_party/dotnet/nuget/packages:moq.bzl"
)

dotnet_nuget_new(
   name = "benderproxy",
   package = "benderproxy",
   version = "1.0.0",
   build_file = "//third_party/dotnet/nuget/packages:benderproxy.bzl"
)

dotnet_nuget_new(
    name = "castle.core",
    package = "castle.core",
    version = "4.4.0",
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
   version = "3.12.0",
   build_file = "//third_party/dotnet/nuget/packages:nunit.bzl"
)

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "6d4edbf28ff6720aedf5f97f9b9a7679401bf7fca9d14a0fff80f644a99992b4",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.32.2/rules_nodejs-0.32.2.tar.gz"],
)

load("@build_bazel_rules_nodejs//:defs.bzl", "npm_install")
npm_install(
    name = "npm",
    package_json = "//:package.json",
    package_lock_json = "//:package-lock.json",
)

load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")
install_bazel_dependencies()
