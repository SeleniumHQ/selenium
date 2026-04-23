"""Repository rule to download the docfx NuGet package."""

_BUILD = """
package(default_visibility = ["//visibility:public"])
exports_files(glob(["**/*"]))
filegroup(name = "docfx_dll", srcs = ["tools/net8.0/any/docfx.dll"])
"""

def _docfx_repo_impl(ctx):
    ctx.download_and_extract(
        url = "https://api.nuget.org/v3-flatcontainer/docfx/{0}/docfx.{0}.nupkg".format(ctx.attr.version),
        sha256 = ctx.attr.sha256,
        type = "zip",
    )
    ctx.file("BUILD.bazel", _BUILD)

docfx_repo = repository_rule(
    implementation = _docfx_repo_impl,
    attrs = {
        "version": attr.string(mandatory = True),
        "sha256": attr.string(mandatory = True),
    },
)

def _docfx_extension_impl(module_ctx):
    docfx_repo(
        name = "docfx",
        version = "2.78.5",
        sha256 = "924a104075e4bf7eae9520147ec10a809e82a8438ec330104581d219435968c5",
    )
    return module_ctx.extension_metadata(reproducible = True)

docfx_extension = module_extension(implementation = _docfx_extension_impl)
