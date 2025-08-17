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

# rules_rust fails to compile zstd on Windows when used with Bzlmod
# so we keep it in WORKSPACE for now

http_archive(
    name = "rules_rust",
    integrity = "sha256-eEXiHXSGUH6qD1bdI5KXZ/B04m0wIUeoyM7pmujzbbQ=",
    urls = ["https://github.com/bazelbuild/rules_rust/releases/download/0.55.5/rules_rust-0.55.5.tar.gz"],
)

load("@rules_rust//rust:repositories.bzl", "rules_rust_dependencies", "rust_register_toolchains")

rules_rust_dependencies()

rust_register_toolchains()

load("@rules_rust//crate_universe:defs.bzl", "crates_repository")

crates_repository(
    name = "crates",
    cargo_lockfile = "//rust:Cargo.lock",
    lockfile = "//rust:Cargo.Bazel.lock",
    manifests = ["//rust:Cargo.toml"],
)

load("@crates//:defs.bzl", "crate_repositories")

crate_repositories()
