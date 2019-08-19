workspace(
    name = "seleniumhq",
    managed_directories = {
        # Share the node_modules directory between Bazel and other tooling
        "@npm": ["node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "io_bazel_rules_closure",
    sha256 = "b6936ecc0b5a1ef616b9d7e76694d414aa5605265c11322257a610fb256b1bf7",
    strip_prefix = "rules_closure-7434c41542ca9e1b05166d897b90073d1b8b2cf8",
    urls = [
        "https://github.com/bazelbuild/rules_closure/archive/7434c41542ca9e1b05166d897b90073d1b8b2cf8.tar.gz",
    ],
)

load("@io_bazel_rules_closure//closure:defs.bzl", "closure_repositories")

closure_repositories()

http_archive(
    name = "io_bazel_rules_dotnet",
    sha256 = "6c5d7080c61abda66458b51167d20683de220bd486ab37bde5c470acea12de66",
    strip_prefix = "rules_dotnet-66b235a05ff23c0c65967453e7722d6d7fa28b1c",
    urls = [
        "https://github.com/jimevans/rules_dotnet/archive/66b235a05ff23c0c65967453e7722d6d7fa28b1c.tar.gz",
    ],
)

load("//dotnet:workspace.bzl", "selenium_register_dotnet")

selenium_register_dotnet()

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "6d4edbf28ff6720aedf5f97f9b9a7679401bf7fca9d14a0fff80f644a99992b4",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.32.2/rules_nodejs-0.32.2.tar.gz"],
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
    urls = [
      "https://github.com/bazelbuild/rules_python/archive/9d68f24659e8ce8b736590ba1e4418af06ec2552.zip"
    ],
    strip_prefix = "rules_python-9d68f24659e8ce8b736590ba1e4418af06ec2552",
    sha256 = "f7402f11691d657161f871e11968a984e5b48b023321935f5a55d7e56cf4758a",
)

# This call should always be present.
load("@rules_python//python:repositories.bzl", "py_repositories")
py_repositories()

# This one is only needed if you're using the packaging rules.
load("@rules_python//python:pip.bzl", "pip_repositories")
pip_repositories()
