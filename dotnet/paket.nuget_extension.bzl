"Generated"

load(":paket.nuget.bzl", _nuget = "nuget")

def _nuget_impl(module_ctx):
    _nuget()
    return module_ctx.extension_metadata(reproducible = True)

nuget_extension = module_extension(
    implementation = _nuget_impl,
)
