load("@bazel_tools//tools/jdk:toolchain_utils.bzl", "find_java_runtime_toolchain", "find_java_toolchain")

_DEFAULT_BROWSER = "firefox"

_COMMON_TAGS = [
    "browser-test",
    "no-sandbox",
    "requires-network",
]

_BROWSERS = {
    "chrome": {
        "deps": ["//java/client/src/org/openqa/selenium/chrome"],
        "jvm_flags": ["-Dselenium.browser=chrome"],
        "tags": _COMMON_TAGS + ["chrome"],
    },
    "edge": {
        "deps": ["//java/client/src/org/openqa/selenium/edge"],
        "jvm_flags": ["-Dselenium.browser=edge"],
        "tags": _COMMON_TAGS + ["edge"],
    },
    "firefox": {
        "deps": ["//java/client/src/org/openqa/selenium/firefox"],
        "jvm_flags": ["-Dselenium.browser=ff"],
        "tags": _COMMON_TAGS + ["firefox"],
    },
    "ie": {
        "deps": ["//java/client/src/org/openqa/selenium/ie"],
        "jvm_flags": ["-Dselenium.browser=ie"] +
            select({
                "//common:windows": ["-Dselenium.skiptest=false"],
                "//conditions:default": ["-Dselenium.skiptest=true"],
            }),
        "tags": _COMMON_TAGS + ["exclusive", "ie"],
    },
    "safari": {
        "deps": ["//java/client/src/org/openqa/selenium/safari"],
        "jvm_flags": ["-Dselenium.browser=safari"] +
            select({
                "//common:macos": ["-Dselenium.skiptest=false"],
                "//conditions:default": ["-Dselenium.skiptest=true"],
            }),
        "tags": _COMMON_TAGS + ["exclusive", "safari"],
    },
}

def _package_name():
    # By default bazel computes the name of test classes based on the
    # standard Maven directory structure, which we don't use in
    # Selenium, so try to compute the correct package name.
    pkg = native.package_name()
    idx = pkg.find("/com/")
    if idx == -1:
        idx = pkg.find("/org/")
    if idx != -1:
        pkg = pkg[idx + 1:].replace("/", ".")
    else:
        pkg = None
    return pkg

def _test_class_name(src_file):
    test_name = src_file[:-len(".java")]

    pkg = _package_name()
    if pkg != None:
        return pkg + "." + test_name.replace("/", ".")
    return test_name.replace("/", ".")

def java_selenium_test_suite(
        name,
        srcs,
        size = "medium",
        browsers = ["chrome", "edge", "firefox", "ie", "safari"],
        deps = [],
        tags = [],
        visibility = None,
        **kwargs):
    if len(browsers) == 0:
        fail("At least one browser must be specified.")

    native.java_library(
        name = "%s-base-lib" % name,
        srcs = srcs,
        deps = deps,
        **kwargs,
    )

    default_browser = _DEFAULT_BROWSER if _DEFAULT_BROWSER in browsers else browsers[0]

    suites = []
    for src in srcs:
        if src.endswith("Test.java"):
            tests = []

            test_class = _test_class_name(src)
            test_name = test_class.rpartition(".")[2]

            for browser in browsers:
                if not browser in _BROWSERS:
                    fail("Unrecognized browser: " + browser)

                test = test_name if browser == default_browser else "%s-%s" % (test_name, browser)

                native.java_test(
                    name = test,
                    test_class = test_class,
                    size = size,
                    jvm_flags = _BROWSERS[browser]["jvm_flags"],
                    tags = tags + _BROWSERS[browser]["tags"],
                    runtime_deps = [":%s-base-lib" % name],
                    visibility = visibility,
                )
                tests.append(test)
            native.test_suite(name = "%s-all" % test_name, tests = tests, tags = ["manual"])
            suites.append(test_name)

    native.test_suite(name = name, tests = suites, tags = tags + ["manual"])

def java_test_suite(
        name,
        srcs,
        size = None,
        test_identifiers = ["Test.java"],
        tags = [],
        visibility = None,
        **kwargs):
    # By default bazel computes the name of test classes based on the
    # standard Maven directory structure, which we don't use in
    # Selenium, so try to compute the correct package name.
    pkg = _package_name()

    tests = []

    actual_tags = []
    actual_tags.extend(tags)
    if "small" != size:
        actual_tags.append("no-sandbox")

    for src in srcs:
        test_name = None

        (prefix, ignored, file_name) = src.rpartition("/")
        if len(prefix):
          prefix = prefix + "/"

        for identifier in test_identifiers:
            if file_name.startswith(identifier) or src.endswith(identifier):
                test_name = prefix + file_name[:-len(".java")]

        if test_name:
            test_class = _test_class_name(src)

            if test_name in native.existing_rules():
                test_name = "%s-%s" % (name, test_name)
            tests += [test_name]

            native.java_test(
                name = test_name,
                srcs = [src],
                size = size,
                test_class = test_class,
                tags = actual_tags,
                visibility = ["//visibility:private"],
                **kwargs
            )

    native.test_suite(
        name = "%s-suite" % name,
        tests = tests,
        tags = ["manual"] + tags,
        visibility = visibility,
    )
