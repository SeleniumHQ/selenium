# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/94.0/linux-x86_64/en-US/firefox-94.0.tar.bz2",
        sha256 = "9d91733d36b16bea6df2e988ccc8ec541bda558f8a8d9a4d4134225dd21ac7ec",
        build_file_content = "exports_files([\"firefox\"])",
    )

    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/94.0/mac/en-US/Firefox%2094.0.dmg",
        sha256 = "e0cfa0a2ba3bb02928ea27a155733967979d6c947071756c77b3a7ec1de3ee68",
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
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-96.0.1054.34.pkg?platform=Mac&Consent=1&channel=Stable",
        sha256 = "6c2a4966dfc164e17ca27a9326ca115674b55f8f0f128e6b0c80da1fc0bf228d",
        move = {
            "MicrosoftEdge-96.0.1054.34.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/96.0.1025.0/edgedriver_mac64.zip",
        sha256 = "0bcf934ce4b2b57f268e72096817fc6aad2b763e3541fa2d510ece3efc816bab",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/929514/chrome-linux.zip",
        sha256 = "fe7920c48f4e2c55d1b0a00dafb90fda912e998f47fd70a2eff12fb524e8efe8",
        build_file_content = "exports_files([\"chrome-linux\"])",
    )

    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Mac/929514/chrome-mac.zip",
        sha256 = "4bf550ac9e12dfb717cbd275d131e6f42fc5d9e794b4afda13653478f22b4ca5",
        strip_prefix = "chrome-mac",
        build_file_content = "exports_files([\"Chromium.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/96.0.4664.45/chromedriver_linux64.zip",
        sha256 = "750497861c928996b84500c3cd2e1346a0eb764c8eaabf843b5ca301695f9e97",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/96.0.4664.45/chromedriver_mac64.zip",
        sha256 = "0e88eab13db9bd6ef2def8c2342556c29f739f00846de21258b2a3b61e476b64",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
