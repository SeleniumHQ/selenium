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
        version = "2.78.2",
        sha256 = "68b70b5e3e3f0df0dd858b228131fec40ca45493bb5b93f77b9ab3a38b21f7fb",
    )
    return module_ctx.extension_metadata(reproducible = True)

docfx_extension = module_extension(implementation = _docfx_extension_impl)
