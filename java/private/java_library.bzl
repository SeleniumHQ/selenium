load(
    "@contrib_rules_jvm//java:defs.bzl",
    _java_library = "java_library"
)

def java_library(
        name,
        deps = [],
        srcs = [],
        exports = [],
        tags = [],
        visibility = None,
        javacopts = [],
        plugins = [],
        **kwargs):

    # NullAway configuration
    nullaway_plugins = select({
        "//java:use_nullaway_level_warn": [
            "//java:nullaway"
        ],
        "//java:use_nullaway_level_error": [
            "//java:nullaway"
        ],
        "//conditions:default": [],
    })
    nullaway_javacopts = select({
        "//java:use_nullaway_level_warn": [
            '-Xep:NullAway:WARN',
            '-XepOpt:NullAway:AnnotatedPackages=org.openqa.selenium',
            '-XepOpt:NullAway:JSpecifyMode=true'
        ],
        "//java:use_nullaway_level_error": [
            '-Xep:NullAway:ERROR',
            '-XepOpt:NullAway:AnnotatedPackages=org.openqa.selenium',
            '-XepOpt:NullAway:JSpecifyMode=true'
        ],
        "//conditions:default": [],
    })

    # global place for NullAway plugin use
    _java_library(
        name = name,
        deps = deps,
        srcs = srcs,
        exports = exports,
        tags = tags,
        visibility = visibility,
        plugins = plugins + nullaway_plugins,
        javacopts = javacopts + nullaway_javacopts,
        **kwargs
    )
