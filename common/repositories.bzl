# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/108.0.2/linux-x86_64/en-US/firefox-108.0.2.tar.bz2",
        sha256 = "d283f522ec219ac78b66909f3c12431ecdbb4fc8ff5c1250e2e6f057b6482e23",
        build_file_content = "exports_files([\"firefox\"])",
    )

    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/108.0.2/mac/en-US/Firefox%20108.0.2.dmg",
        sha256 = "0cbfb19ac25d72caa048171cb3a6f936cc8447fb7ea45188dbec029184e53052",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-linux64.tar.gz",
        sha256 = "c33054fda83b8d3275c87472dd005a9f70372e9338c2df2665d8cfeb923e67ba",
        build_file_content = "exports_files([\"geckodriver\"])",
    )

    http_archive(
        name = "mac_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-macos.tar.gz",
        sha256 = "8c5bef0690de88a36ef94d07c71c7d7725b115b147d348b56cfae5f3c56bc8a1",
        build_file_content = "exports_files([\"geckodriver\"])",
    )

    pkg_archive(
        name = "mac_edge",
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-108.0.1462.76.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "271f5f770c47a3bfa82124d1a328a33bd1a3d4695a8aca453afd46bc741fa88a",
        move = {
            "MicrosoftEdge-108.0.1462.76.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/108.0.1462.76/edgedriver_linux64.zip",
        sha256 = "77d5cc4f315691551f50d46f76dedfc0526598f1118498dac9be01c49a745504",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/108.0.1462.76/edgedriver_mac64.zip",
        sha256 = "242e0455c7edaef6e8f39729d496e840db7bc9b73816d6c9c63dfac1c8064efd",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1070019/chrome-linux.zip",
        sha256 = "735f46d06fe00fac95ed0d51630e38ba12b255621df2011750ff94eba9024b93",
        build_file_content = "exports_files([\"chrome-linux\"])",
    )

    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Mac/1070019/chrome-mac.zip",
        sha256 = "d7bf04e425405318bed942b3b6208a424bcbc2e98183063db16a5d2407a035b3",
        strip_prefix = "chrome-mac",
        build_file_content = "exports_files([\"Chromium.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/109.0.5414.74/chromedriver_linux64.zip",
        sha256 = "ced4d463501d8a1195f1264a91373b1626ba52beb08e3c7e868ef7a82ae116d6",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/109.0.5414.74/chromedriver_mac64.zip",
        sha256 = "a0dad15fab5c00f8b09d8a2b04eddb8915b3457b5c5aa77177399e5a40eb8670",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
