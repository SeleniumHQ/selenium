load("@apple_rules_lint//lint:defs.bzl", "get_lint_config")
load("@rules_python//python:defs.bzl", _py_binary = "py_binary", _py_library = "py_library", _py_test = "py_test")
load(":black_test.bzl", "black_test")

def create_lint_tests(name, **kwargs):
    config = get_lint_config("py-black", kwargs.get("tags", []))
    if config:
        black_test(
            name = "%s-black" % name,
            srcs = kwargs.get("srcs", []),
            config = config,
            tags = kwargs.get("tags", []) + [
                "lint",
                "black",
                "py-black",
            ],
        )

def _add_lint_tests(actual, name, **kwargs):
    actual(
        name = name,
        **kwargs
    )

    create_lint_tests(name, **kwargs)

def py_binary(name, **kwargs):
    _add_lint_tests(_py_binary, name, **kwargs)

def py_library(name, **kwargs):
    _add_lint_tests(_py_library, name, **kwargs)

def py_test(name, **kwargs):
    _add_lint_tests(_py_test, name, **kwargs)
