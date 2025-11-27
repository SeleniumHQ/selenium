"Generated"

load(":paket.tests_nuget.bzl", _tests_nuget = "tests_nuget")

def _tests_nuget_impl(module_ctx):
    _tests_nuget()
    return module_ctx.extension_metadata(reproducible = True)

tests_nuget_extension = module_extension(
    implementation = _tests_nuget_impl,
)
