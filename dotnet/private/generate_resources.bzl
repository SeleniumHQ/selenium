"""Generate C# partial class with embedded JS resources via a Python tool."""

def _generate_resource_utilities_impl(ctx):
    """Invoke a Python script to generate ResourceUtilities.cs from input files.

    The mapping from C# property name to JS file is provided explicitly via the
    'resources' attribute as a dict: { "PropertyName": label }.
    """

    args = ctx.actions.args()
    args.add("--output", ctx.outputs.out)

    inputs = []
    for target, name in ctx.attr.resources.items():
        files = target.files.to_list()
        if len(files) != 1:
            fail("Each resource label must produce exactly one file, got {} for {}".format(len(files), name))
        src = files[0]
        inputs.append(src)
        args.add("--input")
        args.add("%s=%s" % (name, src.path))

    ctx.actions.run(
        inputs = inputs,
        outputs = [ctx.outputs.out],
        executable = ctx.executable._tool,
        arguments = [args],
        mnemonic = "GenerateResourceUtilities",
        progress_message = "Generating C# ResourceUtilities partial class",
    )

generated_resource_utilities = rule(
    implementation = _generate_resource_utilities_impl,
    attrs = {
        "resources": attr.label_keyed_string_dict(allow_files = True),
        "out": attr.output(mandatory = True),
        "_tool": attr.label(
            default = Label("//dotnet/private:generate_resources_tool"),
            executable = True,
            cfg = "exec",
        ),
    },
)
