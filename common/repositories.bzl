# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:deb_archive.bzl", "deb_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/124.0/linux-x86_64/en-US/firefox-124.0.tar.bz2",
        sha256 = "788db377d7b1d2e77d830af308e93f98c97291d8ddaec44a96d82c591f1d4dd0",
        build_file_content = """
filegroup(
    name = "files",
    srcs = glob(["**/*"]),
    visibility = ["//visibility:public"],
)

exports_files(
    ["firefox/firefox"],
)
""",
    )

    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/124.0/mac/en-US/Firefox%20124.0.dmg",
        sha256 = "9876115ec8729e8138493b5898c15939476042cd5d902e364c372af4b1141968",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/125.0b2/linux-x86_64/en-US/firefox-125.0b2.tar.bz2",
        sha256 = "576aff8410a77d42104eda53e59048919015f90be662f0608ac534be3baa46b4",
        build_file_content = """
filegroup(
    name = "files",
    srcs = glob(["**/*"]),
    visibility = ["//visibility:public"],
)

exports_files(
    ["firefox/firefox"],
)
""",
    )

    dmg_archive(
        name = "mac_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/125.0b2/mac/en-US/Firefox%20125.0b2.dmg",
        sha256 = "404d030877db6b46cd7efe896f403e98250a4806f794a25a2654c51b3108efe1",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-linux64.tar.gz",
        sha256 = "79b2e77edd02c0ec890395140d7cdc04a7ff0ec64503e62a0b74f88674ef1313",
        build_file_content = "exports_files([\"geckodriver\"])",
    )

    http_archive(
        name = "mac_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-macos.tar.gz",
        sha256 = "9cec1546585b532959782c8220599aa97c1f99265bb2d75ad00cd56ef98f650c",
        build_file_content = "exports_files([\"geckodriver\"])",
    )

    pkg_archive(
        name = "mac_edge",
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/61b13da3-c921-482a-9166-743689310b71/MicrosoftEdge-122.0.2365.92.pkg",
        sha256 = "304243a7ef631781b707c0d9cb8fd35e718cebad91c29078e389bb4e813afef9",
        move = {
            "MicrosoftEdge-122.0.2365.92.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    deb_archive(
        name = "linux_edge",
        url = "https://packages.microsoft.com/repos/edge/pool/main/m/microsoft-edge-stable/microsoft-edge-stable_122.0.2365.92-1_amd64.deb",
        sha256 = "eab115c454b669dbc42f83b6b9ccc94ec4f2df5a2cf6be762069c75f18f703e8",
        build_file_content = """
filegroup(
    name = "files",
    srcs = glob(["**/*"]),
    visibility = ["//visibility:public"],
)

exports_files(
    ["opt/microsoft/msedge/microsoft-edge"],
)
""",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/122.0.2365.92/edgedriver_linux64.zip",
        sha256 = "d3b45a768e8ff7c9665c657fe121d1e90e8b6d224e3a705c7120d302a00271ad",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/122.0.2365.92/edgedriver_mac64.zip",
        sha256 = "5ad0a70fcf89b9ef8e9b22cba5582c24f87790ff064e2154562e7239b62ebab6",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.58/linux64/chrome-linux64.zip",
        sha256 = "b020645b262a85d2cf9bc1e7be139afa175e6b7c18d38525cc4122d5ddf89771",
        build_file_content = """
filegroup(
    name = "files",
    srcs = glob(["**/*"]),
    visibility = ["//visibility:public"],
)

exports_files(
    ["chrome-linux64/chrome"],
)
""",
    )

    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.58/mac-x64/chrome-mac-x64.zip",
        sha256 = "5ac1cf013fa9f27b56d8671ae41b09f31011ef7fd23879d80a4d9e94d0c6d0c0",
        strip_prefix = "chrome-mac-x64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = "exports_files([\"Chrome.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.58/linux64/chromedriver-linux64.zip",
        sha256 = "accdaeb00d330d9d5a5ef91bbe6fa5d316a5562109231bbc65866fa1390d8a2b",
        strip_prefix = "chromedriver-linux64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.58/mac-x64/chromedriver-mac-x64.zip",
        sha256 = "c912db7b7c65d0bfcf7d17150782c0e89783bcba60521b4a66201fc81daffd91",
        strip_prefix = "chromedriver-mac-x64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
