
# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/92.0/linux-x86_64/en-US/firefox-92.0.tar.bz2",
        sha256 = "29050d18670a61585b101f8fa4e196fcfc22d0447178143202301836f3c048eb",
        build_file_content = "exports_files([\"firefox\"])",
    )

    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/92.0/mac/en-US/Firefox%2092.0.dmg",
        sha256 = "68978c990d06ab94364a36c49d220aeb4e07a8c5d9eaa677bb154a300612964e",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.30.0/geckodriver-v0.30.0-linux64.tar.gz",
        sha256 = "12c37f41d11ed982b7be43d02411ff2c75fb7a484e46966d000b47d1665baa88",
        build_file_content = "exports_files([\"geckodriver\"])",
    )

    http_archive(
        name = "mac_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.30.0/geckodriver-v0.30.0-macos.tar.gz",
        sha256 = "560ba192666c1fe8796404153cfdf2d12551515601c4b3937aabcba6ee300f8c",
        build_file_content = "exports_files([\"geckodriver\"])",
    )

    pkg_archive(
        name = "mac_edge",
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-93.0.961.52.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "c67bb3162624035df17bac44ba19569728b8759d1807414d348a59b059dd6557",
        move = {
            "MicrosoftEdge-93.0.961.52.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/93.0.961.52/edgedriver_mac64.zip",
        sha256 = "3f3e3c9ff37ecd44179035efa30c522a9c9be9f40656bfeb67a06fdca83bcca3",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/911494/chrome-linux.zip",
        sha256 = "25264b328b50589ecae6ed7d87575a34cd9b92ac71b9bc843bacab9562736a02",
        build_file_content = "exports_files([\"chrome-linux\"])",
    )

    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Mac/911494/chrome-mac.zip",
        sha256 = "bec65d1366588f27ce7df1929960e2c93eb88d333ec1da14b9dc96f9f0d07c09",
        strip_prefix = "chrome-mac",
        build_file_content = "exports_files([\"Chromium.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/93.0.4577.63/chromedriver_linux64.zip",
        sha256 = "eb1065a67ac2db7233cd402c197e8372c1dd52e4e2e930b7e5e1250fa4f45470",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/93.0.4577.63/chromedriver_mac64.zip",
        sha256 = "ff4469d533dd09998fc99767468995b81b2ccd180811d961496e3b4f9d058284",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

