
# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/91.0.2/linux-x86_64/en-US/firefox-91.0.2.tar.bz2",
        sha256 = "9eaac9c88ff4696228292590b65ab2fd1b0d98b7a1edf5a21abc11b7803a046d",
        build_file_content = "exports_files([\"firefox\"])",
    )
    
    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/91.0.2/mac/en-US/Firefox%2091.0.2.dmg",
        sha256 = "4147fff1b176a659d6d4d928efe6ec98af313533508809264d78cc83c93cab30",
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
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-93.0.961.38.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "446f3e46d3752fa423789fdf26dbbb37462d3c1211a921e7ba7febb97cb47d68",
        move = {
            "MicrosoftEdge-93.0.961.38.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )
    
    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/93.0.961.38/edgedriver_mac64.zip",
        sha256 = "fb374b7d4153f2f7bbb671b6b8ba982058dddf00c5fc7b9ef8988d7a5e847d82",
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
        url = "https://chromedriver.storage.googleapis.com/92.0.4515.107/chromedriver_linux64.zip",
        sha256 = "c3cfba55df31a0a0d62d901049e91ee1ec4e38dd165e752409b7430ae59fcc8b",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
    
    http_archive(
        name = "mac_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/92.0.4515.107/chromedriver_mac64.zip",
        sha256 = "97f9a5733ef83a001922fd14ff2f5ac5b03c8a16aa02986ecca300cfbffaa03e",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
    
