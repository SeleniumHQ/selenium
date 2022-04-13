
# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/99.0/linux-x86_64/en-US/firefox-99.0.tar.bz2",
        sha256 = "b6d895047c8911a49d944f78f710718091957f0057344cea735096ab4a8c07d1",
        build_file_content = "exports_files([\"firefox\"])",
    )
    
    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/99.0/mac/en-US/Firefox%2099.0.dmg",
        sha256 = "c54367d73f3d47b7f41eb5751014168a27584674b8fb2e541c05f835baccf623",
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
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-100.0.1185.29.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "c80ab77355c04887a7a3bb829c72915f41d0379f342e73a1b33f2e6604cdf11e",
        move = {
            "MicrosoftEdge-100.0.1185.29.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )
    
    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/100.0.1185.29/edgedriver_linux64.zip",
        sha256 = "07ab098a5e2bfb4c0895e6f9c778bc7495a3782a00b3eff4e758912d182d39e8",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )
    
    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/100.0.1185.29/edgedriver_mac64.zip",
        sha256 = "4b7a624a2d9fda85b5ce34ef4857b8f4dcb93a976060069956dd4eed29101870",
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
        url = "https://chromedriver.storage.googleapis.com/100.0.4896.60/chromedriver_linux64.zip",
        sha256 = "617cd4bad5f476a8c2a764d595d808a9d6ada4a35d4f89e2af1234c6206f2d61",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
    
    http_archive(
        name = "mac_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/100.0.4896.60/chromedriver_mac64.zip",
        sha256 = "492bce3b556419b3fea9adbc2699b363445cdd5a74ba902cc579cd5b1c9c1160",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
    
