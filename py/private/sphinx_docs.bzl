"""Bazel rule for building Sphinx HTML documentation."""

def _sphinx_docs_impl(ctx):
    html_dir = ctx.actions.declare_directory(ctx.label.name + "/_build/html")
    doctrees_dir = ctx.actions.declare_directory(ctx.label.name + "/_build/doctrees")

    config_dir = ctx.file.config.dirname

    args = ctx.actions.args()
    args.add("-b", "html")
    args.add("-d", doctrees_dir.path)
    args.add(config_dir)
    args.add(html_dir.path)

    ctx.actions.run(
        inputs = ctx.files.srcs + [ctx.file.config],
        outputs = [html_dir, doctrees_dir],
        executable = ctx.executable.sphinx,
        arguments = [args],
        mnemonic = "SphinxBuild",
        progress_message = "Building Sphinx HTML docs for %{label}",
    )

    return [DefaultInfo(files = depset([html_dir]))]

sphinx_docs = rule(
    implementation = _sphinx_docs_impl,
    attrs = {
        "config": attr.label(
            allow_single_file = True,
            mandatory = True,
            doc = "Sphinx configuration file (conf.py)",
        ),
        "sphinx": attr.label(
            executable = True,
            cfg = "exec",
            mandatory = True,
            doc = "Sphinx build binary",
        ),
        "srcs": attr.label_list(
            allow_files = True,
            doc = "Source files for the documentation build",
        ),
    },
    doc = "Builds Sphinx HTML documentation into a tree artifact at <name>/_build/html.",
)
