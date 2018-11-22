_PREFIXES = ("com", "io", "net", "org")

def _contains(list, value):
    for v in list:
        if v == value:
            return True
    return False

def _shortName(file):
    base = file.rpartition("/")[-1]
    return base.rpartition(".")[0]

# We assume that package name matches directory structure, which may not
# actually be true, but is for Selenium.
def _className(file):
    name = file.rpartition(".")[0]
    className = native.package_name() + "/" + name

    segments = className.split("/")
    idx = len(segments) - 1
    for i, segment in enumerate(segments):
        if _contains(_PREFIXES, segment):
            idx = i
            break
    return ".".join(segments[idx:])

def _impl(ctx):
    for src in ctx.files.srcs:
        test = native.java_test(
            name = _shortName(src),
            test_class = _className(src),
            srcs = ctx.attr.srcs,
            size = ctx.attr.size,
            deps = ctx.attr.deps,
        )

def gen_java_tests(srcs = [], deps = [], **kwargs):
    native.java_library(
        name = "%s-lib" % native.package_name(),
        srcs = srcs,
        deps = deps,
    )

    deps.append(":%s-lib" % native.package_name())

    for src in srcs:
        native.java_test(
            name = _shortName(src),
            test_class = _className(src),
            runtime_deps = deps,
            **kwargs
        )
