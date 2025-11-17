"""Generate C# partial class with embedded JS resources via a Python tool."""

def _resource_utilities_impl(ctx):
    """Invoke a Python script to generate ResourceUtilities.cs from input files.

    This rule does not inspect file contents itself; it just wires inputs/outputs
    for the generator tool.
    """

    args = ctx.actions.args()
    args.add("--output", ctx.outputs.out)

    for src in ctx.files.srcs:
        args.add("--input")
        # Each --input is "identifier=path"
        name = src.basename.rsplit(".", 1)[0]
        # Starlark strings are not directly iterable into characters, so use
        # a simple replacement-based sanitization: non-identifier characters
        # are replaced with '_'. This is conservative but sufficient.
        ident = name
        ident = ident.replace("-", "_")
        ident = ident.replace(".", "_")
        ident = ident.replace(" ", "_")
        if ident and ident[0].isdigit():
            ident = "_" + ident
        args.add("%s=%s" % (ident, src.path))

    ctx.actions.run(
        inputs = ctx.files.srcs,
        outputs = [ctx.outputs.out],
        executable = ctx.executable._tool,
        arguments = [args],
        mnemonic = "GenerateResourceUtilities",
        progress_message = "Generating C# ResourceUtilities partial class",
    )

resource_utilities = rule(
    implementation = _resource_utilities_impl,
    attrs = {
        "srcs": attr.label_list(allow_files = True),
        "out": attr.output(mandatory = True),
        "_tool": attr.label(
            default = Label("//dotnet/private:generate_resources_tool"),
            executable = True,
            cfg = "exec",
        ),
    },
)