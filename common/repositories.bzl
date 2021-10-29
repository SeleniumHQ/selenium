# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/93.0/linux-x86_64/en-US/firefox-93.0.tar.bz2",
        sha256 = "9d06897b80d77cfb59e1c8bd4dfc427590b058616ae634e52cfe272af06f9b32",
        build_file_content = "exports_files([\"firefox\"])",
    )

    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/93.0/mac/en-US/Firefox%2093.0.dmg",
        sha256 = "b4c78628c2bf68ee431e15d998383fb6168dbfa916f848f27aba73db67410bc6",
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
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-94.0.992.50.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "2d3e1f6c5dc01f64c18c80b1bbbcc1cc2a07c72c7b870f3b2dd167a87846ae06",
        move = {
            "MicrosoftEdge-94.0.992.50.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/94.0.992.50/edgedriver_mac64.zip",
        sha256 = "f5446a97c7ccd9d80904b1888b28fa5c9eb624b233aa05f046f825b1d8965f3f",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/919578/chrome-linux.zip",
        sha256 = "b20c00667ed3a40ae88ba164ebe6ec3547782c3049f1ea8bdac48c2151e4660c",
        build_file_content = "exports_files([\"chrome-linux\"])",
    )

    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Mac/919578/chrome-mac.zip",
        sha256 = "5ca3dbfe33032ad01f32c0054098b02e2bd12ff6527f2154d4da41792ae6bc99",
        strip_prefix = "chrome-mac",
        build_file_content = "exports_files([\"Chromium.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/94.0.4606.61/chromedriver_linux64.zip",
        sha256 = "d2011e5b7c7c13225d6d0e237d8cfbb2a52601c1a91005841a38358c31d2f4d0",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/94.0.4606.61/chromedriver_mac64.zip",
        sha256 = "3b91860aa4d71330e68cac11da586ac39adcead361ae95b3fa856fd3da5383ac",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
