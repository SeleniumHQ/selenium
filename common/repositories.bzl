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
        url = "https://ftp.mozilla.org/pub/firefox/releases/119.0b4/linux-x86_64/en-US/firefox-119.0b4.tar.bz2",
        sha256 = "c00639e94df1a6553c23094ed1fbd3afc2cbfe53f7ff481aeb5619419ed6e11c",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/119.0b4/mac/en-US/Firefox%20119.0b4.dmg",
        sha256 = "bd470741624ee3efabe55e3f45c88492d3b351fdec3c281800151d6e9142745f",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_dev_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/119.0b4/linux-x86_64/en-US/firefox-119.0b4.tar.bz2",
        sha256 = "c00639e94df1a6553c23094ed1fbd3afc2cbfe53f7ff481aeb5619419ed6e11c",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/119.0b4/mac/en-US/Firefox%20119.0b4.dmg",
        sha256 = "bd470741624ee3efabe55e3f45c88492d3b351fdec3c281800151d6e9142745f",
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
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/3bf54043-5c3d-4b78-8322-214b381a5dd0/MicrosoftEdge-117.0.2045.47.pkg",
        sha256 = "286733c41b0ac8f1ef535f48bae2cb1c62356ea4eb35f655e43de06636d56f26",
        move = {
            "MicrosoftEdge-117.0.2045.47.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/117.0.2045.47/edgedriver_linux64.zip",
        sha256 = "433602e89648ec95427b3d52469d0f737f3962f18e0e690d3b47c8ae63477f60",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/117.0.2045.47/edgedriver_mac64.zip",
        sha256 = "10f95590855c59840e7ac4268e7e45ac1e8bb4ff0c35a604f1c083da06656b87",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/117.0.5938.92/linux64/chrome-linux64.zip",
        sha256 = "e1884364136d70ee4778c4319fc66f414292b594319b2e7102dd9e2327b25bb1",
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
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/117.0.5938.92/mac-x64/chrome-mac-x64.zip",
        sha256 = "e4b55cee9b1e0ca36864d2cd830ed7ff8e0c03db7ec5287545fe9a2e498a90a3",
        strip_prefix = "chrome-mac-x64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = "exports_files([\"Chrome.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/117.0.5938.92/linux64/chromedriver-linux64.zip",
        sha256 = "d5089c14bd9fe29fc1a29bf1aa5fc3bf893ffa60c1aef263666599ce2af43be0",
        strip_prefix = "chromedriver-linux64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/117.0.5938.92/mac-x64/chromedriver-mac-x64.zip",
        sha256 = "67d0e2fff494d5b180ac84d35b5484493ea9bb176218edc228c0826c6ee1158d",
        strip_prefix = "chromedriver-mac-x64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
