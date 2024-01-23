# This file has been generated using `bazel run scripts:selenium_manager`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_file")

def selenium_manager():
    http_file(
        name = "download_sm_linux",
        executable = True,
        sha256 = "b417e4faad5ab781102f6ba83f0bfc39b60343fbc43455a2732cab82420dcd0e",
        url = "https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/download/selenium-manager-03637c4/selenium-manager-linux",
    )

    http_file(
        name = "download_sm_macos",
        executable = True,
        sha256 = "f0990a97a24db5b0aa9d2fcbc7b69eaad11e96a4f3a75887f667b874bdc5e713",
        url = "https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/download/selenium-manager-03637c4/selenium-manager-macos",
    )

    http_file(
        name = "download_sm_windows",
        executable = True,
        sha256 = "cb6e0b5ca072038e7626f77263c4b443b1f3e6c550cf3ebf09bf7d2c237a7389",
        url = "https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/download/selenium-manager-03637c4/selenium-manager-windows.exe",
    )
