# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/104.0.2/linux-x86_64/en-US/firefox-104.0.2.tar.bz2",
        sha256 = "89830b1a083ce589927e5807c632deb0a4d20d582b8bad558d2d63b731893420",
        build_file_content = "exports_files([\"firefox\"])",
    )

    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/104.0.2/mac/en-US/Firefox%20104.0.2.dmg",
        sha256 = "e49dc15eca7faaa4ddd537bff3a5f7848888bd0e97812e6724c4e43f37d29436",
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
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-105.0.1343.33.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "951d7337f1d9b45d8eda2434d31afd9b4b9027f8fbca53a21f4d9f3f374e74f1",
        move = {
            "MicrosoftEdge-105.0.1343.33.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/105.0.1343.33/edgedriver_linux64.zip",
        sha256 = "d164e8aa2233d4ad884230e22392a2985c7a0353dc8898898bb189e10a231dd8",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/105.0.1343.33/edgedriver_mac64.zip",
        sha256 = "8ba14b0931b50b180510a2e2ed8bb63e534e26ebc09c766b03eac60852291af1",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1026933/chrome-linux.zip",
        sha256 = "65ab83df17a63b211432b2b7596ba97b98be6b3103b930096050417b510e068e",
        build_file_content = "exports_files([\"chrome-linux\"])",
    )

    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Mac/1026933/chrome-mac.zip",
        sha256 = "8f3f899a849f7fb925b18da4396b90a81eb785783a3251c75b4d07207d9b5a09",
        strip_prefix = "chrome-mac",
        build_file_content = "exports_files([\"Chromium.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/105.0.5195.52/chromedriver_linux64.zip",
        sha256 = "c41cc88ac6c7b6e5c48b7ca629d48bf594903862a3d30cdeb35a97d48c397318",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/105.0.5195.52/chromedriver_mac64.zip",
        sha256 = "c0e2982c36f02216a4eaaaff2672b6aa702bbc2b904b00e4ca736c708b784867",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
