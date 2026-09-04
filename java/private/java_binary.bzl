load(
    "@contrib_rules_jvm//java:defs.bzl",
    _java_binary = "java_binary",
)

def java_binary(name, deps = [], srcs = [], data = [], resources = [], **kwargs):
    _java_binary(
        name = name,
        deps = deps,
        srcs = srcs,
        data = data,
        resources = resources + ["//:legal-stuff"],
        **kwargs
    )
