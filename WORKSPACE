workspace(name = "selenium")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "io_bazel_rules_closure",
    sha256 = "bc7b6edd8684953b851300ef7fa122f4e6e9ed52f509a13724e49ffddb9a14eb",
    strip_prefix = "rules_closure-d1110778a2e94bcdac5d5d00044dcb6cd07f1d51",
    urls = [
        "https://github.com/bazelbuild/rules_closure/archive/d1110778a2e94bcdac5d5d00044dcb6cd07f1d51.tar.gz",
    ],
)

load("@io_bazel_rules_closure//closure:defs.bzl", "closure_repositories")

closure_repositories()
