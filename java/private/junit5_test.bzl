load("@contrib_rules_jvm//java:defs.bzl", "java_test")
load("@contrib_rules_jvm//java/private:package.bzl", "get_package_name")

def junit5_test(
        name,
        test_class = None,
        runtime_deps = [],
        package_prefixes = [],
        jvm_flags = [],
        **kwargs):
    if test_class:
        clazz = test_class
    else:
        clazz = get_package_name(package_prefixes) + name

    java_test(
        name = name,
        main_class = "com.github.bazel_contrib.contrib_rules_jvm.junit5.JUnit5Runner",
        test_class = clazz,
        runtime_deps = runtime_deps + [
            "@contrib_rules_jvm//java/src/com/github/bazel_contrib/contrib_rules_jvm/junit5",
        ],
        jvm_flags = jvm_flags + ["-Djava.security.manager=allow"],
        **kwargs
    )

    return name
