workspace(
    name = "selenium",
    managed_directories = {
        # Share the node_modules directory between Bazel and other tooling
        "@npm": ["node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "apple_rules_lint",
    sha256 = "8feab4b08a958b10cb2abb7f516652cd770b582b36af6477884b3bba1f2f0726",
    strip_prefix = "apple_rules_lint-0.1.1",
    url = "https://github.com/apple/apple_rules_lint/archive/0.1.1.zip",
)

load("@apple_rules_lint//lint:repositories.bzl", "lint_deps")

lint_deps()

load("@apple_rules_lint//lint:setup.bzl", "lint_setup")

# Add your linters here.
lint_setup({
    "java-spotbugs": "//java:spotbugs-config",
})

http_archive(
    name = "platforms",
    sha256 = "079945598e4b6cc075846f7fd6a9d0857c33a7afc0de868c2ccb96405225135d",
    urls = [
        "https://github.com/bazelbuild/platforms/releases/download/0.0.4/platforms-0.0.4.tar.gz",
        "https://mirror.bazel.build/github.com/bazelbuild/platforms/releases/download/0.0.4/platforms-0.0.4.tar.gz",
    ],
)

http_archive(
    name = "bazel_skylib",
    sha256 = "1c531376ac7e5a180e0237938a2536de0c54d93f5c278634818e0efc952dd56c",
    urls = [
        "https://github.com/bazelbuild/bazel-skylib/releases/download/1.0.3/bazel-skylib-1.0.3.tar.gz",
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-skylib/releases/download/1.0.3/bazel-skylib-1.0.3.tar.gz",
    ],
)

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")

bazel_skylib_workspace()

http_archive(
    name = "rules_python",
    url = "https://github.com/bazelbuild/rules_python/releases/download/0.3.0/rules_python-0.3.0.tar.gz",
    sha256 = "934c9ceb552e84577b0faf1e5a2f0450314985b4d8712b2b70717dc679fdc01b",
)

# This one is only needed if you're using the packaging rules.
load("@rules_python//python:pip.bzl", "pip_install")

pip_install(
    name = "dev_requirements",
    requirements = "//py:requirements.txt",
)

http_archive(
    name = "rules_proto",
    sha256 = "9fc210a34f0f9e7cc31598d109b5d069ef44911a82f507d5a88716db171615a8",
    strip_prefix = "rules_proto-f7a30f6f80006b591fa7c437fe5a951eb10bcbcf",
    urls = [
        "https://github.com/bazelbuild/rules_proto/archive/f7a30f6f80006b591fa7c437fe5a951eb10bcbcf.tar.gz",
        "https://mirror.bazel.build/github.com/bazelbuild/rules_proto/archive/f7a30f6f80006b591fa7c437fe5a951eb10bcbcf.tar.gz",
    ],
)

load("@rules_proto//proto:repositories.bzl", "rules_proto_dependencies", "rules_proto_toolchains")

rules_proto_dependencies()

rules_proto_toolchains()

http_archive(
    name = "rules_jvm_external",
    patch_args = [
        "-p1",
    ],
    patches = [
        "//java:rules_jvm_external_javadoc.patch",
        "//java:rules_jvm_external_visibility.patch",
    ],
    sha256 = "f36441aa876c4f6427bfb2d1f2d723b48e9d930b62662bf723ddfb8fc80f0140",
    strip_prefix = "rules_jvm_external-4.1",
    url = "https://github.com/bazelbuild/rules_jvm_external/archive/4.1.zip",
)

load("@rules_jvm_external//:repositories.bzl", "rules_jvm_external_deps")

rules_jvm_external_deps()

load("@rules_jvm_external//:setup.bzl", "rules_jvm_external_setup")

rules_jvm_external_setup()

load("//java:maven_deps.bzl", "selenium_java_deps")

selenium_java_deps()

load("@maven//:defs.bzl", "pinned_maven_install")

pinned_maven_install()

http_archive(
    name = "d2l_rules_csharp",
    sha256 = "7b2a83621049904b6e898ffdbe7893a5b410aedf599d63f127ef81eac839b6c1",
    strip_prefix = "rules_csharp-bf24e589bbadcc20f15a16e13f577a0abd42a1d1",
    urls = [
        "https://github.com/Brightspace/rules_csharp/archive/bf24e589bbadcc20f15a16e13f577a0abd42a1d1.tar.gz",
    ],
)

load("//dotnet:workspace.bzl", "selenium_register_dotnet")

selenium_register_dotnet()

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "e79c08a488cc5ac40981987d862c7320cee8741122a2649e9b08e850b6f20442",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/3.8.0/rules_nodejs-3.8.0.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories")

node_repositories(
  package_json = [
    "//:package.json",
    "//javascript/grid-ui:package.json",
  ],
  node_version = "16.4.1",
)

load("@build_bazel_rules_nodejs//:index.bzl", "npm_install")

npm_install(
    name = "npm",
    package_json = "//:package.json",
    package_lock_json = "//:package-lock.json",
)

http_archive(
    name = "io_bazel_rules_closure",
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
    sha256 = "038f1caa773a7e35b3663865ffb003169c6a71dc995e39bf4815792f385d837d",
    urls = [
        "https://github.com/bazelbuild/rules_pkg/releases/download/0.4.0/rules_pkg-0.4.0.tar.gz",
        "https://mirror.bazel.build/github.com/bazelbuild/rules_pkg/releases/download/0.4.0/rules_pkg-0.4.0.tar.gz",
    ],
)

http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "59d5b42ac315e7eadffa944e86e90c2990110a1c8075f1cd145f487e999d22b3",
    strip_prefix = "rules_docker-0.17.0",
    urls = ["https://github.com/bazelbuild/rules_docker/releases/download/v0.17.0/rules_docker-v0.17.0.tar.gz"],
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

# Examine https://console.cloud.google.com/gcr/images/distroless/GLOBAL/java?gcrImageListsize=30 to find
# the latest version when updating
container_pull(
    name = "java_image_base",
    # This pulls the java 11 version of the java base image
    digest = "sha256:97c7eae86c65819664fcb7f36e8dee54bbbbc09c2cb6b448cbee06e1b42df81b",
    registry = "gcr.io",
    repository = "distroless/java",
)

container_pull(
    name = "firefox_standalone",
    # selenium/standalone-firefox-debug:3.141.59
    digest = "sha256:ecc9861eafb3c2f999126fa4cc0434e9fbe6658ba1241998457bb088c99dd0d0",
    registry = "index.docker.io",
    repository = "selenium/standalone-firefox-debug",
)

container_pull(
    name = "chrome_standalone",
    # selenium/standalone-chrome-debug:3.141.59
    digest = "sha256:c3a2174ac31b3918ae9d93c43ed8165fc2346b8c9e16d38ebac691fbb242667f",
    registry = "index.docker.io",
    repository = "selenium/standalone-chrome-debug",
)

http_archive(
    name = "io_bazel_rules_k8s",
    sha256 = "5d4e71b9e34065222115e85bb6dc3bfd80d7c926fafbcf6b01e04e99769c7ca1",
    strip_prefix = "rules_k8s-32df7190a9b2534eb5d15e6c018b81fd345a0cf8",
    url = "https://github.com/bazelbuild/rules_k8s/archive/32df7190a9b2534eb5d15e6c018b81fd345a0cf8.zip",
)

load("@io_bazel_rules_k8s//k8s:k8s.bzl", "k8s_defaults", "k8s_repositories")

k8s_repositories()

load("@io_bazel_rules_k8s//k8s:k8s_go_deps.bzl", k8s_go_deps = "deps")

k8s_go_deps()

load(
    "@io_bazel_rules_go//go:deps.bzl",
    "go_register_toolchains",
    "go_rules_dependencies",
)

go_rules_dependencies()

go_register_toolchains()

k8s_defaults(
    name = "k8s_dev",
    cluster = "docker-desktop",
    image_chroot = "localhost:5000",
    kind = "deployment",
    namespace = "selenium",
)

load("//common:repositories.bzl", "pin_browsers")

pin_browsers()

http_archive(
    name = "coinbase_rules_ruby",
    sha256 = "f83da569318a6af9f1bd2d320d747c6717e4f8a1d30eb7f9d4e793939b62144e",
    strip_prefix = "rules_ruby-4239b06d1af6c9f036a74e2c6c61213d5f19e487",
    url = "https://github.com/p0deje/rules_ruby/archive/4239b06d1af6c9f036a74e2c6c61213d5f19e487.tar.gz",
)

load(
    "@coinbase_rules_ruby//ruby:deps.bzl",
    "ruby_register_toolchains",
    "rules_ruby_dependencies",
)

rules_ruby_dependencies()

ruby_register_toolchains()

load("@coinbase_rules_ruby//ruby:defs.bzl", "rb_bundle")

rb_bundle(
    name = "bundle",
    srcs = [
        "//:rb/lib/selenium/devtools/version.rb",
        "//:rb/lib/selenium/webdriver/version.rb",
        "//:rb/selenium-devtools.gemspec",
        "//:rb/selenium-webdriver.gemspec",
    ],
    bundler_version = "2.1.4",
    gemfile = "//:rb/Gemfile",
)
