# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/123.0.1/linux-x86_64/en-US/firefox-123.0.1.tar.bz2",
        sha256 = "3b8534ecd870f25434fc7ac8b7a26470492484f24fefe3be8eed0b41db52fe43",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/123.0.1/mac/en-US/Firefox%20123.0.1.dmg",
        sha256 = "35885bacbe7c838c8de476ced3aa2dc0f8642d613c0db5b462e919da1b6cf8c7",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/124.0b9/linux-x86_64/en-US/firefox-124.0b9.tar.bz2",
        sha256 = "80208d269dc8d251a7f9f292a7a6ea9ad217189a01075ff6d77326cb0352c1db",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/124.0b9/mac/en-US/Firefox%20124.0b9.dmg",
        sha256 = "c716240f5fd76937cccbe93e9ffdb681782fbacb9af1face7416351a6e71a1a3",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_dev_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/124.0b9/linux-x86_64/en-US/firefox-124.0b9.tar.bz2",
        sha256 = "80208d269dc8d251a7f9f292a7a6ea9ad217189a01075ff6d77326cb0352c1db",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/124.0b9/mac/en-US/Firefox%20124.0b9.dmg",
        sha256 = "c716240f5fd76937cccbe93e9ffdb681782fbacb9af1face7416351a6e71a1a3",
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
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/9c227984-0429-48e9-bade-ba93774a430a/MicrosoftEdge-122.0.2365.80.pkg",
        sha256 = "4fca764d70068e29d1b4657fb4c8b28bfcd8aebc295368bb49e7560f19af0716",
        move = {
            "MicrosoftEdge-122.0.2365.80.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/122.0.2365.80/edgedriver_linux64.zip",
        sha256 = "ce49a0e62695ae10226903c00bb15bd296d563a009f03544394228bedf250ab5",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/122.0.2365.80/edgedriver_mac64.zip",
        sha256 = "a12f5030963240e0838670e4cbaf826bd9e5a92565e5efa2e0066729cb34b523",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chrome-for-testing-public/122.0.6261.111/linux64/chrome-linux64.zip",
        sha256 = "b059c80216abd74f25a35c08c6ad601a30dfdb09588af27828a9bc7adde65bd3",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/122.0.6261.111/mac-x64/chrome-mac-x64.zip",
        sha256 = "4754c5793fec0080e29c6df1720d09c4052b447a14239a55682948635612c0e8",
        strip_prefix = "chrome-mac-x64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = "exports_files([\"Chrome.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/122.0.6261.111/linux64/chromedriver-linux64.zip",
        sha256 = "a73431662c53100171823855de88aea4191c66262c9f61b9829f7ecddc76b754",
        strip_prefix = "chromedriver-linux64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/122.0.6261.111/mac-x64/chromedriver-mac-x64.zip",
        sha256 = "16d7e9b92808cd8193fb00ded4c805744bfe0f89cbb647b3ddd1450226ec9212",
        strip_prefix = "chromedriver-mac-x64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
