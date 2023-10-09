# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/118.0.1/linux-x86_64/en-US/firefox-118.0.1.tar.bz2",
        sha256 = "dfaaf6a2ff0fd4751659b797a688966907ae53bb76837b1aedc8c9c62bd641bd",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/118.0.1/mac/en-US/Firefox%20118.0.1.dmg",
        sha256 = "98471851ece004dc0cf79ddb6936b86ca112bbde3b4b839961acf11b3b2e4de9",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/119.0b6/linux-x86_64/en-US/firefox-119.0b6.tar.bz2",
        sha256 = "2640312b24f2938b0251c1cc018d0f85a1b91aaa688638556140ffe7ed5ff682",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/119.0b6/mac/en-US/Firefox%20119.0b6.dmg",
        sha256 = "e68b66dda4ff1b08bc6b66b4e255f1af96cdff067397f3280299a8b8f9fcd38c",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_dev_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/119.0b6/linux-x86_64/en-US/firefox-119.0b6.tar.bz2",
        sha256 = "2640312b24f2938b0251c1cc018d0f85a1b91aaa688638556140ffe7ed5ff682",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/119.0b6/mac/en-US/Firefox%20119.0b6.dmg",
        sha256 = "e68b66dda4ff1b08bc6b66b4e255f1af96cdff067397f3280299a8b8f9fcd38c",
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
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/6293106b-13bc-4423-b6d9-cc405dd5f5f9/MicrosoftEdge-117.0.2045.55.pkg",
        sha256 = "1333a20f3300c75bdcaa7c44ead1217a02fbea69c19af0705efd1ff713b95d87",
        move = {
            "MicrosoftEdge-117.0.2045.55.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/117.0.2045.60/edgedriver_linux64.zip",
        sha256 = "9a09dbfab5b76466f449b623231b5da18d604b3ceabf705a6399926d946e714d",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/117.0.2045.60/edgedriver_mac64.zip",
        sha256 = "fa30f4b7051866f2fce2b89209a43acaa87780bf6db6326108bc7088aca0868b",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/118.0.5993.54/linux64/chrome-linux64.zip",
        sha256 = "0c5a58ee88044a50a5a0a34ae99cf64ac1f40a083b579caf4b58c2ed39b7d0e2",
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
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/118.0.5993.54/mac-x64/chrome-mac-x64.zip",
        sha256 = "aa7c82faa727557b564bb40b9e3848594c71dd0ca34fb1dfcb0632ab64e4f2da",
        strip_prefix = "chrome-mac-x64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = "exports_files([\"Chrome.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/118.0.5993.54/linux64/chromedriver-linux64.zip",
        sha256 = "c655cb37073502057b71af6135e4e6bc5636e29810b11d9ed614178546b7f170",
        strip_prefix = "chromedriver-linux64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/118.0.5993.54/mac-x64/chromedriver-mac-x64.zip",
        sha256 = "07793bc42f19df326203f0ac85df9f9b5b1d2ce8d1a041a7216aaffdd6821dc8",
        strip_prefix = "chromedriver-mac-x64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
