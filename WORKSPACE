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
    sha256 = "ece669d52998c7a0df2c2380f37edbf4ed8ebb1a03587ed1781dfbececef9b3d",
    urls = [
        "https://github.com/apple/apple_rules_lint/releases/download/0.1.0/apple_rules_lint-0.1.0.tar.gz",
    ],
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
    sha256 = "0fc19efca1dfc5c1448c98f050639e3a48beb0031701d55bea5eb546507970f2",
    strip_prefix = "platforms-0.0.1",
    urls = [
        "https://github.com/bazelbuild/platforms/archive/0.0.1.tar.gz",
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
    name = "bazel_toolchains",
    sha256 = "8e0633dfb59f704594f19ae996a35650747adc621ada5e8b9fb588f808c89cb0",
    strip_prefix = "bazel-toolchains-3.7.0",
    urls = [
        "https://github.com/bazelbuild/bazel-toolchains/releases/download/3.7.0/bazel-toolchains-3.7.0.tar.gz",
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-toolchains/releases/download/3.7.0/bazel-toolchains-3.7.0.tar.gz",
    ],
)

load("@bazel_toolchains//rules:rbe_repo.bzl", "rbe_autoconfig")

rbe_autoconfig(name = "rbe_default")

http_archive(
    name = "rules_python",
    patches = ["//py:rules_python_wheel_directory_check.patch"],
    sha256 = "e7dcbceb163a5b45489f49629242a78deaff8fcbebfe5970fb7acf5a16dbe2b8",
    strip_prefix = "rules_python-aa27a3fe7e1a6c73028effe1c78e87d2e7fab641",
    url = "https://github.com/bazelbuild/rules_python/archive/aa27a3fe7e1a6c73028effe1c78e87d2e7fab641.zip",
)

# This one is only needed if you're using the packaging rules.
load("@rules_python//python:pip.bzl", "pip_install", "pip_repositories")

pip_install(
    name = "dev_requirements",
    requirements = "//py:requirements.txt",
)

http_archive(
    name = "rules_proto",
    sha256 = "8e7d59a5b12b233be5652e3d29f42fba01c7cbab09f6b3a8d0a57ed6d1e9a0da",
    strip_prefix = "rules_proto-7e4afce6fe62dbff0a4a03450143146f9f2d7488",
    urls = [
        "https://github.com/bazelbuild/rules_proto/archive/7e4afce6fe62dbff0a4a03450143146f9f2d7488.tar.gz",
        "https://mirror.bazel.build/github.com/bazelbuild/rules_proto/archive/7e4afce6fe62dbff0a4a03450143146f9f2d7488.tar.gz",
    ],
)

load("@rules_proto//proto:repositories.bzl", "rules_proto_dependencies", "rules_proto_toolchains")

rules_proto_dependencies()

rules_proto_toolchains()

http_archive(
    name = "rules_jvm_external",
    sha256 = "d85951a92c0908c80bd8551002d66cb23c3434409c814179c0ff026b53544dab",
    strip_prefix = "rules_jvm_external-3.3",
    url = "https://github.com/bazelbuild/rules_jvm_external/archive/3.3.zip",
)

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
    sha256 = "121f17d8b421ce72f3376431c3461cd66bfe14de49059edc7bb008d5aebd16be",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/2.3.1/rules_nodejs-2.3.1.tar.gz"],
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
    sha256 = "aeca78988341a2ee1ba097641056d168320ecc51372ef7ff8e64b139516a4937",
    url = "https://github.com/bazelbuild/rules_pkg/releases/download/0.2.6-1/rules_pkg-0.2.6.tar.gz",
)

http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "2fc3fe7be1daed0dcb249cced962ee10a1303de20b0d8837f2d99150fcbfca2e",
    strip_prefix = "rules_docker-feaaebdd3162fb643494af07698f56ca9aba1241",
    urls = ["https://github.com/bazelbuild/rules_docker/archive/feaaebdd3162fb643494af07698f56ca9aba1241.zip"],
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
    # This pulls the java 11 version of the jave base image
    digest = "sha256:f9fe0de7f8ded68f757d99e9d165b96e89e00d4cef80d204aa76bc0b8ffc4576",
    registry = "gcr.io",
    repository = "distroless/java",
)

container_pull(
    name = "firefox_standalone",
    # selenium/standalone-firefox-debug:3.141.59
    digest = "sha256:a77683572022f8139b07eb29dee66f7b34b5df4d9902b7f1e081e112411f683d",
    registry = "index.docker.io",
    repository = "selenium/standalone-firefox-debug",
)

container_pull(
    name = "chrome_standalone",
    # selenium/standalone-chrome-debug:3.141.59
    digest = "sha256:53812c3d01622148e9ccd79e598c3740804dbfd51594ae592bac5a14380b595e",
    registry = "index.docker.io",
    repository = "selenium/standalone-chrome-debug",
)

http_archive(
    name = "io_bazel_rules_k8s",
    sha256 = "d91aeb17bbc619e649f8d32b65d9a8327e5404f451be196990e13f5b7e2d17bb",
    strip_prefix = "rules_k8s-0.4",
    urls = ["https://github.com/bazelbuild/rules_k8s/releases/download/v0.4/rules_k8s-v0.4.tar.gz"],
)

load("@io_bazel_rules_k8s//k8s:k8s.bzl", "k8s_repositories")

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

load("@io_bazel_rules_k8s//k8s:k8s.bzl", "k8s_defaults")

k8s_defaults(
    name = "k8s_dev",
    cluster = "docker-desktop",
    image_chroot = "localhost:5000",
    kind = "deployment",
    namespace = "selenium",
)
