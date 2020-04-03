load("//common:defs.bzl", "selenium_test")

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
        browsers = None,
        deps = [],
        tags = [],
        visibility = None,
        **kwargs):
    native.java_library(
        name = "%s-base-lib" % name,
        srcs = srcs,
        deps = deps,
        **kwargs,
    )

    suites = []
    for src in srcs:
        if src.endswith("Test.java"):
            test_class = _test_class_name(src)
            test_name = test_class.rpartition(".")[2]

            selenium_test(
                name = test_name,
                browsers = browsers,
                size = size,
                test_class = test_class,
                runtime_deps = [
                    ":%s-base-lib" % name,
                ],
                visibility = visibility,
            )
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
