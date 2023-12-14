load("@contrib_rules_jvm//java/private:create_jvm_test_suite.bzl", "create_jvm_test_suite")
load("@contrib_rules_jvm//java/private:java_test_suite_shared_constants.bzl", "DEFAULT_TEST_SUFFIXES")
load("@contrib_rules_jvm//java/private:library.bzl", "java_library")
load(":junit5_test.bzl", "junit5_test")

def java_test_suite(
        name,
        srcs,
        runner = "junit5",
        test_suffixes = DEFAULT_TEST_SUFFIXES,
        package = None,
        deps = None,
        runtime_deps = [],
        size = None,
        **kwargs):
    create_jvm_test_suite(
        name,
        srcs = srcs,
        test_suffixes = test_suffixes,
        package = package,
        define_library = java_library,
        # We want to use our own test runner
        define_test = junit5_test,
        runner = runner,
        deps = deps,
        runtime_deps = runtime_deps,
        size = size,
        **kwargs
    )
