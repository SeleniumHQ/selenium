def _dmg_archive_impl(repository_ctx):
    url = repository_ctx.attr.url
    (ignored, ignored, dmg_name) = url.rpartition("/")
    dmg_name = dmg_name.replace("%20", "_")

    attrs = {
        "output": dmg_name,
    }
    if repository_ctx.attr.sha256:
        attrs.update({"sha256": repository_ctx.attr.sha256})

    repository_ctx.download(
        url,
        **attrs
    )

    zip_name = dmg_name.replace(".dmg", ".zip")
    repository_ctx.execute([
        repository_ctx.path(Label("@selenium//common/private:convert_dmg.sh")),
        dmg_name,
        zip_name,
    ])

    repository_ctx.extract(
        archive = zip_name,
        stripPrefix = repository_ctx.attr.strip_prefix,
        output = repository_ctx.attr.output,
    )

    repository_ctx.file(
        "BUILD.bazel",
        repository_ctx.attr.build_file_content,
    )

dmg_archive = repository_rule(
    _dmg_archive_impl,
    attrs = {
        "url": attr.string(
            mandatory = True,
        ),
        "sha256": attr.string(),
        "strip_prefix": attr.string(),
        "output": attr.string(),
        "build_file_content": attr.string(),
        "build_file": attr.label(),
    },
)
