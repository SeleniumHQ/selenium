# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/102.0/linux-x86_64/en-US/firefox-102.0.tar.bz2",
        sha256 = "2673d387d22ae6e21c20f091dc4811197aaa516110d44133e4d14c91d5568f87",
        build_file_content = "exports_files([\"firefox\"])",
    )

    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/102.0/mac/en-US/Firefox%20102.0.dmg",
        sha256 = "93c6dac2e979960a4e2d33a9aabd5daebcfe44bb0ae1bcecc10fd538ab66725f",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-linux64.tar.gz",
        sha256 = "7fdd8007d22a6f44caa6929a3d74bbd6a00984d88be50255153671bd201e5493",
        build_file_content = "exports_files([\"geckodriver\"])",
    )

    http_archive(
        name = "mac_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-macos.tar.gz",
        sha256 = "4da5c6effe987e0c9049c69c7018e70a9d79f3c6119657def2cc0c3419f885e6",
        build_file_content = "exports_files([\"geckodriver\"])",
    )

    pkg_archive(
        name = "mac_edge",
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-103.0.1264.44.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "49ae051c3f4207ceb8b7a53068d8912b3939f544e9f97464abe3a26d67f8447c",
        move = {
            "MicrosoftEdge-103.0.1264.44.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/103.0.1264.44/edgedriver_linux64.zip",
        sha256 = "ed154c7c58d565093f1d5d42fcd82e27354ff0cfed960e9e83e0435df8dd630a",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/103.0.1264.44/edgedriver_mac64.zip",
        sha256 = "31d6d88562ce8474190b6ca314cd224b490098a48b48b7ba197c14f29070569e",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1002780/chrome-linux.zip",
        sha256 = "f0c5cf79ff25162720b80052e0225b0041317b6633a28132df943639b722854a",
        build_file_content = "exports_files([\"chrome-linux\"])",
    )

    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Mac/1002780/chrome-mac.zip",
        sha256 = "39386bd9603867fd225622cdce9c26b0b7b4173fa017cecb28045a2f1ebc5921",
        strip_prefix = "chrome-mac",
        build_file_content = "exports_files([\"Chromium.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/103.0.5060.53/chromedriver_linux64.zip",
        sha256 = "adec44a6d392d71aa456993d5fdcc7aade5b20e0360770cc61a272e17076fdbe",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/103.0.5060.53/chromedriver_mac64.zip",
        sha256 = "17b8dabdefd001e8b5a87041b5394fec58f9fcb9cdd85a0598b58ebc3c882b0e",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
