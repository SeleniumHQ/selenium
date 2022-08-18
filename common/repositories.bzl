# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/103.0.2/linux-x86_64/en-US/firefox-103.0.2.tar.bz2",
        sha256 = "7869a2d95e02d34b105b37baa669cf29e0fd075fd883eaf4b2bd4e0ced77f6ca",
        build_file_content = "exports_files([\"firefox\"])",
    )

    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/103.0.2/mac/en-US/Firefox%20103.0.2.dmg",
        sha256 = "c3e9e2ec300d231ee6e9cdfe1dd8fc03d62ac6c23d8ddfcc9358e430dca73ea4",
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
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-104.0.1293.47.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "45bdd7eddf65816b17df49ffbe0f49ad5322b4e2385bb73adec70ebd26aee89f",
        move = {
            "MicrosoftEdge-104.0.1293.47.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/104.0.1293.47/edgedriver_linux64.zip",
        sha256 = "ac8f7b9150ef8f7c01845025080d60cad3f3b2453abff13bfd026f88ad7bb209",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/104.0.1293.47/edgedriver_mac64.zip",
        sha256 = "0a0d8cfcfcbb77bc7524c30eed5943065dff9274035d0633c3c6bb3ac05f4d5b",
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
