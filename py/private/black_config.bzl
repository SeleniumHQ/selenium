BlackConfigInfo = provider(
    fields = {
        "black": "binary: The binary to execute for black",
        "line_length": "`int`: Maximum line length",
        "python_version": "`array of strings`: The versions of Python to target",
    },
)

def black_config_impl(ctx):
    return [
        BlackConfigInfo(
            black = ctx.attr.black,
            line_length = ctx.attr.line_length,
            python_version = ctx.attr.python_version,
        ),
    ]

black_config = rule(
    black_config_impl,
    attrs = {
        "black": attr.label(
            cfg = "exec",
            default = "//py/private:black",
            executable = True,
        ),
        "line_length": attr.int(
            default = 88,
        ),
        "python_version": attr.string_list(),
    },
)
