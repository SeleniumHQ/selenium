workspace(
    name = "selenium",
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "apple_rules_lint",
    sha256 = "7c3cc45a95e3ef6fbc484a4234789a027e11519f454df63cbb963ac499f103f9",
    strip_prefix = "apple_rules_lint-0.3.2",
    url = "https://github.com/apple/apple_rules_lint/archive/refs/tags/0.3.2.tar.gz",
)

load("@apple_rules_lint//lint:repositories.bzl", "lint_deps")

lint_deps()

load("@apple_rules_lint//lint:setup.bzl", "lint_setup")

# Add your linters here.
lint_setup({
    "java-spotbugs": "//java:spotbugs-config",
    "rust-rustfmt": "//rust:enable-rustfmt",
})

http_archive(
    name = "bazel_skylib",
    sha256 = "66ffd9315665bfaafc96b52278f57c7e2dd09f5ede279ea6d39b2be471e7e3aa",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-skylib/releases/download/1.4.2/bazel-skylib-1.4.2.tar.gz",
        "https://github.com/bazelbuild/bazel-skylib/releases/download/1.4.2/bazel-skylib-1.4.2.tar.gz",
    ],
)

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")

bazel_skylib_workspace()

http_archive(
    name = "rules_python",
    sha256 = "5868e73107a8e85d8f323806e60cad7283f34b32163ea6ff1020cf27abef6036",
    strip_prefix = "rules_python-0.25.0",
    url = "https://github.com/bazelbuild/rules_python/releases/download/0.25.0/rules_python-0.25.0.tar.gz",
)

load("@rules_python//python:repositories.bzl", "py_repositories", "python_register_multi_toolchains")

py_repositories()

default_python_version = "3.8"

python_register_multi_toolchains(
    name = "python",
    default_version = default_python_version,
    ignore_root_user_error = True,
    python_versions = [
        "3.8",
        "3.9",
        "3.10",
        "3.11",
    ],
)

load("@python//:pip.bzl", "multi_pip_parse")
load("@python//3.10:defs.bzl", interpreter_3_10 = "interpreter")
load("@python//3.11:defs.bzl", interpreter_3_11 = "interpreter")
load("@python//3.8:defs.bzl", interpreter_3_8 = "interpreter")
load("@python//3.9:defs.bzl", interpreter_3_9 = "interpreter")

multi_pip_parse(
    name = "py_dev_requirements",
    default_version = default_python_version,
    python_interpreter_target = {
        "3.11": interpreter_3_11,
        "3.10": interpreter_3_10,
        "3.9": interpreter_3_9,
        "3.8": interpreter_3_8,
    },
    requirements_lock = {
        "3.11": "//py:requirements_lock.txt",
        "3.10": "//py:requirements_lock.txt",
        "3.9": "//py:requirements_lock.txt",
        "3.8": "//py:requirements_lock.txt",
    },
)

load("@py_dev_requirements//:requirements.bzl", "install_deps")

install_deps()

# This gets us a pre-compiled `protoc`
http_archive(
    name = "rules_proto",
    sha256 = "dc3fb206a2cb3441b485eb1e423165b231235a1ea9b031b4433cf7bc1fa460dd",
    strip_prefix = "rules_proto-5.3.0-21.7",
    urls = [
        "https://github.com/bazelbuild/rules_proto/archive/refs/tags/5.3.0-21.7.tar.gz",
    ],
)

load("@rules_proto//proto:repositories.bzl", "rules_proto_dependencies", "rules_proto_toolchains")

rules_proto_dependencies()

rules_proto_toolchains()

# The go rules are often a dependency of _something_, so loading the version
# we want early
http_archive(
    name = "io_bazel_rules_go",
    sha256 = "6b65cb7917b4d1709f9410ffe00ecf3e160edf674b78c54a894471320862184f",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_go/releases/download/v0.39.0/rules_go-v0.39.0.zip",
        "https://github.com/bazelbuild/rules_go/releases/download/v0.39.0/rules_go-v0.39.0.zip",
    ],
)

load("@io_bazel_rules_go//go:deps.bzl", "go_register_toolchains", "go_rules_dependencies")

go_rules_dependencies()

go_register_toolchains(version = "1.19.3")

http_archive(
    name = "rules_jvm_external",
    patch_args = [
        "-p1",
    ],
    patches = [
        "//java:rules_jvm_external_javadoc.patch",
    ],
    sha256 = "f86fd42a809e1871ca0aabe89db0d440451219c3ce46c58da240c7dcdc00125f",
    strip_prefix = "rules_jvm_external-5.2",
    url = "https://github.com/bazelbuild/rules_jvm_external/releases/download/5.2/rules_jvm_external-5.2.tar.gz",
)

load("@rules_jvm_external//:repositories.bzl", "rules_jvm_external_deps")

rules_jvm_external_deps()

load("@rules_jvm_external//:setup.bzl", "rules_jvm_external_setup")

rules_jvm_external_setup()

http_archive(
    name = "contrib_rules_jvm",
    sha256 = "4d62589dc6a55e74bbe33930b826d593367fc777449a410604b2ad7c6c625ef7",
    strip_prefix = "rules_jvm-0.19.0",
    url = "https://github.com/bazel-contrib/rules_jvm/releases/download/v0.19.0/rules_jvm-v0.19.0.tar.gz",
)

load("@contrib_rules_jvm//:repositories.bzl", "contrib_rules_jvm_deps")

contrib_rules_jvm_deps()

load("@contrib_rules_jvm//:setup.bzl", "contrib_rules_jvm_setup")

contrib_rules_jvm_setup()

load("//java:maven_deps.bzl", "selenium_java_deps")

selenium_java_deps()

load("@maven//:defs.bzl", "pinned_maven_install")

pinned_maven_install()

http_archive(
    name = "rules_dotnet",
    sha256 = "718cb2c3431523aaf3df7feed0e997e4ded002abbf56ac37d9c0536a812d6276",
    strip_prefix = "rules_dotnet-0.12.0",
    url = "https://github.com/bazelbuild/rules_dotnet/releases/download/v0.12.0/rules_dotnet-v0.12.0.tar.gz",
)

load(
    "@rules_dotnet//dotnet:repositories.bzl",
    "dotnet_register_toolchains",
    "rules_dotnet_dependencies",
)

rules_dotnet_dependencies()

dotnet_register_toolchains("dotnet", "7.0.400")

load("@rules_dotnet//dotnet:rules_dotnet_nuget_packages.bzl", "rules_dotnet_nuget_packages")

rules_dotnet_nuget_packages()

load("@rules_dotnet//dotnet:paket2bazel_dependencies.bzl", "paket2bazel_dependencies")

paket2bazel_dependencies()

load("//dotnet:paket.bzl", "paket")

paket()

http_archive(
    name = "rules_rust",
    sha256 = "50ec4b84a7ec5370f5882d52f4a1e6b8a75de2f8dcc0a4403747b69b2c4ef5b1",
    urls = ["https://github.com/bazelbuild/rules_rust/releases/download/0.23.0/rules_rust-v0.23.0.tar.gz"],
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

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "709cc0dcb51cf9028dd57c268066e5bc8f03a119ded410a13b5c3925d6e43c48",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.4/rules_nodejs-5.8.4.tar.gz"],
)

load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")

build_bazel_rules_nodejs_dependencies()

load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "npm_install")

node_repositories(
    node_version = "18.17.0",
)

npm_install(
    name = "npm",
    package_json = "//:package.json",
    package_lock_json = "//:package-lock.json",
    symlink_node_modules = False,
)

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

rules_closure_dependencies()

rules_closure_toolchains()

http_archive(
    name = "rules_pkg",
    sha256 = "8f9ee2dc10c1ae514ee599a8b42ed99fa262b757058f65ad3c384289ff70c4b8",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_pkg/releases/download/0.9.1/rules_pkg-0.9.1.tar.gz",
        "https://github.com/bazelbuild/rules_pkg/releases/download/0.9.1/rules_pkg-0.9.1.tar.gz",
    ],
)

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")

rules_pkg_dependencies()

http_archive(
    name = "rules_oci",
    sha256 = "db57efd706f01eb3ce771468366baa1614b5b25f4cce99757e2b8d942155b8ec",
    strip_prefix = "rules_oci-1.0.0",
    url = "https://github.com/bazel-contrib/rules_oci/releases/download/v1.0.0/rules_oci-v1.0.0.tar.gz",
)

load("@rules_oci//oci:dependencies.bzl", "rules_oci_dependencies")

rules_oci_dependencies()

load("@rules_oci//oci:repositories.bzl", "LATEST_CRANE_VERSION", "oci_register_toolchains")

oci_register_toolchains(
    name = "oci",
    crane_version = LATEST_CRANE_VERSION,
    # Uncommenting the zot toolchain will cause it to be used instead of crane for some tasks.
    # Note that it does not support docker-format images.
    # zot_version = LATEST_ZOT_VERSION,
)

load("@rules_oci//oci:pull.bzl", "oci_pull")

# Examine https://console.cloud.google.com/gcr/images/distroless/GLOBAL/java?gcrImageListsize=30 to find
# the latest version when updating
oci_pull(
    name = "java_image_base",
    digest = "sha256:161a1d97d592b3f1919801578c3a47c8e932071168a96267698f4b669c24c76d",
    image = "gcr.io/distroless/java17",
)

oci_pull(
    name = "firefox_standalone",
    digest = "sha256:b6d8279268b3183d0d33e667e82fec1824298902f77718764076de763673124f",
    registry = "index.docker.io",
    repository = "selenium/standalone-firefox",
)

oci_pull(
    name = "chrome_standalone",
    digest = "sha256:1b809a961a0a77787a7cccac74ddc5570b7e89747f925b8469ddb9a6624d4ece",
    registry = "index.docker.io",
    repository = "selenium/standalone-chrome",
)

load("//common:selenium_manager.bzl", "selenium_manager")

selenium_manager()

load("//common:repositories.bzl", "pin_browsers")

pin_browsers()

http_archive(
    name = "rules_ruby",
    sha256 = "e3495d0129222572654cc5dd5c72c6c997513d65fb8649f43a860ab15334a1c2",
    strip_prefix = "rules_ruby-0.4.1",
    url = "https://github.com/bazel-contrib/rules_ruby/releases/download/v0.4.1/rules_ruby-v0.4.1.tar.gz",
)

load(
    "@rules_ruby//ruby:deps.bzl",
    "rb_bundle",
    "rb_register_toolchains",
)

rb_register_toolchains(version_file = "//:rb/.ruby-version")

rb_bundle(
    name = "bundle",
    srcs = [
        "//:rb/lib/selenium/devtools/version.rb",
        "//:rb/lib/selenium/webdriver/version.rb",
        "//:rb/selenium-devtools.gemspec",
        "//:rb/selenium-webdriver.gemspec",
    ],
    gemfile = "//:rb/Gemfile",
)

http_archive(
    name = "com_github_bazelbuild_buildtools",
    sha256 = "65391537d1ef528bf772ae25d2c163bd5cee6a929b06cad985e0734f1a12610b",
    strip_prefix = "buildtools-6.1.2",
    urls = [
        "https://github.com/bazelbuild/buildtools/archive/refs/tags/v6.1.2.zip",
    ],
)
