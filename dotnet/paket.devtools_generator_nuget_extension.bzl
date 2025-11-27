"Generated"

load(":paket.devtools_generator_nuget.bzl", _devtools_generator_nuget = "devtools_generator_nuget")

def _devtools_generator_nuget_impl(module_ctx):
    _devtools_generator_nuget()
    return module_ctx.extension_metadata(reproducible = True)

devtools_generator_nuget_extension = module_extension(
    implementation = _devtools_generator_nuget_impl,
)
