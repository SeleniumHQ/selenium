workspace(
    name = "selenium",
    managed_directories = {
        # Share the node_modules directory between Bazel and other tooling
        "@npm": ["node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "bazel_toolchains",
    sha256 = "e2126599d29f2028e6b267eba273dcc8e7f4a35ff323e9600cf42fb03875b7c6",
    strip_prefix = "bazel-toolchains-2.0.0",
    urls = [
        "https://github.com/bazelbuild/bazel-toolchains/releases/download/2.0.0/bazel-toolchains-2.0.0.tar.gz",
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-toolchains/archive/2.0.0.tar.gz",
    ],
)

load("@bazel_toolchains//rules:rbe_repo.bzl", "rbe_autoconfig")

rbe_autoconfig(name = "rbe_default")

http_archive(
    name = "rules_jvm_external",
    sha256 = "e246373de2353f3d34d35814947aa8b7d0dd1a58c2f7a6c41cfeaff3007c2d14",
    strip_prefix = "rules_jvm_external-3.1",
    url = "https://github.com/bazelbuild/rules_jvm_external/archive/3.1.zip",
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
    sha256 = "0e688b0f9279855bef3e98657af44c29ac281c510e21919a03ceb69a910ebdf4",
    strip_prefix = "rules_csharp-77997bbb79ba4294b1d88ae6f44211df8eb4075e",
    urls = [
        "https://github.com/Brightspace/rules_csharp/archive/77997bbb79ba4294b1d88ae6f44211df8eb4075e.tar.gz",
    ],
)

load("//dotnet:workspace.bzl", "selenium_register_dotnet")

selenium_register_dotnet()

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "da72ea53fa1cb8ab5ef7781ba06b97259b7d579a431ce480476266bc81bdf21d",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.36.2/rules_nodejs-0.36.2.tar.gz"],
)

load("@build_bazel_rules_nodejs//:defs.bzl", "npm_install")

npm_install(
    name = "npm",
    package_json = "//:package.json",
    package_lock_json = "//:package-lock.json",
)

load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")

install_bazel_dependencies()

http_archive(
    name = "rules_python",
    sha256 = "b556b165ea1311bf68b6b0bc86d95e5cfca2e839aa6fbd232781bb3930f3d392",
    strip_prefix = "rules_python-e0644961d74b9bbb8a975a01bebb045abfd5d1bd",
    urls = [
        "https://github.com/bazelbuild/rules_python/archive/e0644961d74b9bbb8a975a01bebb045abfd5d1bd.zip",
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
