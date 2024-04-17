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
        url = "https://ftp.mozilla.org/pub/firefox/releases/125.0.1/linux-x86_64/en-US/firefox-125.0.1.tar.bz2",
        sha256 = "0f702f7690b02953e336fac27874276d9d471c9d264dc0feb7fcc6693d63bd4b",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/125.0.1/mac/en-US/Firefox%20125.0.1.dmg",
        sha256 = "3f431079d423e5397987a4120a63948217252426219f23348cb6b6bbded3acf3",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/126.0b1/linux-x86_64/en-US/firefox-126.0b1.tar.bz2",
        sha256 = "e26915f5a1de4ef4d966735529dd5762f689d270e508e2a961a0775db96f3a6a",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/126.0b1/mac/en-US/Firefox%20126.0b1.dmg",
        sha256 = "1fbaa788b46f9c6051d4a7b373eebfb03320cb8b8010e2439682804a3bbb1050",
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
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/43311c31-f395-4a1b-92de-eac0daf193d9/MicrosoftEdge-123.0.2420.97.pkg",
        sha256 = "dbe96437fbb602006c82dd52ae0ed406b2254c55e21cb119002b6da8b80f0d23",
        move = {
            "MicrosoftEdge-123.0.2420.97.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    deb_archive(
        name = "linux_edge",
        url = "https://packages.microsoft.com/repos/edge/pool/main/m/microsoft-edge-stable/microsoft-edge-stable_123.0.2420.97-1_amd64.deb",
        sha256 = "abb3dc6e2d0942bff0bca22b82e783f5fd99eafd433280f66dc449286a83623b",
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
        url = "https://msedgedriver.azureedge.net/123.0.2420.97/edgedriver_linux64.zip",
        sha256 = "5256f95f54e0f3024d4531ce421951396b035dec8473336c830fa299f31384c9",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/123.0.2420.97/edgedriver_mac64.zip",
        sha256 = "f1e118edb4100ae542a96d1db840cb3bb5cf41f4fb0aa6af3f66b5431b99f983",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.122/linux64/chrome-linux64.zip",
        sha256 = "97d7925c795786f235f86973d1f60a70ad9613e96b22fee084720b3c6ba0701b",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.122/mac-x64/chrome-mac-x64.zip",
        sha256 = "ae8ea050c05ed4956cf02031ea1866eeddabf020fa4dd22bffa2ddae444a993e",
        strip_prefix = "chrome-mac-x64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = "exports_files([\"Chrome.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.122/linux64/chromedriver-linux64.zip",
        sha256 = "8a29aadfb75c11c636b2e5bbddaea58601ee35aa2ab736c06421e440ff6ba3f6",
        strip_prefix = "chromedriver-linux64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.122/mac-x64/chromedriver-mac-x64.zip",
        sha256 = "3e62d5fbe14ae9a0af76134d85bd9902644bba6afe55116f37eec807289e1199",
        strip_prefix = "chromedriver-mac-x64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
