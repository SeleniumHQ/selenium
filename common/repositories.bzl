
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
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.29.1/geckodriver-v0.29.1-linux64.tar.gz",
        sha256 = "ec164910a3de7eec71e596bd2a1814ae27ba4c9d112b611680a6470dbe2ce27b",
        build_file_content = "exports_files([\"geckodriver\"])",
    )
    
    http_archive(
        name = "mac_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.29.1/geckodriver-v0.29.1-macos.tar.gz",
        sha256 = "9929c804ad0157ca13fdafca808866c88815b658e7059280a9f08f7e70364963",
        build_file_content = "exports_files([\"geckodriver\"])",
    )
        
    pkg_archive(
        name = "mac_edge",
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-93.0.961.47.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "f3b9964b160917667123d3c14384dde9f1ba79abb8199c8ec22e5a8bb674ed50",
        move = {
            "MicrosoftEdge-93.0.961.47.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )
    
    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/93.0.961.47/edgedriver_mac64.zip",
        sha256 = "40be9709f434b9b341ce4927665496f8164858d9e2a053a7509877e7307f7f73",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )
    
    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/902192/chrome-linux.zip",
        sha256 = "2fd5218274f01d2ae5db666903189a379ebe683826b579aba0e582d11e7a2722",
        build_file_content = "exports_files([\"chrome-linux\"])",
    )
    
    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Mac/902192/chrome-mac.zip",
        sha256 = "b944959f7e75bd4457f55662541d921b3b8d0be4e488450006ae615079bc0814",
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
    
