# BUILD FILE SYNTAX: STARLARK

load("//:version.bzl", "VERSIONS")

SE_VERSION = VERSIONS["dotnet"]

SUPPORTED_DEVTOOLS_VERSIONS = [
    "v152",
    "v153",
    "v154",
]

ASSEMBLY_COMPANY = "Selenium Committers"
ASSEMBLY_COPYRIGHT = "Copyright © Software Freedom Conservancy 2023"

# Only stamped (release) builds compile the real version into the assemblies,
# so a version bump does not invalidate every assembly and test.
ASSEMBLY_INFORMATIONAL_VERSION = select({
    "//dotnet/private:stamp_enabled": SE_VERSION,
    "//conditions:default": "VERSION_STUB",
})
ASSEMBLY_PRODUCT = "Selenium"
ASSEMBLY_VERSION = "4.0.0.0"
