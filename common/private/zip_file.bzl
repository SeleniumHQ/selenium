def _expand(files, ex):
    expanded = []
    for f in files:
        more_f = ex.expand(f)
        for mf in more_f:
            if not mf.is_directory:
                expanded.append("%s=%s" % (mf.short_path, mf.path))

    return expanded

def _zip_file_impl(ctx):
    name = "%s.%s" % (ctx.label.name, ctx.attr.extension)
    output = ctx.actions.declare_file(name)

    args = ctx.actions.args()
    args.add_all(["Cc", output])

    args.add_all([ctx.files.srcs], map_each = _expand)

    ctx.actions.run(
        executable = ctx.executable._zip,
        arguments = [args],
        inputs = ctx.files.srcs,
        outputs = [output],
    )

    return DefaultInfo(
        files = depset([output]),
    )

zip_file = rule(
    _zip_file_impl,
    attrs = {
        "extension": attr.string(
            default = "zip",
        ),
        "srcs": attr.label_list(
            allow_empty = True,
            allow_files = True,
        ),
        "_zip": attr.label(
            default = "@bazel_tools//tools/zip:zipper",
            executable = True,
            cfg = "exec",
        ),
    },
)
