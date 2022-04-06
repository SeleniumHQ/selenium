
# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/98.0.2/linux-x86_64/en-US/firefox-98.0.2.tar.bz2",
        sha256 = "07c5f3dad0850a92d5c609278fb1fe682b2562fa55e6733c09a6b4da7373bfcc",
        build_file_content = "exports_files([\"firefox\"])",
    )
    
    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/98.0.2/mac/en-US/Firefox%2098.0.2.dmg",
        sha256 = "304dfd917c0dcda0313dab1576b520d56de8af7af2e47e7763166d4f5da99851",
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
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-99.0.1150.55.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "201e68e4c1676fe1f16f5dbe21b581df128420e59b46a3ea79d80adfc55a0d57",
        move = {
            "MicrosoftEdge-99.0.1150.55.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )
    
    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/99.0.1150.55/edgedriver_mac64.zip",
        sha256 = "8581a2e3c91b393485ca7b7e86a04bacaad1ba44ce87d0b350163e3c816f1ed9",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )
    
    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/972739/chrome-linux.zip",
        sha256 = "228f8a7b4ab7bd3c43d555ba5857a8240f21fc5df96a91cc827d0ae509b01097",
        build_file_content = "exports_files([\"chrome-linux\"])",
    )
    
    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Mac/972739/chrome-mac.zip",
        sha256 = "a9c59baa2c6c455172c1780ee3411f4b3aa0561a8ed2882d7247d6716d6ccd66",
        strip_prefix = "chrome-mac",
        build_file_content = "exports_files([\"Chromium.app\"])",
    )
    
    http_archive(
        name = "linux_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/99.0.4844.51/chromedriver_linux64.zip",
        sha256 = "3e948b12229667fbb30897de3bae4a3deaac998e552be9a5094227b91c5bbce4",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
    
    http_archive(
        name = "mac_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/99.0.4844.51/chromedriver_mac64.zip",
        sha256 = "9723d866b6d9e151e985ed206232264ff1fc41082cd5713a2589e706cb4553d9",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
    
