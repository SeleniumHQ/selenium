_PREFIXES = ("com", "io", "net", "org")

_BROWSERS = {
    "chrome": {
        "jvm_flags": ["-Dselenium.browser=chrome"],
        "deps": ["//java/client/src/org/openqa/selenium/chrome"],
    },
    "edge": {
        "jvm_flags": ["-Dselenium.browser=edge"],
        "deps": ["//java/client/src/org/openqa/selenium/edge"],
    },
    "firefox": {
        "jvm_flags": ["-Dselenium.browser=ff"],
        "deps": ["//java/client/src/org/openqa/selenium/firefox"],
    },
    "ie": {
        "jvm_flags": ["-Dselenium.browser=ie", "-Dselenium.browser.native_events=true"],
        "deps": ["//java/client/src/org/openqa/selenium/ie"],
    },
    "safari": {
        "jvm_flags": ["-Dselenium.browser=safari"],
        "deps": ["//java/client/src/org/openqa/selenium/safari"],
    },
}

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

def gen_java_tests(size, srcs = [], tags = [], deps = [], **kwargs):
    key = size + str(srcs) + str(tags) + str(deps) + native.package_name()
    lib_name = "%s" % hash(key)

    native.java_library(
        name = lib_name,
        srcs = srcs,
        deps = deps,
    )

    deps.append(":%s" % lib_name)

    actual_tags = []
    actual_tags.extend(tags)
    if "small" != size:
        actual_tags.append("no-sandbox")

    for src in srcs:
        native.java_test(
            name = _shortName(src),
            size = size,
            test_class = _className(src),
            tags = actual_tags,
            runtime_deps = deps,
            **kwargs
        )

def gen_java_selenium_tests(srcs = [], deps = [], drivers = _BROWSERS.keys(), tags = [], **kwargs):
    key = str(srcs) + str(tags) + str(deps) + str(drivers) + native.package_name()
    lib_name = "%s" % hash(key)

    native.java_library(
        name = lib_name,
        srcs = srcs,
        deps = deps,
    )

    deps.append(":%s" % lib_name)
    base_deps = {}
    for dep in deps:
        base_deps[dep] = 1

    for driver in drivers:
        actual_tags = []
        actual_tags.extend(tags)
        actual_tags.append("no-sandbox")
        actual_tags.append(driver)

        info = _BROWSERS[driver]

        actual_deps = {}
        actual_deps.update(base_deps)
        for dep in info["deps"]:
            actual_deps[dep] = 1

        for src in srcs:
            native.java_test(
                name = "%s-%s" % (_shortName(src), driver),
                size = "large",
                test_class = _className(src),
                jvm_flags = info["jvm_flags"],
                tags = actual_tags,
                runtime_deps = actual_deps.keys(),
                **kwargs
            )
