# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/119.0/linux-x86_64/en-US/firefox-119.0.tar.bz2",
        sha256 = "3cba47e712cec5de5716666ef640f678d65ffb3c8ed5a67986296dcfa59fbc32",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/119.0/mac/en-US/Firefox%20119.0.dmg",
        sha256 = "9ea862f623fb3ffbdc6af5cbab34aa7a57aff0c7b13789ccca03ceb73ccae2e9",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/120.0b4/linux-x86_64/en-US/firefox-120.0b4.tar.bz2",
        sha256 = "820940b16184844d33acf58729ec7058b5a4e4faf6182810a51b66ae934f062b",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/120.0b4/mac/en-US/Firefox%20120.0b4.dmg",
        sha256 = "36ec8e6da5b442ee0681b6ccaba0a00fa649ea6eaa073fedd9690505956b1ed0",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_dev_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/120.0b4/linux-x86_64/en-US/firefox-120.0b4.tar.bz2",
        sha256 = "820940b16184844d33acf58729ec7058b5a4e4faf6182810a51b66ae934f062b",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/120.0b4/mac/en-US/Firefox%20120.0b4.dmg",
        sha256 = "36ec8e6da5b442ee0681b6ccaba0a00fa649ea6eaa073fedd9690505956b1ed0",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.33.0/geckodriver-v0.33.0-linux64.tar.gz",
        sha256 = "5f5e89bb31fe5f55f963f56ef7e55a5c8e9dc415d94b1ddc539171a327b8e6c4",
        build_file_content = "exports_files([\"geckodriver\"])",
    )

    http_archive(
        name = "mac_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.33.0/geckodriver-v0.33.0-macos.tar.gz",
        sha256 = "a39c72553beae18c58a560c84cfe86c1708d101bb3d57b8744e3eca64f403703",
        build_file_content = "exports_files([\"geckodriver\"])",
    )

    pkg_archive(
        name = "mac_edge",
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/0653c991-65a8-45b1-a86e-5054fb37379a/MicrosoftEdge-118.0.2088.76.pkg",
        sha256 = "19818679657a36795fe4824869361cdca55cb27ddb89e804248db3c99f41cdab",
        move = {
            "MicrosoftEdge-118.0.2088.76.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/118.0.2088.76/edgedriver_linux64.zip",
        sha256 = "d046450ef8c105ed4a4692baa93ccc5139db5b2746843d7dbdb9fc5a31991f5e",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/118.0.2088.76/edgedriver_mac64.zip",
        sha256 = "906008760332bd7c702f040661578262ff9be48546ed5831bf3209d572b16f2f",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/119.0.6045.105/linux64/chrome-linux64.zip",
        sha256 = "aa2cb76a385bf0694987e9b697a315973afae946191b0d9cf31ce05ca1d44d7f",
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
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/119.0.6045.105/mac-x64/chrome-mac-x64.zip",
        sha256 = "d5ea4d9bcb6ad2465717f690e6f44ef9de27cf22ebfd7d7d987cabfd4d476cd6",
        strip_prefix = "chrome-mac-x64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = "exports_files([\"Chrome.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/119.0.6045.105/linux64/chromedriver-linux64.zip",
        sha256 = "da8e8b028da912c0a2d5ec4fbf59c4324d93925861e3d53259a628c90ec37ff6",
        strip_prefix = "chromedriver-linux64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/119.0.6045.105/mac-x64/chromedriver-mac-x64.zip",
        sha256 = "b11014f51240373f92a2fea86a865ab0ca1aa8cfa62194836da83ddb05ec5422",
        strip_prefix = "chromedriver-mac-x64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
