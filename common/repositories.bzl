# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/117.0.1/linux-x86_64/en-US/firefox-117.0.1.tar.bz2",
        sha256 = "e70b282ed0b8ce42981675ca2bc9a69fbad23f31f71fbd700b52dcf79e57761c",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/117.0.1/mac/en-US/Firefox%20117.0.1.dmg",
        sha256 = "11a153fd97d2074d730ecf829c817410aa2901244906332dbf1e36e81ca2f912",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/118.0b9/linux-x86_64/en-US/firefox-118.0b9.tar.bz2",
        sha256 = "aabef5f4ad520030de0d7ab47e1b9fab6a90d5deea50829fe7e92feb4a426e56",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/118.0b9/mac/en-US/Firefox%20118.0b9.dmg",
        sha256 = "0794dcdace86d8e7ddd7392c191abb15c6ee71cd23a7c99ef857957c5aa36c7d",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_dev_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/118.0b9/linux-x86_64/en-US/firefox-118.0b9.tar.bz2",
        sha256 = "aabef5f4ad520030de0d7ab47e1b9fab6a90d5deea50829fe7e92feb4a426e56",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/118.0b9/mac/en-US/Firefox%20118.0b9.dmg",
        sha256 = "0794dcdace86d8e7ddd7392c191abb15c6ee71cd23a7c99ef857957c5aa36c7d",
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
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/fcc744c6-52f7-4500-b684-cc1d1ec3e19b/MicrosoftEdge-117.0.2045.31.pkg",
        sha256 = "129470b53c4aa13e7769d87118d119607815b3696c6c643380beb521598bf7b4",
        move = {
            "MicrosoftEdge-117.0.2045.31.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/116.0.1938.81/edgedriver_linux64.zip",
        sha256 = "32db8caca4fb6b96f6e171ee1f06a0d218b22d69d21e7c3bc8986720ea3450b7",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/116.0.1938.81/edgedriver_mac64.zip",
        sha256 = "469e49476e91189c988c4640a9d399c14677ec033ee24b9dc972f2f54ad286e7",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/117.0.5938.88/linux64/chrome-linux64.zip",
        sha256 = "79a67f23970f2d21ee2066d8e488ea99868ff4a05da425313e227783d42625cb",
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
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/117.0.5938.88/mac-x64/chrome-mac-x64.zip",
        sha256 = "6aaa5cc25bc950d23a75b5df53e3cb0c0a2b26b16b75c538d516660635b05708",
        strip_prefix = "chrome-mac-x64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = "exports_files([\"Chrome.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/117.0.5938.88/linux64/chromedriver-linux64.zip",
        sha256 = "70ee5bba99f9711c79c3cff4335a7abff61faada4c81bc0722f7432103644873",
        strip_prefix = "chromedriver-linux64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/117.0.5938.88/mac-x64/chromedriver-mac-x64.zip",
        sha256 = "a5242b8ff9cfa135b87d7a7ecdb92ea2453728fec5c48687485cf2d32266105e",
        strip_prefix = "chromedriver-mac-x64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
