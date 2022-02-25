
# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/97.0.1/linux-x86_64/en-US/firefox-97.0.1.tar.bz2",
        sha256 = "a63d28ae61926c0d7447f57d4e6fb514401d560abb50ce787bb6bd0e9b7b820f",
        build_file_content = "exports_files([\"firefox\"])",
    )
    
    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/97.0.1/mac/en-US/Firefox%2097.0.1.dmg",
        sha256 = "172f90d0a2165d7abee8e5d5fdf578dd3f94d88b552c6d6f7c285480fa8f7afa",
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
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-98.0.1108.56.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "7ab569106dd266d852ab75a2f795d64b6722bf335bf8a58bebdf8e488d47520e",
        move = {
            "MicrosoftEdge-98.0.1108.56.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )
    
    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/98.0.1108.56/edgedriver_mac64.zip",
        sha256 = "4a4a8f1808fecc50da8fef6576c9b03cc89e099c89ecaea5106826e06b65a80d",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )
    
    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/950341/chrome-linux.zip",
        sha256 = "7a74df8b80856f5212c12ed01833a56c1b6257b6e9999be2aa096fd15a37e5e8",
        build_file_content = "exports_files([\"chrome-linux\"])",
    )
    
    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Mac/950341/chrome-mac.zip",
        sha256 = "61de76d4398a229e95572bb7e922dd15b876c1388593ad29521707af2a76b682",
        strip_prefix = "chrome-mac",
        build_file_content = "exports_files([\"Chromium.app\"])",
    )
    
    http_archive(
        name = "linux_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/98.0.4758.102/chromedriver_linux64.zip",
        sha256 = "3592d3f11f9758e86d73716fba6a751f7d493e03611da5d5eecac8ff14aa9814",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
    
    http_archive(
        name = "mac_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/98.0.4758.102/chromedriver_mac64.zip",
        sha256 = "de3684725907a80c71a33b6d4746bc50791f043b55292f658514627ab8a2dad4",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
    
