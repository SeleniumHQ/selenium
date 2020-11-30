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
        testonly = True,
        **kwargs
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
                tags = tags,
                visibility = visibility,
            )
            suites.append(test_name)

    native.test_suite(name = name, tests = suites, tags = tags + ["manual"])
