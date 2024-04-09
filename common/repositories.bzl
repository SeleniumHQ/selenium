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
        url = "https://ftp.mozilla.org/pub/firefox/releases/124.0.2/linux-x86_64/en-US/firefox-124.0.2.tar.bz2",
        sha256 = "5e007cb52a42ef60e404e76a8aa70c38b889848fcd8c373fa048c0f8a2b0f2bf",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/124.0.2/mac/en-US/Firefox%20124.0.2.dmg",
        sha256 = "f46c899369ef951716d0af68136ab1ab230ea4845a1b08db4ac71b1e5b151d36",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/125.0b9/linux-x86_64/en-US/firefox-125.0b9.tar.bz2",
        sha256 = "ed5c38fdba8bcbc9cf1b1a87a5fbdefee45e9d2be5018a00b5b597cb33ff2c17",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/125.0b9/mac/en-US/Firefox%20125.0b9.dmg",
        sha256 = "c89138ce8f43955d1ca1bf6bac18a9af5fa9e0a44ef02d504098ab70be8a3905",
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
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/6d6b8a3e-0a7d-43fa-ae4b-cf5307e7f9d5/MicrosoftEdge-123.0.2420.81.pkg",
        sha256 = "207f6f9a5ebf7f4697c2e7388a046a92b9ec3c08a76cbd3556bc010a446cb3e8",
        move = {
            "MicrosoftEdge-123.0.2420.81.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    deb_archive(
        name = "linux_edge",
        url = "https://packages.microsoft.com/repos/edge/pool/main/m/microsoft-edge-stable/microsoft-edge-stable_123.0.2420.81-1_amd64.deb",
        sha256 = "ddce031ecd29d980d6d7b9f309707e3ba3d1f704cc6fd87df04bcdd758a6bec3",
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
        url = "https://msedgedriver.azureedge.net/123.0.2420.81/edgedriver_linux64.zip",
        sha256 = "0de1a4d7f00804bbf60be54dbd7b3720f9c5802664415c65ceb555fbb8e32458",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/123.0.2420.81/edgedriver_mac64.zip",
        sha256 = "bb4c5258c41c34fb98dbe1b4aa4b76b47b45d587bc6e71c5f7765ca524b843a2",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.105/linux64/chrome-linux64.zip",
        sha256 = "a83f7386d537f4bcc7560aa9b7eef2c800454b5f8f585b20983e97e799e02699",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.105/mac-x64/chrome-mac-x64.zip",
        sha256 = "7d421ae75b41af18947d2d20c2fad5b5bef2026e95c473fb0abd923d69d90bb1",
        strip_prefix = "chrome-mac-x64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = "exports_files([\"Chrome.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.105/linux64/chromedriver-linux64.zip",
        sha256 = "5d98acbb7860bbeb2a9de3d1c8076358f8cc9f5274564fceb9c26537f7b268f0",
        strip_prefix = "chromedriver-linux64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.105/mac-x64/chromedriver-mac-x64.zip",
        sha256 = "ff343613d6fd11aa31fffd3fe3c71bcc8a9b2a47ee4b9d6d24206921b77498a8",
        strip_prefix = "chromedriver-mac-x64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
