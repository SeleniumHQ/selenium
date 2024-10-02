"Generated"

load(":paket.nuget.bzl", _nuget = "nuget")

def _nuget_impl(_ctx):
    _nuget()

nuget_extension = module_extension(
    implementation = _nuget_impl,
)
