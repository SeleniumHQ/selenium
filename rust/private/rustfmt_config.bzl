RustfmtConfig = provider()

def _rust_config_impl(ctx):
    return [
        RustfmtConfig(),
    ]

rustfmt_config = rule(
    _rust_config_impl,
)
