SpotBugsInfo = provider(
    fields = {
        "effort": "Effort can be min, less, default, more or max.",
        "exclude_filter": "Optional filter file to use",
        "fail_on_warning": "Whether to fail on warning, or just create a report.",
    },
)

def _spotbugs_config_impl(ctx):
    return [
        SpotBugsInfo(
            effort = ctx.attr.effort,
            exclude_filter = ctx.file.exclude_filter,
            fail_on_warning = ctx.attr.fail_on_warning,
        ),
    ]

spotbugs_config = rule(
    _spotbugs_config_impl,
    attrs = {
        "effort": attr.string(
            doc = "Effort can be min, less, default, more or max. Defaults to default",
            values = ["min", "less", "default", "more", "max"],
            default = "default",
        ),
        "exclude_filter": attr.label(
            doc = "Report all bug instances except those matching the filter specified by this filter file",
            allow_single_file = True,
        ),
        "fail_on_warning": attr.bool(
            doc = "Whether to fail on warning, or just create a report. Defaults to True",
            default = True,
        ),
    },
    provides = [
        SpotBugsInfo,
    ],
)
