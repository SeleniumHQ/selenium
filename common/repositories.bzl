# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/104.0/linux-x86_64/en-US/firefox-104.0.tar.bz2",
        sha256 = "9b8d307e7f6e46d468b7c9997f542821aa0cdef4d8ed95aa7dd1b66d48380478",
        build_file_content = "exports_files([\"firefox\"])",
    )

    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/104.0/mac/en-US/Firefox%20104.0.dmg",
        sha256 = "e7671127eedc92135b55844dcb9888120e8fb37550f59b3722af2ddca23f4e15",
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
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-104.0.1293.70.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "18e1861cd4c51d7b6877f5d9f492feb5c34fcfad1f5165773024109cf483e166",
        move = {
            "MicrosoftEdge-104.0.1293.70.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/104.0.1293.70/edgedriver_linux64.zip",
        sha256 = "4b5df747d116fdf9cb8e84d28b5b9ba700573cf45ca56a437b7482e7142ffde0",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/104.0.1293.70/edgedriver_mac64.zip",
        sha256 = "09863ffc9b004ccf45eea26e53e2266edbcdfcdf000673bb2e0c02d39b89be04",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1012652/chrome-linux.zip",
        sha256 = "1074f18c62d6b2908c8b74c20b9ca78eb756f4fa3aadd5c93c9db4a1f0cecc73",
        build_file_content = "exports_files([\"chrome-linux\"])",
    )

    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Mac/1012652/chrome-mac.zip",
        sha256 = "37bc3bcb2c7bf7d67ccb8067671c192e581c90b9f0a3f296fe839cff33166e9b",
        strip_prefix = "chrome-mac",
        build_file_content = "exports_files([\"Chromium.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/104.0.5112.79/chromedriver_linux64.zip",
        sha256 = "7ce8ead8761c08c8bfb910c4f09ac5fe632d1de6ac464c3f8f2cd1a2ae895dd9",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/104.0.5112.79/chromedriver_mac64.zip",
        sha256 = "65766e1c5cecf0e560cfb602bdc62e181d89a35258cf2dfbbb2a8cad37d2f451",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
