load("@apple_rules_lint//lint:defs.bzl", "get_lint_config")
load(
    "@rules_rust//rust:defs.bzl",
    "rustfmt_test",
    _rust_binary = "rust_binary",
    _rust_library = "rust_library",
    _rust_test = "rust_test",
    _rust_test_suite = "rust_test_suite",
)

def _wrap_with_fmt_test(name, tags):
    config = get_lint_config("rust-rustfmt", tags)
    if config:
        rustfmt_test(
            name = "%s-fmt" % name,
            targets = [
                ":%s" % name,
            ],
            tags = [
                "lint",
                "rust-rustfmt",
                "rustfmt",
            ],
        )

def rust_library(name, **kwargs):
    _rust_library(name = name, **kwargs)
    _wrap_with_fmt_test(name, kwargs.get("tags", []))

def rust_binary(name, **kwargs):
    _rust_binary(name = name, **kwargs)
    _wrap_with_fmt_test(name, kwargs.get("tags", []))

def rust_test(name, **kwargs):
    _rust_test(name = name, **kwargs)
    _wrap_with_fmt_test(name, kwargs.get("tags", []))

def rust_test_suite(name, srcs = [], **kwargs):
    _rust_test_suite(name = name, srcs = srcs, **kwargs)
    for src in srcs:
        if not src.endswith(".rs"):
            fail("srcs should have `.rs` extensions")

        # Prefixed with `name` to allow parameterization with macros
        # The test name should not end with `.rs`
        test_name = name + "_" + src[:-3]
        _wrap_with_fmt_test(test_name, kwargs.get("tags", []))
