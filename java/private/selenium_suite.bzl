load("//common/private:selenium_test.bzl", "BROWSERS", "DEFAULT_BROWSER", "selenium_test")
load(":package.bzl", "package_name")
load(":suite.bzl", "java_test_suite")

def java_selenium_test_suite(
        name,
        browsers = BROWSERS.keys(),
        srcs = None,
        deps = None,
        data = [],
        jvm_flags = [],
        tags = [],
        **kwargs):
    suite_name = "".join([p.capitalize() for p in name.replace("-", " ").replace("_", " ").split(" ")])

    # Build a single suite that everyone can use
    java_test_suite(
        name = "%s-suite" % name,
        srcs = srcs,
        suite_name = suite_name,
        data = data,
        deps = deps,
        tags = tags + ["manual"],
        **kwargs,
    )

    suite_class = package_name() + suite_name

    selenium_test(
        name = name,
        test_class = suite_class,
        browsers = browsers,
        size = "large",
        runtime_deps = deps + [
            ":%s-suite" % name,
            ":%s-suite-suite-lib" % name,
        ],
        shard_count = len(srcs),
    )
