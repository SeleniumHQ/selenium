load("//common/private:selenium_test.bzl", "BROWSERS", "DEFAULT_BROWSER", "selenium_test")
load(":package.bzl", "package_name")

def _test_class_name(src_file):
    test_name = src_file[:-len(".java")]

    pkg = package_name()
    if pkg != None:
        return pkg + "." + test_name.replace("/", ".")
    return test_name.replace("/", ".")

def _write_suite_impl(ctx):
    src_file = ctx.actions.declare_file("%s.java" % ctx.attr.suite_name)

    class_names = [t + ".class" for t in ctx.attr.test_classes]

    contents = """
package %s;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
%s
})
public class %s {
}
""" % (ctx.attr.package, ",\n".join(class_names), ctx.attr.suite_name)
    ctx.actions.write(src_file, contents)

    return [
        DefaultInfo(
            files = depset([src_file]),
        )
    ]

_write_suite = rule(
    _write_suite_impl,
    attrs = {
        "package": attr.string(),
        "suite_name": attr.string(),
        "test_classes": attr.string_list()
    },
)

def _matches(identifiers, name):
    for identifier in identifiers:
        if name.startswith(identifier) or name.endswith(identifier):
            return True
    return False

_test_attrs = [
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

def _suite_name(name, suite_name):
    if not suite_name:
        return "".join([p.capitalize() for p in name.replace("-", " ").replace("_", " ").split(" ")])
    return suite_name

def _generate_common_targets(
        name,
        size,
        suite_name,
        srcs,
        deps,
        tags,
        test_identifiers,
        **kwargs):
    suite_name = _suite_name(name, suite_name)

    pkg = package_name()
    test_classes = [pkg + src[:-len(".java")].replace("/", ".") for src in srcs if _matches(test_identifiers, src)]

    libargs = {}
    for (key, value) in kwargs.items():
        if key not in _test_attrs:
            libargs.update({key: value})

    # Allow linting of sources we've written
    native.java_library(
        name = "%s-suite-lib" % name,
        testonly = True,
        srcs = srcs,
        deps = deps,
        tags = tags,
        **libargs,
    )

    _write_suite(
        name = "%s-suite-src" % name,
        package = pkg[:-1],
        suite_name = suite_name,
        test_classes = test_classes,
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
    suite_name = _suite_name(name, suite_name)
    pkg = package_name()
    test_classes = [pkg + src[:-len(".java")].replace("/", ".") for src in srcs if _matches(test_identifiers, src)]
    additional_tags = [] if size == "small" else ["no-sandbox"]

    _generate_common_targets(
        name,
        size,
        suite_name,
        srcs,
        deps,
        tags,
        test_identifiers,
        **kwargs,
    )

    # Skip linting for the generated test suite
    native.java_test(
        name = name,
        test_class = pkg + suite_name,
        size = size,
        srcs = [":%s-suite-src" % name],
        deps = deps + ["%s-suite-lib" % name],
        shard_count = len(test_classes),
        tags = tags + additional_tags,
        **kwargs,
    )

def java_selenium_test_suite(
        name,
        browsers = BROWSERS.keys(),
        srcs = None,
        test_identifiers = ["Test.java"],
        deps = None,
        data = [],
        jvm_flags = [],
        tags = [],
        **kwargs):
    suite_name = _suite_name(name, None)
    pkg = package_name()
    test_classes = [pkg + src[:-len(".java")].replace("/", ".") for src in srcs if _matches(test_identifiers, src)]

    amended_flags = {k: v for (k, v) in kwargs.items() if k != "size"}

    _generate_common_targets(
        name,
        "large",
        suite_name,
        srcs,
        deps,
        tags,
        test_identifiers,
        **amended_flags
    )

    selenium_test(
        name = name,
        test_class = pkg + suite_name,
        browsers = browsers,
        size = "large",
        srcs = [":%s-suite-src" % name],
        deps = deps + ["%s-suite-lib" % name],
        data = data,
        jvm_flags = jvm_flags,
        tags = tags
    )
