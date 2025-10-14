load(
    "@d2l_rules_csharp//csharp:defs.bzl",
    "csharp_register_toolchains",
    "csharp_repositories",
)

def selenium_register_dotnet():
    csharp_register_toolchains()
    csharp_repositories()
