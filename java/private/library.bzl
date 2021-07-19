load("@apple_rules_lint//lint:defs.bzl", "get_lint_config")
load(
    "@rules_java//java:defs.bzl",
    _java_library = "java_library",
    _java_test = "java_test",
)
load(":export.bzl", _java_export = "java_export")
load(":spotbugs.bzl", "spotbugs_test")

def add_lint_tests(name, **kwargs):
    srcs = kwargs.get("srcs", [])

    if len(srcs) == 0:
        return

    tags = kwargs.get("tags", [])

    spotbugs = get_lint_config("java-spotbugs", tags)
    if spotbugs != None:
        spotbugs_test(
            name = "%s-spotbugs" % name,
            config = spotbugs,
            only_output_jars = True,
            deps = [
                ":%s" % name,
            ],
            tags = tags + ["lint", "java-spotbugs"],
            size = "small",
            timeout = "moderate",
        )

def java_export(name, **kwargs):
    add_lint_tests(name, **kwargs)
    _java_export(name = name, **kwargs)

def java_library(name, **kwargs):
    add_lint_tests(name, **kwargs)
    _java_library(name = name, **kwargs)

def java_test(name, **kwargs):
    add_lint_tests(name, **kwargs)
    _java_test(name = name, **kwargs)
