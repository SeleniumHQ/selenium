load("@io_bazel_rules_dotnet//dotnet:defs.bzl",
     "dotnet_register_toolchains",
     "net_register_sdk",
     "core_register_sdk",
     "mono_register_sdk",
     "netstandard_register_sdk",
     "dotnet_repositories",
     "dotnet_nuget_new",
     "nuget_package",
     "DOTNET_NET_FRAMEWORKS",
     "DOTNET_CORE_FRAMEWORKS")

def selenium_register_dotnet():
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

    # Default netstandard_sdk
    netstandard_register_sdk("2.0.3", name = "netstandard_sdk")

    dotnet_nuget_new(
        name = "json.net",
        package = "newtonsoft.json",
        version = "12.0.2",
        build_file = "//third_party/dotnet/nuget/packages:newtonsoft.json.bzl",
    )

    dotnet_nuget_new(
        name = "moq",
        package = "moq",
        version = "4.12.0",
        build_file = "//third_party/dotnet/nuget/packages:moq.bzl",
    )

    dotnet_nuget_new(
        name = "benderproxy",
        package = "benderproxy",
        version = "1.0.0",
        build_file = "//third_party/dotnet/nuget/packages:benderproxy.bzl",
    )

    dotnet_nuget_new(
        name = "castle.core",
        package = "castle.core",
        version = "4.4.0",
        build_file = "//third_party/dotnet/nuget/packages:castle.core.bzl",
    )

    dotnet_nuget_new(
        name = "system.threading.tasks.extensions",
        package = "system.threading.tasks.extensions",
        version = "4.5.1",
        build_file = "//third_party/dotnet/nuget/packages:system.threading.tasks.extensions.bzl",
    )

    dotnet_nuget_new(
        name = "nunit",
        package = "nunit",
        version = "3.12.0",
        build_file = "//third_party/dotnet/nuget/packages:nunit.bzl",
    )
