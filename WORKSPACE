workspace(name = "selenium")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# rules_closure are not published to BCR.

http_archive(
    name = "io_bazel_rules_closure",
    patch_args = [
        "-p1",
    ],
    patches = [
        "//javascript:rules_closure_shell.patch",
    ],
    sha256 = "d66deed38a0bb20581c15664f0ab62270af5940786855c7adc3087b27168b529",
    strip_prefix = "rules_closure-0.11.0",
    urls = [
        "https://github.com/bazelbuild/rules_closure/archive/0.11.0.tar.gz",
    ],
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
    integrity = "sha256-JLN47ZcAbx9wEr5Jiib4HduZATGLiDgK7oUi/fvotzU=",
    urls = ["https://github.com/bazelbuild/rules_rust/releases/download/0.42.1/rules_rust-v0.42.1.tar.gz"],
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
