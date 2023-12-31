# This file has been generated using `bazel run scripts:selenium_manager`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_file")

def selenium_manager():
    http_file(
        name = "download_sm_linux",
        executable = True,
        sha256 = "cb0853d449c86bbb0ef5b293bb0d22398ca379549f508c09826398fa06269af3",
        url = "https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/download/selenium-manager-60aa87f/selenium-manager-linux",
    )

    http_file(
        name = "download_sm_macos",
        executable = True,
        sha256 = "db4f28bdf5f84f841e1e400f019bef396b3b73bddf01a7fc4b9b946ee566654a",
        url = "https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/download/selenium-manager-60aa87f/selenium-manager-macos",
    )

    http_file(
        name = "download_sm_windows",
        executable = True,
        sha256 = "f59390cc8adb76c20fe7701c4367d0a35a4dcd097974a2fa7bff6defab4c7521",
        url = "https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/download/selenium-manager-60aa87f/selenium-manager-windows.exe",
    )
