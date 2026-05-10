load("@aspect_bazel_lib//lib:copy_directory.bzl", "copy_directory")

def selenium_manager_bundle(name, out, **kwargs):
    """Copies the cross-compiled Selenium Manager bundle tree into this package.

    Args:
        name: rule name
        out:  destination path within the package's output tree
        **kwargs: forwarded to copy_directory (e.g. visibility)
    """
    copy_directory(
        name = name,
        src = "//common/manager:selenium-manager-bundle",
        out = out,
        **kwargs
    )
