NugetPackageInfo = provider(
    fields = {
        "csproj": "The `.csproj` `File` that generated this package. May be `None`",
        "package": "The nuget package as a `File`",
        "symbols": "The symbols nuget package as a `File`",
    },
)
