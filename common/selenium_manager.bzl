# This file has been generated using `bazel run scripts:selenium_manager`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_file")

def selenium_manager():
    http_file(
        name = "download_sm_linux",
        executable = True,
        sha256 = "ec6db2c8ea49cf4fafaf52e70ffcbcac3d49d07df7ca11dba49652b9d51d2d1a",
        url = "https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/download/selenium-manager-8fab886/selenium-manager-linux",
    )

    http_file(
        name = "download_sm_macos",
        executable = True,
        sha256 = "43168f3c79747b5dd86a6aeb5fc8fb642614899c4ce427e8dcd57737cf70be7f",
        url = "https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/download/selenium-manager-8fab886/selenium-manager-macos",
    )

    http_file(
        name = "download_sm_windows",
        executable = True,
        sha256 = "c85785e6738ad1759c1e424b2a96f79f0f3ad3a5b5def8a7130dd98c290731c4",
        url = "https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/download/selenium-manager-8fab886/selenium-manager-windows.exe",
    )
