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
        file = "third_party/dotnet/nuget/packages/newtonsoft.json.12.0.3.nupkg",
        sha256 = "3d21caf909f9db2b5d13249d6728c2506c55e72e2123fbe2af65a056c0a0bf9d",
    )

    import_nuget_package(
        name = "moq",
        file = "third_party/dotnet/nuget/packages/moq.4.12.0.nupkg",
        sha256 = "339bbb71107e137a753a89c6b74adb5d9072f0916cf8f19f48b30ae29c41f434",
    )

    # Moq depends on Castle.Core
    import_nuget_package(
        name = "castle.core",
        file = "third_party/dotnet/nuget/packages/castle.core.4.4.0.nupkg",
        sha256 = "ee12c10079c1f9daebdb2538c37a34e5e317d800f2feb5cddd744f067d5dec66",
    )

    import_nuget_package(
        name = "benderproxy",
        file = "third_party/dotnet/nuget/packages/benderproxy.1.0.0.nupkg",
        sha256 = "fd536dc97eb71268392173e7c4c0699795a31f6843470134ee068ade1be4b57d",
    )

    import_nuget_package(
        name = "nunit",
        file = "third_party/dotnet/nuget/packages/nunit.3.12.0.nupkg",
        #sha256 = "056eec5d3d8b2a93f7ca5b026d34d9d5fe8c835b11e322faf1a2551da25c4e70",
    )

    import_nuget_package(
        name = "handlebars",
        file = "third_party/dotnet/nuget/packages/handlebars.net.1.11.5.nupkg",
        sha256 = "5771ef7dddbf0024e25456f26ffaaf75023847a8c0f5b8be1d832c1ef2a41c96",
    )

    # Handlebars.Net depends on Microsoft.CSharp
    import_nuget_package(
        name = "csharp",
        file = "third_party/dotnet/nuget/packages/microsoft.csharp.4.7.0.nupkg",
        sha256 = "127927bf646c145ebc9443ddadfe4cf81a55d641e82d3551029294c2e93fa63d",
    )

    import_nuget_package(
        name = "humanizer",
        file = "third_party/dotnet/nuget/packages/humanizer.core.2.8.26.nupkg",
        sha256 = "555b42765a0adefcfd6cfab486a1da195716bb72066ed26ac098e8ea45681ded",
    )

    import_nuget_package(
        name = "dependencyinjection",
        file = "third_party/dotnet/nuget/packages/microsoft.extensions.dependencyinjection.3.1.9.nupkg",
        sha256 = "6b4ddfc1c8d83139e8f1b8bd6cc0b2413b85362622d4ae547fb1b4edf897d2c5",
    )

    # Microsoft.Extensions.DependencyInjection depends on Microsoft.Extensions.DependencyInjection.Abstractions
    import_nuget_package(
        name = "dependencyinjectionabstractions",
        file = "third_party/dotnet/nuget/packages/microsoft.extensions.dependencyinjection.abstractions.3.1.9.nupkg",
        sha256 = "664b74ebd587279e3697e2db79e67199a75da1089479813d6ddca1e0c379f6d0",
    )

    import_nuget_package(
        name = "commandlineparser",
        file = "third_party/dotnet/nuget/packages/commandlineparser.2.8.0.nupkg",
        sha256 = "6b6568155442c2a4fb2ca4442f245bf401c11078ad212f4b9967894da3ef62d4",
    )
