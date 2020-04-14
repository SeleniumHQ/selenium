workspace(
    name = "selenium",
    managed_directories = {
        # Share the node_modules directory between Bazel and other tooling
        "@npm": ["node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "platforms",
    sha256 = "66184688debeeefcc2a16a2f80b03f514deac8346fe888fb7e691a52c023dd88",
    strip_prefix = "platforms-46993efdd33b73649796c5fc5c9efb193ae19d51",
    urls = [
      "https://github.com/bazelbuild/platforms/archive/46993efdd33b73649796c5fc5c9efb193ae19d51.zip",
    ],
)

http_archive(
    name = "bazel_toolchains",
    sha256 = "239a1a673861eabf988e9804f45da3b94da28d1aff05c373b013193c315d9d9e",
    strip_prefix = "bazel-toolchains-3.0.1",
    urls = [
        "https://github.com/bazelbuild/bazel-toolchains/releases/download/3.0.1/bazel-toolchains-3.0.1.tar.gz",
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-toolchains/archive/3.0.1.tar.gz",
    ],
)

load("@bazel_toolchains//rules:rbe_repo.bzl", "rbe_autoconfig")

rbe_autoconfig(name = "rbe_default")

http_archive(
    name = "rules_jvm_external",
    sha256 = "82262ff4223c5fda6fb7ff8bd63db8131b51b413d26eb49e3131037e79e324af",
    strip_prefix = "rules_jvm_external-3.2",
    url = "https://github.com/bazelbuild/rules_jvm_external/archive/3.2.zip",
)

load("//java:maven_deps.bzl", "selenium_java_deps")

selenium_java_deps()

load("@maven//:defs.bzl", "pinned_maven_install")

pinned_maven_install()

http_archive(
    name = "io_bazel_rules_closure",
    sha256 = "2e95ba060acd74f3662547a38814ffff60317be047b7168d25498aea52f3e732",
    strip_prefix = "rules_closure-b3d4ec3879620edcadd3422b161cebb37c59b6c5",
    urls = [
        "https://github.com/bazelbuild/rules_closure/archive/b3d4ec3879620edcadd3422b161cebb37c59b6c5.tar.gz",
    ],
)

load("@io_bazel_rules_closure//closure:defs.bzl", "closure_repositories")

closure_repositories()

http_archive(
    name = "d2l_rules_csharp",
    sha256 = "616caa8a0bcfc622862790198efc6cdeacb0f3c115591b9eded66bffb7f217fd",
    strip_prefix = "rules_csharp-5531b47d7d0f0880a4bcc4c02d68b75845b2dce5",
    urls = [
        "https://github.com/Brightspace/rules_csharp/archive/5531b47d7d0f0880a4bcc4c02d68b75845b2dce5.tar.gz",
    ],
)

load("//dotnet:workspace.bzl", "selenium_register_dotnet")

selenium_register_dotnet()

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "d0c4bb8b902c1658f42eb5563809c70a06e46015d64057d25560b0eb4bdc9007",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/1.5.0/rules_nodejs-1.5.0.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "npm_install")

npm_install(
    name = "npm",
    package_json = "//:package.json",
    package_lock_json = "//:package-lock.json",
)

load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")

install_bazel_dependencies()

http_archive(
    name = "rules_python",
    sha256 = "ddb2e1298684defde2f5e466d96e572119f30f9e2a901a7a81474fd4fa9f6d52",
    strip_prefix = "rules_python-dd7f9c5f01bafbfea08c44092b6b0c8fc8fcb77f",
    urls = [
        "https://github.com/bazelbuild/rules_python/archive/dd7f9c5f01bafbfea08c44092b6b0c8fc8fcb77f.zip",
    ],
    patches = [
        "//py:rules_python_any_version_wheel.patch"
    ],
)

# This call should always be present.
load("@rules_python//python:repositories.bzl", "py_repositories")

py_repositories()

# This one is only needed if you're using the packaging rules.
load("@rules_python//python:pip.bzl", "pip_repositories")

pip_repositories()

http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "df13123c44b4a4ff2c2f337b906763879d94871d16411bf82dcfeba892b58607",
    strip_prefix = "rules_docker-0.13.0",
    urls = [
        "https://github.com/bazelbuild/rules_docker/releases/download/v0.13.0/rules_docker-v0.13.0.tar.gz",
    ],
)

http_archive(
    name = "rules_pkg",
    url = "https://github.com/bazelbuild/rules_pkg/releases/download/0.2.4/rules_pkg-0.2.4.tar.gz",
    sha256 = "4ba8f4ab0ff85f2484287ab06c0d871dcb31cc54d439457d28fd4ae14b18450a",
)

load(
    "@io_bazel_rules_docker//repositories:repositories.bzl",
    container_repositories = "repositories",
)
container_repositories()

load("@io_bazel_rules_docker//repositories:deps.bzl", container_deps = "deps")

container_deps()

load(
    "@io_bazel_rules_docker//container:container.bzl",
    "container_pull",
)

container_pull(
  name = "java_image_base",
  registry = "gcr.io",
  repository = "distroless/java",
  # This pulls the java 11 version of the jave base image
  digest = "sha256:f9fe0de7f8ded68f757d99e9d165b96e89e00d4cef80d204aa76bc0b8ffc4576",
)

container_pull(
  name = "java_debug_image_base",
  registry = "gcr.io",
  repository = "distroless/java",
  # Java 11 debug
  digest = "sha256:6c5cee837b874e700995690e65fd8c16ea2c4b028a6bba16a34b0b06de35d2f8",
)

container_pull(
    name = "firefox-standalone",
    registry = "index.docker.io",
    repository = "selenium/standalone-firefox",
    # selenium/standalone-firefox:3.141.59
    digest = "sha256:98d0cf6284a1560117811a7a47f95b38d81bd1fbd78551bcc58fa986abf2cb55",
)
