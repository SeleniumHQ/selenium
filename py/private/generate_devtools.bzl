def _generate_devtools_impl(ctx):
    outdir = ctx.actions.declare_directory(ctx.attr.outdir)

    args = ctx.actions.args()
    args.add(ctx.file.browser_protocol)
    args.add(ctx.file.js_protocol)
    args.add(outdir.path)

    ctx.actions.run(
        executable = ctx.executable.generator,
        progress_message = "Generating {} DevTools Protocol bindings for Python".format(ctx.attr.protocol_version),
        arguments = [args],
        outputs = [
            outdir,
        ],
        inputs = [
            ctx.file.browser_protocol,
            ctx.file.js_protocol,
        ],
        use_default_shell_env = True,
    )

    return DefaultInfo(
        files = depset([outdir]),
        runfiles = ctx.runfiles(files = [outdir]),
    )

generate_devtools = rule(
    implementation = _generate_devtools_impl,
    attrs = {
        "protocol_version": attr.string(
            mandatory = True,
            default = "",
        ),
        "browser_protocol": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
        "js_protocol": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
        "outdir": attr.string(),
        "generator": attr.label(
            executable = True,
            cfg = "exec",
        ),
        "deps": attr.label_list(),
    },
)

def _generate_latest_impl(ctx):
    versions = ctx.attr.browser_versions
    latest = "v%s" % max([int(v[1:]) for v in versions])
    output_file = ctx.actions.declare_file("selenium/webdriver/common/devtools/latest/__init__.py")
    ctx.actions.write(
        output = output_file,
        content = "from ..%s import *\n" % latest,
    )
    return [DefaultInfo(
        files = depset([output_file]),
        runfiles = ctx.runfiles(files = [output_file]),
    )]

generate_devtools_latest = rule(
    implementation = _generate_latest_impl,
    attrs = {
        "browser_versions": attr.string_list(mandatory = True),
    },
)
