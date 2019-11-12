load("@rules_python//python:defs.bzl", "PyInfo", "py_test")

def _stringify(paths):
    return "[%s]" % (", ".join(["\"%s\"" % path for path in paths]))

def _pytest_runner_impl(ctx):
    if len(ctx.attr.srcs) == 0:
        fail("No test files specified.")

    runner = ctx.actions.declare_file(ctx.attr.name)
    ctx.actions.write(
        runner,
        """
if __name__ == "__main__":
    import sys
    import pytest

    args = sys.argv[1:] + ["-ra"] + %s + %s

    sys.exit(pytest.main(args))""" % (_stringify(ctx.attr.args), _stringify([src.path for src in ctx.files.srcs])),
        is_executable = True,
    )

    return [
        DefaultInfo(
            files = depset([runner]),
            executable = runner,
        ),
    ]

_pytest_runner = rule(
    _pytest_runner_impl,
    attrs = {
        "srcs": attr.label_list(
            allow_files = [".py"],
        ),
        "deps": attr.label_list(
            providers = [
                PyInfo,
            ],
        ),
        "args": attr.string_list(
            default = [],
        ),
        "python_version": attr.string(
            values = ["PY2", "PY3"],
            default = "PY3",
        ),
    },
)

def pytest_test(name, srcs, deps = None, args = None, python_version = None, **kwargs):
    runner_target = "%s-runner.py" % name

    _pytest_runner(
        name = runner_target,
        testonly = True,
        srcs = srcs,
        deps = deps,
        args = args,
        python_version = python_version,
    )

    py_test(
        name = name,
        python_version = python_version,
        srcs = srcs + [runner_target],
        deps = deps,
        main = runner_target,
        legacy_create_init = False,
        imports = ["."],
        **kwargs
    )
