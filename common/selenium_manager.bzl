# This file has been generated using `bazel run scripts:selenium_manager`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_file")

def selenium_manager():
    http_file(
        name = "download_sm_linux",
        executable = True,
        sha256 = "d4d775c38f5403d4a719e69903e6f70d15d2454d03da80ad6b82515a4ebfb986",
        url = "https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/download/selenium-manager-3769be1/selenium-manager-linux",
    )

    http_file(
        name = "download_sm_macos",
        executable = True,
        sha256 = "2d6b20c603c4ca913423b3725cdc7ffa7e6a1554c9c161e3da226b186ba71054",
        url = "https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/download/selenium-manager-3769be1/selenium-manager-macos",
    )

    http_file(
        name = "download_sm_windows",
        executable = True,
        sha256 = "cd182eeb12e6ecbac95c9cede7f2d5652a7dd56047b4a7a28fb9b3cbabdb72f8",
        url = "https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/download/selenium-manager-3769be1/selenium-manager-windows.exe",
    )

def _selenium_manager_artifacts_impl(_ctx):
    selenium_manager()

selenium_manager_artifacts = module_extension(
    implementation = _selenium_manager_artifacts_impl,
)
