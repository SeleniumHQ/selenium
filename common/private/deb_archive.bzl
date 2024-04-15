def _deb_archive_impl(repository_ctx):
    url = repository_ctx.attr.url

    attrs = {}
    if repository_ctx.attr.sha256:
        attrs.update({"sha256": repository_ctx.attr.sha256})

    repository_ctx.download_and_extract(
        url,
        **attrs
    )

    repository_ctx.extract(
        archive = "data.tar.xz",
        stripPrefix = repository_ctx.attr.strip_prefix,
        output = repository_ctx.attr.output,
    )
    repository_ctx.delete("data.tar.xz")

    repository_ctx.file(
        "BUILD.bazel",
        repository_ctx.attr.build_file_content,
    )

deb_archive = repository_rule(
    _deb_archive_impl,
    attrs = {
        "url": attr.string(
            mandatory = True,
        ),
        "sha256": attr.string(),
        "strip_prefix": attr.string(),
        "output": attr.string(),
        "build_file_content": attr.string(),
    },
)
