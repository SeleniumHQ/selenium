
# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/91.0/linux-x86_64/en-US/firefox-91.0.tar.bz2",
        sha256 = "bced054543003caf29d0c93aa63359809bdf1f1fcbca92b82c57167fe94ca1c9",
        build_file_content = "exports_files([\"firefox\"])",
    )
    
    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/91.0/mac/en-US/Firefox%2091.0.dmg",
        sha256 = "d26c43f490320b3f301578fa653a2235562dfed31ed12b9b1f7c4515da21a6fb",
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
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-92.0.902.67.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "afb14750572b49c2ad5f25b637ffb3d637107e3db094b97b14a386a9f85a9af7",
        move = {
            "MicrosoftEdge-92.0.902.67.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )
    
    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/92.0.902.67/edgedriver_mac64.zip",
        sha256 = "a5afad438001fe92ee71e539fdb1dd20c72a9cec7d08c01ec6516215e4abf181",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )
    
    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/885174/chrome-linux.zip",
        sha256 = "7a7781b13a9296f67aefda073b056446ef850c01c5b56e90dde1f3cfb1bde806",
        build_file_content = "exports_files([\"chrome-linux\"])",
    )
    
    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Mac/885174/chrome-mac.zip",
        sha256 = "8aab4d6052d42c660afd18b100fe7c0b4df6d1d523be953dce6601b873b6f205",
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
    
