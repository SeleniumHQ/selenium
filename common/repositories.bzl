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
        url = "https://ftp.mozilla.org/pub/firefox/releases/124.0.1/linux-x86_64/en-US/firefox-124.0.1.tar.bz2",
        sha256 = "b419cb0a10f6f601b1066d75f57b10e378f56b961be8c9dc1c7f73b869ecf82d",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/124.0.1/mac/en-US/Firefox%20124.0.1.dmg",
        sha256 = "b7b260287296cf65193e76c20488fa75f98ff858ea1c2be4337ce5c1226ebcfa",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/125.0b4/linux-x86_64/en-US/firefox-125.0b4.tar.bz2",
        sha256 = "41657b5a23eb472b938218237959d2ee1aeb0165e8b46fc846bf2d797e30b84e",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/125.0b4/mac/en-US/Firefox%20125.0b4.dmg",
        sha256 = "df9ba1d6f5e4a98ffd9c5060c01451d133f73efa60376faa07e497ef72bb98ee",
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
        url = "https://packages.microsoft.com/repos/edge/pool/main/m/microsoft-edge-stable/microsoft-edge-stable_123.0.2420.53-1_amd64.deb",
        sha256 = "ec2eb0642211a1da962a299b9d4977d933a18b3b2213753f6deded96948db6dd",
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
