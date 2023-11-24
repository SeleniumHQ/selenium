def _pkg_archive_impl(repository_ctx):
    url = repository_ctx.attr.url
    (ignored, ignored, pkg_name) = url.rpartition("/")
    idx = pkg_name.find("?")
    if idx != -1:
        pkg_name = pkg_name[0:idx]
    pkg_name = pkg_name.replace("%20", "_")

    attrs = {
        "output": pkg_name + ".download",
    }
    if repository_ctx.attr.sha256:
        attrs.update({"sha256": repository_ctx.attr.sha256})

    repository_ctx.download(
        url,
        **attrs
    )

    repository_ctx.execute([
        repository_ctx.which("pkgutil"),
        "--expand-full",
        pkg_name + ".download",
        pkg_name,
    ])

    for (key, value) in repository_ctx.attr.move.items():
        repository_ctx.execute(["mv", pkg_name + "/" + key, value])

    repository_ctx.file("BUILD.bazel", repository_ctx.attr.build_file_content)

pkg_archive = repository_rule(
    _pkg_archive_impl,
    attrs = {
        "url": attr.string(
            mandatory = True,
        ),
        "sha256": attr.string(),
        "move": attr.string_dict(),
        "build_file_content": attr.string(),
        "build_file": attr.label(),
    },
)
