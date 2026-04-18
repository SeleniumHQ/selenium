"""Bazel rule for generating WebDriver BiDi Python modules from CDDL specification."""

def _generate_bidi_impl(ctx):
    """Implementation of the generate_bidi rule."""

    cddl_file = ctx.file.cddl_file
    manifest_file = ctx.file.enhancements_manifest
    generator = ctx.executable.generator
    output_dir = ctx.attr.module_name
    spec_version = ctx.attr.spec_version

    # The generator creates BiDi modules from the CDDL spec
    # Using snake_case naming convention for Python files
    module_names = [
        "browser",
        "browsing_context",
        "common",
        "console",
        "emulation",
        "input",
        "log",
        "network",
        "permissions",
        "script",
        "session",
        "storage",
        "webextension",
    ]

    # Declare all output files
    module_files = [
        ctx.actions.declare_file(output_dir + "/" + name + ".py")
        for name in module_names
    ]
    init_file = ctx.actions.declare_file(output_dir + "/__init__.py")
    py_typed = ctx.actions.declare_file(output_dir + "/py.typed")

    gen_outputs = module_files + [init_file, py_typed]

    # Copy static extra_srcs into the output directory
    extra_outputs = []
    for src in ctx.files.extra_srcs:
        out = ctx.actions.declare_file(output_dir + "/" + src.basename)
        ctx.actions.symlink(output = out, target_file = src)
        extra_outputs.append(out)

    outputs = gen_outputs + extra_outputs

    # Output directory for the generator
    output_base = init_file.dirname

    # Build the command to run the generator
    args = [
        cddl_file.path,
        output_base,
        spec_version,
    ]

    # Add enhancement manifest if provided
    inputs = [cddl_file]
    if manifest_file:
        args.extend(["--enhancements-manifest", manifest_file.path])
        inputs.append(manifest_file)

    ctx.actions.run(
        inputs = inputs,
        outputs = gen_outputs,
        executable = generator,
        arguments = args,
        use_default_shell_env = True,
    )

    return [DefaultInfo(files = depset(outputs))]

generate_bidi = rule(
    implementation = _generate_bidi_impl,
    attrs = {
        "cddl_file": attr.label(
            allow_single_file = [".cddl"],
            mandatory = True,
            doc = "CDDL specification file",
        ),
        "enhancements_manifest": attr.label(
            allow_single_file = [".py"],
            mandatory = False,
            doc = "Enhancement manifest Python file (optional)",
        ),
        "extra_srcs": attr.label_list(
            allow_files = [".py"],
            mandatory = False,
            default = [],
            doc = "Additional static Python files to copy verbatim into the output directory",
        ),
        "generator": attr.label(
            executable = True,
            cfg = "exec",
            mandatory = True,
            doc = "Generator script (e.g., generate_bidi.py)",
        ),
        "module_name": attr.string(
            mandatory = True,
            doc = "Name of the module being generated (e.g., 'selenium/webdriver/common/bidi')",
        ),
        "spec_version": attr.string(
            default = "1.0",
            doc = "WebDriver BiDi specification version",
        ),
    },
    doc = "Generates Python WebDriver BiDi modules from CDDL specification",
)
