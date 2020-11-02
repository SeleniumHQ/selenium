def _generate_devtools_impl(ctx):
    outdir = ctx.actions.declare_directory("{}".format(ctx.attr.out))

    args = ctx.actions.args()
    args.add_all("-s", [ctx.attr.src.files.to_list()[0]])
    args.add_all("-b", [ctx.attr.browser_protocol.files.to_list()[0]])
    args.add_all("-j", [ctx.attr.js_protocol.files.to_list()[0]])
    args.add_all("-t", [ctx.attr.template.files.to_list()[0]])
    args.add_all("-o", [outdir.path])

    ctx.actions.run(
        executable = ctx.executable.generator,
        progress_message = "Generating {} DevTools Protocol bindings for .NET".format(ctx.attr.out),
        arguments = [args],
        outputs = [
            outdir,
        ],
        inputs = [
            ctx.file.src,
            ctx.file.browser_protocol,
            ctx.file.js_protocol,
            ctx.file.template,
        ],
        use_default_shell_env = True,
    )

    return DefaultInfo(files = depset([
        outdir,
    ]))

generate_devtools = rule(
    implementation = _generate_devtools_impl,
    attrs = {
        "src": attr.label(
            allow_single_file = True,
        ),
        "browser_protocol": attr.label(
            allow_single_file = True,
        ),
        "js_protocol": attr.label(
            allow_single_file = True,
        ),
        "template": attr.label(
            allow_single_file = True,
        ),
        "out": attr.string(
            doc = "File name, without extension, of the built assembly.",
        ),
        "generator": attr.label(
            default = Label("//third_party/dotnet/devtools/src/generator:generator"),
            executable = True,
            cfg = "exec",
        ),
        "deps": attr.label_list(),
    },
)
