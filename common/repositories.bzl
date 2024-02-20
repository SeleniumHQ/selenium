# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/122.0.1/linux-x86_64/en-US/firefox-122.0.1.tar.bz2",
        sha256 = "1c502c15f71bb729e6506667c32de525849d6571f4a3a21e5b02fc08312b20e7",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/122.0.1/mac/en-US/Firefox%20122.0.1.dmg",
        sha256 = "42721425ca279d48b729eab8e443ce2ad83465ada46dee367d84a103791deb2a",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/123.0b9/linux-x86_64/en-US/firefox-123.0b9.tar.bz2",
        sha256 = "c29d96875b8eb03d37e948e3f62cd4505300fce85f0e09dfae6a4443d3878607",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/123.0b9/mac/en-US/Firefox%20123.0b9.dmg",
        sha256 = "6addddfd288a16c08dc59a88c8f9fe252d7d608b83bc2458f139e77fda4ddab8",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_dev_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/123.0b9/linux-x86_64/en-US/firefox-123.0b9.tar.bz2",
        sha256 = "c29d96875b8eb03d37e948e3f62cd4505300fce85f0e09dfae6a4443d3878607",
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
        name = "mac_dev_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/123.0b9/mac/en-US/Firefox%20123.0b9.dmg",
        sha256 = "6addddfd288a16c08dc59a88c8f9fe252d7d608b83bc2458f139e77fda4ddab8",
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
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/7d455fa7-376b-4ff4-a83c-e74664b24a02/MicrosoftEdge-121.0.2277.128.pkg",
        sha256 = "a9b0e772ab1d5545349e312a94526bd3376b9deaa159f13dce070f713c793261",
        move = {
            "MicrosoftEdge-121.0.2277.128.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/121.0.2277.128/edgedriver_linux64.zip",
        sha256 = "9375569e62132ebf68bbe18af7415d572198bc027e15273e8d979c8083ae156a",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/121.0.2277.128/edgedriver_mac64.zip",
        sha256 = "bdf456bf444e2878a672f3eebb3211ca05a10a896ca57d70ccfe9d1dc3e90100",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chrome-for-testing-public/122.0.6261.39/linux64/chrome-linux64.zip",
        sha256 = "22af92803b1c7dec09b12c857a116dee765cf355f212af2f6762fe94c9e26050",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/122.0.6261.39/mac-x64/chrome-mac-x64.zip",
        sha256 = "0144c2cba9eb4deaa5c53040784653f07f56619108559f2e67bf32c5625be950",
        strip_prefix = "chrome-mac-x64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = "exports_files([\"Chrome.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/122.0.6261.39/linux64/chromedriver-linux64.zip",
        sha256 = "03bb90ffde549f9370dcdf2d2bf97783b484545aa8e5b1cbe28b2477028e02f3",
        strip_prefix = "chromedriver-linux64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/122.0.6261.39/mac-x64/chromedriver-mac-x64.zip",
        sha256 = "93325da65b13de4dfc1e5695c61d4e5bfc16263bf1102d6ce48bc12884b4bfee",
        strip_prefix = "chromedriver-mac-x64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
