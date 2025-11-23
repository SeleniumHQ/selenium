workspace(name = "selenium")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# rules_closure are not published to BCR.

http_archive(
    name = "io_bazel_rules_closure",
    integrity = "sha256-lJjlc2jvuCuYXbHtQmp2fL8boDmP167WMvw5CGVOGx4=",
    strip_prefix = "rules_closure-0.12.0",
    url = "https://github.com/bazelbuild/rules_closure/archive/refs/tags/0.12.0.tar.gz",
)

load("@io_bazel_rules_closure//closure:repositories.bzl", "rules_closure_dependencies", "rules_closure_toolchains")

rules_closure_dependencies(
    omit_rules_java = True,
    omit_rules_proto = True,
    omit_rules_python = True,
)

rules_closure_toolchains()
