load("@apple_rules_lint//lint:defs.bzl", "get_lint_config")
load(
    "@contrib_rules_jvm//java:defs.bzl",
    "spotbugs_test",
    _java_library = "java_library",
    _java_test = "java_test",
)
load(":export.bzl", _java_export = "java_export")

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

java_export = _java_export
java_library = _java_library
java_test = _java_test
