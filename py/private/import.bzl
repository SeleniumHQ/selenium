def _py_import_impl(ctx):
    # Unpack the file somewhere, and present as a python library. We need to
    # know all the files in the zip, and that's problematic. For now, we might
    # be able to get away with just creating and declaring the directory.

    root = ctx.actions.declare_directory("%s-pyroot" % ctx.attr.name)
    args = ctx.actions.args()

    if ctx.file.wheel.path.endswith(".zip") or ctx.file.wheel.path.endswith(".whl"):
        args.add("x")
        args.add(ctx.file.wheel.path)
        args.add_all(["-d", root.path])

        ctx.actions.run(
            outputs = [root],
            inputs = [ctx.file.wheel],
            arguments = [args],
            executable = ctx.executable._zip,
        )
    elif ctx.file.wheel.path.endswith(".tar.gz"):
        args.add(ctx.file.wheel.path)
        args.add(root.path)

        ctx.actions.run(
            outputs = [root],
            inputs = [ctx.file.wheel],
            arguments = [args],
            executable = ctx.executable._untar,
        )
    else:
        fail("Unrecognised file extension: %s" % ctx.attr.wheel)

    runfiles = ctx.runfiles(files = [root])
    for dep in ctx.attr.deps:
        runfiles = runfiles.merge(dep[DefaultInfo].default_runfiles)

    imports = depset(
        items = [
            "%s/%s/%s-pyroot" % (ctx.workspace_name, ctx.label.package, ctx.label.name),
        ],
        transitive = [dep[PyInfo].imports for dep in ctx.attr.deps],
    )
    transitive_sources = depset(
        items = [],
        transitive = [dep[PyInfo].transitive_sources for dep in ctx.attr.deps],
    )

    py_srcs = ctx.attr.srcs_version

    info = PyInfo(
        imports = imports,
        has_py2_only_sources = py_srcs == "PY2",
        has_py3_only_sources = py_srcs == "PY3",
        transitive_sources = transitive_sources,
        uses_shared_libraries = not ctx.attr.zip_safe,
    )

    return [
        DefaultInfo(
            files = depset(items = [root]),
            default_runfiles = runfiles,
        ),
        info,
    ]

py_import = rule(
    _py_import_impl,
    attrs = {
        "wheel": attr.label(
            allow_single_file = True,
            mandatory = True,
        ),
        "zip_safe": attr.bool(
            default = True,
        ),
        "python_version": attr.string(
            default = "PY3",
            values = ["PY2", "PY3"],
        ),
        "srcs_version": attr.string(
            default = "PY2AND3",
            values = ["PY2", "PY3", "PY2AND3"],
        ),
        "deps": attr.label_list(
            allow_empty = True,
            providers = [PyInfo],
        ),
        "_zip": attr.label(
            allow_single_file = True,
            cfg = "host",
            default = "@bazel_tools//tools/zip:zipper",
            executable = True,
        ),
        "_untar": attr.label(
            cfg = "exec",
            default = "//py/private:untar",
            executable = True,
        ),
    },
)
