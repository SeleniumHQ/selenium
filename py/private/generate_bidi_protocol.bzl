"""Bazel rule generating the internal ``_bidi`` protocol layer from the shared BiDi schema.

Unlike ``generate_bidi`` (which parses CDDL for ``common/bidi``), this consumes the
already-projected, binding-neutral schema JSON and emits the generated domain modules.
The hand-written runtime (``serialization``/``transport``/``domain``) is not produced here.
"""

# Generated domain modules, snake_case (one per BiDi domain in the schema), plus the
# domain-less error classes. The package ``__init__.py`` is hand-written and checked
# in, so it is not generated here.
_MODULES = [
    "errors",
    "bluetooth",
    "browser",
    "browsing_context",
    "emulation",
    "input",
    "log",
    "network",
    "permissions",
    "script",
    "session",
    "speculation",
    "storage",
    "user_agent_client_hints",
    "web_extension",
]

def _generate_bidi_protocol_impl(ctx):
    outputs = [ctx.actions.declare_file(ctx.attr.package + "/" + name + ".py") for name in _MODULES]

    ctx.actions.run(
        inputs = [ctx.file.schema],
        outputs = outputs,
        executable = ctx.executable.generator,
        # The generator writes one file per domain into the output dir. Passing the
        # declared module list lets it fail loudly if the schema's domains drift from
        # _MODULES, instead of bazel reporting an opaque missing/undeclared output.
        arguments = [ctx.file.schema.path, outputs[-1].dirname, "--modules", ",".join(_MODULES)],
        use_default_shell_env = True,
    )

    return [DefaultInfo(files = depset(outputs))]

generate_bidi_protocol = rule(
    implementation = _generate_bidi_protocol_impl,
    attrs = {
        "schema": attr.label(
            allow_single_file = [".json"],
            mandatory = True,
            doc = "Projected binding-neutral BiDi schema JSON",
        ),
        "generator": attr.label(
            executable = True,
            cfg = "exec",
            mandatory = True,
            doc = "The generate_bidi_protocol.py generator binary",
        ),
        "package": attr.string(
            mandatory = True,
            doc = "Output package path, e.g. 'selenium/webdriver/common/_bidi'",
        ),
    },
    doc = "Generates the internal _bidi protocol modules from the shared BiDi schema",
)
