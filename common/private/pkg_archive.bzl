def _execute_or_fail(repository_ctx, args, what):
    result = repository_ctx.execute(args)
    if result.return_code != 0:
        fail("{} failed (rc={})\nargs: {}\nstdout: {}\nstderr: {}".format(
            what,
            result.return_code,
            [str(a) for a in args],
            result.stdout,
            result.stderr,
        ))
    return result

def _pkg_archive_impl(repository_ctx):
    repository_ctx.file("BUILD.bazel", repository_ctx.attr.build_file_content)

    if not repository_ctx.which("pkgutil"):
        # pkgutil is macOS-only; skip download on other platforms
        return

    url = repository_ctx.attr.url
    (ignored, ignored, pkg_name) = url.rpartition("/")
    idx = pkg_name.find("?")
    if idx != -1:
        pkg_name = pkg_name[0:idx]
    pkg_name = pkg_name.replace("%20", "_")

    download_name = pkg_name + ".download"
    attrs = {
        "output": download_name,
    }
    if repository_ctx.attr.sha256:
        attrs.update({"sha256": repository_ctx.attr.sha256})

    repository_ctx.download(
        url,
        **attrs
    )

    _execute_or_fail(
        repository_ctx,
        [
            repository_ctx.which("pkgutil"),
            "--expand-full",
            download_name,
            pkg_name,
        ],
        "pkgutil --expand-full",
    )

    for (key, value) in repository_ctx.attr.move.items():
        _execute_or_fail(
            repository_ctx,
            ["mv", pkg_name + "/" + key, value],
            "mv {} -> {}".format(key, value),
        )

    repository_ctx.delete(download_name)
    if repository_ctx.attr.move:
        repository_ctx.delete(pkg_name)

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
