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
    sha256 = "ae95e4bfcd9f66e9dc73a92cee0107fede74163f788e3deefe00f3aaae75c431",
    strip_prefix = "platforms-681f1ee032566aa2d443cf0335d012925d9c58d4",
    urls = [
        "https://github.com/bazelbuild/platforms/archive/681f1ee032566aa2d443cf0335d012925d9c58d4.zip",
    ],
)

http_archive(
    name = "bazel_toolchains",
    sha256 = "2431088b38fd8e2878db17e3c5babb431de9e5c52b6d8b509d3070fa279a5be2",
    strip_prefix = "bazel-toolchains-3.3.1",
    urls = [
        "https://github.com/bazelbuild/bazel-toolchains/releases/download/3.3.1/bazel-toolchains-3.3.1.tar.gz",
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
    sha256 = "efba481723aa48c14751293e28ed00a5bd9fd343eb65c5fb5883e056bf15ba3f",
    strip_prefix = "rules_csharp-f5fbbd545b1f18efad5e4ce3d06bfabe6b48eeb4",
    urls = [
        "https://github.com/Brightspace/rules_csharp/archive/f5fbbd545b1f18efad5e4ce3d06bfabe6b48eeb4.tar.gz",
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
    patches = [
        "//py:rules_python_any_version_wheel.patch",
    ],
    sha256 = "ddb2e1298684defde2f5e466d96e572119f30f9e2a901a7a81474fd4fa9f6d52",
    strip_prefix = "rules_python-dd7f9c5f01bafbfea08c44092b6b0c8fc8fcb77f",
    urls = [
        "https://github.com/bazelbuild/rules_python/archive/dd7f9c5f01bafbfea08c44092b6b0c8fc8fcb77f.zip",
    ],
)

# This call should always be present.
load("@rules_python//python:repositories.bzl", "py_repositories")

py_repositories()

# This one is only needed if you're using the packaging rules.
load("@rules_python//python:pip.bzl", "pip_repositories")

pip_repositories()

http_archive(
    name = "rules_pkg",
    sha256 = "aeca78988341a2ee1ba097641056d168320ecc51372ef7ff8e64b139516a4937",
    url = "https://github.com/bazelbuild/rules_pkg/releases/download/0.2.6-1/rules_pkg-0.2.6.tar.gz",
)

http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "6287241e033d247e9da5ff705dd6ef526bac39ae82f3d17de1b69f8cb313f9cd",
    strip_prefix = "rules_docker-0.14.3",
    urls = ["https://github.com/bazelbuild/rules_docker/releases/download/v0.14.3/rules_docker-v0.14.3.tar.gz"],
)

load(
    "@io_bazel_rules_docker//repositories:repositories.bzl",
    container_repositories = "repositories",
)

container_repositories()

load("@io_bazel_rules_docker//repositories:deps.bzl", container_deps = "deps")

container_deps()

load("@io_bazel_rules_docker//container:container.bzl", "container_pull")

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

load("@io_bazel_rules_go//go:deps.bzl", "go_register_toolchains", "go_rules_dependencies")

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
