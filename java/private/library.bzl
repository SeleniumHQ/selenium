load(
    "@contrib_rules_jvm//java:defs.bzl",
    _java_library = "java_library",
    _java_test = "java_test",
)
load(":export.bzl", _java_export = "java_export")

java_export = _java_export
java_library = _java_library
java_test = _java_test
