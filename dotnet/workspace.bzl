load(
    "@d2l_rules_csharp//csharp:defs.bzl",
    "csharp_register_toolchains",
    "csharp_repositories",
    "import_nuget_package",
)

def selenium_register_dotnet():
    csharp_register_toolchains()
    csharp_repositories()

    native.register_toolchains("//third_party/dotnet/ilmerge:all")

    import_nuget_package(
        name = "json.net",
        file = "third_party/dotnet/nuget/packages/newtonsoft.json.12.0.2.nupkg",
        sha256 = "056eec5d3d8b2a93f7ca5b026d34d9d5fe8c835b11e322faf1a2551da25c4e70",
    )

    import_nuget_package(
        name = "moq",
        file = "third_party/dotnet/nuget/packages/moq.4.12.0.nupkg",
        sha256 = "339bbb71107e137a753a89c6b74adb5d9072f0916cf8f19f48b30ae29c41f434",
    )

    import_nuget_package(
        name = "benderproxy",
        file = "third_party/dotnet/nuget/packages/benderproxy.1.0.0.nupkg",
        #sha256 = "056eec5d3d8b2a93f7ca5b026d34d9d5fe8c835b11e322faf1a2551da25c4e70",
    )

    import_nuget_package(
        name = "castle.core",
        file = "third_party/dotnet/nuget/packages/castle.core.4.4.0.nupkg",
        sha256 = "ee12c10079c1f9daebdb2538c37a34e5e317d800f2feb5cddd744f067d5dec66",
    )

    import_nuget_package(
        name = "nunit",
        file = "third_party/dotnet/nuget/packages/nunit.3.12.0.nupkg"
        #sha256 = "056eec5d3d8b2a93f7ca5b026d34d9d5fe8c835b11e322faf1a2551da25c4e70",
    )

    #import_nuget_package(
    #    name = "system.threading.tasks.extensions",
    #    package = "system.threading.tasks.extensions",
    #    version = "4.5.1",
    #)

    #import_nuget_package(
    #    name = "nunit",
    #    package = "nunit",
    #    version = "3.12.0",
    #)
