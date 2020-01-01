workspace(
    name = "selenium",
    managed_directories = {
        # Share the node_modules directory between Bazel and other tooling
        "@npm": ["node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

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
