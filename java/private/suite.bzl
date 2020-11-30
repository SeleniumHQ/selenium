load(":library.bzl", "java_library")

# Common package prefixes, in the order we want to check for them
_PREFIXES = (".com.", ".org.", ".net.", ".io.")

# By default bazel computes the name of test classes based on the
# standard Maven directory structure, which we may not always use,
# so try to compute the correct package name.
def _package_name():
    pkg = native.package_name().replace("/", ".")

    for prefix in _PREFIXES:
        idx = pkg.find(prefix)
        if idx != -1:
            return pkg[idx + 1:] + "."

    return ""

def _test_class_name(src_file):
    test_name = src_file[:-len(".java")]

    pkg = _package_name()
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

def java_test_suite(
        name,
        srcs,
        size = None,
        test_identifiers = ["Test.java"],
        deps = [],
        tags = [],
        **kwargs):
    suite_name = "".join([p.capitalize() for p in name.replace("-", " ").replace("_", " ").split(" ")])

    pkg = _package_name()
    test_classes = [pkg + src[:-len(".java")].replace("/", ".") for src in srcs if _matches(test_identifiers, src)]

    additional_tags = [] if size == "small" else ["no-sandbox"]

    libargs = {}
    for (key, value) in kwargs.items():
        if key not in _test_attrs:
            libargs.update({key: value})

    # Allow linting of sources we've written
    java_library(
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
