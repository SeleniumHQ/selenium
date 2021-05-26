load(":library.bzl", "java_library", "java_test")
load(":selenium_test.bzl", "BROWSERS", "selenium_test")
load(":package.bzl", "package_name")

_test_attrs = [
    "browsers",
    "deploy_manifest_lines",
    "flaky",
    "jvm_flags",
    "launcher",
    "main_class",
    "shard_count",
    "size",
    "test_class",
    "timeout",
    "use_launcher",
    "use_testrunner",
]

def _test_class_name(pkg, src_file):
    test_name = src_file[:-len(".java")]
    return pkg + test_name.replace("/", ".")

def _matches(identifiers, name):
    for identifier in identifiers:
        if name.startswith(identifier) or name.endswith(identifier):
            return True
    return False

def _generate_test_suite(
        name,
        create_test_target,
        size,
        srcs,
        deps,
        tags,
        test_identifiers,
        **kwargs):
    lib_srcs = [src for src in srcs if not _matches(test_identifiers, src)]
    test_srcs = [src for src in srcs if _matches(test_identifiers, src)]

    if len(lib_srcs):
        libargs = {}
        for (key, value) in kwargs.items():
            if key not in _test_attrs:
                libargs.update({key: value})

        java_library(
            name = "%s-support" % name,
            testonly = True,
            srcs = srcs,
            deps = deps,
            **libargs
        )
        deps = deps + [":%s-support" % name]

    additional_tags = [] if size == "small" else ["no-sandbox"]
    suite_targets = []
    pkg = package_name()
    for test in test_srcs:
        test_class = _test_class_name(pkg, test)
        test_name = test_class.rpartition(".")[2]

        suite_targets.append(":%s" % test_name)

        create_test_target(
            name = test_name,
            test_class = test_class,
            size = size,
            srcs = [test],
            deps = deps,
            tags = tags + additional_tags,
            **kwargs
        )

    native.test_suite(
        name = name,
        tags = tags + ["manual"],
        testonly = True,
        tests = suite_targets,
    )

def _create_java_test_target(
        name,
        test_class,
        tags = [],
        **kwargs):
    java_test(
        name = name,
        tags = tags,
        test_class = test_class,
        **kwargs
    )

def java_test_suite(
        name,
        srcs,
        size = None,
        suite_name = None,
        test_identifiers = ["Test.java"],
        deps = [],
        tags = [],
        **kwargs):
    _generate_test_suite(
        name = name,
        create_test_target = _create_java_test_target,
        size = size,
        srcs = srcs,
        deps = deps,
        tags = tags,
        test_identifiers = test_identifiers,
        **kwargs
    )

def _create_selenium_test_target(
        name,
        test_class,
        tags = [],
        **kwargs):
    selenium_test(
        name = name,
        test_class = test_class,
        tags = tags,
        **kwargs
    )

def java_selenium_test_suite(
        name,
        browsers = BROWSERS.keys(),
        srcs = None,
        size = None,
        test_identifiers = ["Test.java"],
        deps = None,
        jvm_flags = [],
        tags = [],
        **kwargs):
    args = {}
    args.update(kwargs)
    args.update({"browsers": browsers})

    _generate_test_suite(
        name = name,
        create_test_target = _create_selenium_test_target,
        size = size,
        srcs = srcs,
        deps = deps,
        tags = tags,
        test_identifiers = test_identifiers,
        **args
    )
