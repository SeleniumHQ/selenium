load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

_edge_version = "89.0.774.54"

_versions = {
    # The chrome version number is found by visiting http://omahaproxy.appspot.com,
    # looking for the current stable version for any platform, and using the "lookup"
    # feature to find out "Version information". The "Branch Base Position" gives you
    # the version.
    # 827102 = 88.0.4324.96
    "chrome": {
        "linux": {
            "url": "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/827102/chrome-linux.zip",
            "sha256": "e2720836e44063796a9be3c9fa6522a753f92a7ed5e3686a5e9246b0e45cf161",
        },
        "mac": {
            "url": "https://storage.googleapis.com/chromium-browser-snapshots/Mac/827102/chrome-mac.zip",
            "sha256": "9e053a67e2be04c39ab51021aff30010681d2e9c616a3b8195a9ae32c5aed3b5",
        },
        "windows": {
            "url": "https://storage.googleapis.com/chromium-browser-snapshots/Win_x64/827102/chrome-win.zip",
            "sha256": None,
        },
    },
    # Versions found by visiting https://chromedriver.chromium.org/downloads
    "chromedriver": {
        "linux": {
            "url": "https://chromedriver.storage.googleapis.com/88.0.4324.96/chromedriver_linux64.zip",
            "sha256": "817ca10b63f01bb2f6ead37658c83cd68bcd912ea6a4f0a761d152080a1b1e42",
        },
        "mac": {
            "url": "https://chromedriver.storage.googleapis.com/88.0.4324.96/chromedriver_mac64.zip",
            "sha256": "b7171a5bf9cdc1afe10b7f7812e13d275342e861518a7db6ff1ce5666e65bf86",
        },
        "windows": {
            "url": "https://chromedriver.storage.googleapis.com/88.0.4324.96/chromedriver_win32.zip",
            "sha256": None,
        },
    },
    # Ultimately, this will is determined by visiting https://www.microsoft.com/en-us/edge
    "edge": {
        "linux": {
            "url": None,
            "sha256": None,
        },
        "mac": {
            "url": "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-%s.pkg?platform=Mac&Consent=0&channel=Stable" % _edge_version,
            "sha256": "23541c9d9e31c5a4221957a56906749b4ddcb422a22d178b4dd5adf833230838",
        },
        "windows": {
            "url": None,
            "sha256": None,
        },
    },
    # Versions found by visiting https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
    "edgedriver": {
        "linux": {
            "url": "",
            "sha256": None,
        },
        "mac": {
            "url": "https://msedgedriver.azureedge.net/%s/edgedriver_mac64.zip" % _edge_version,
            "sha256": "c8eab921ccaaec552f1380d3ca95f91e947fda1866c84d7f47da0198b9b52645",
        },
        "windows": {
            "url": "https://msedgedriver.azureedge.net/%s/edgedriver_win64.zip" % _edge_version,
            "sha256": None,
        },
    },
    # Versions found by visiting https://ftp.mozilla.org/pub/firefox/releases/
    "firefox": {
        "linux": {
            "url": "https://ftp.mozilla.org/pub/firefox/releases/88.0/linux-i686/en-US/firefox-88.0.tar.bz2",
            "sha256": "a6f45b2aac37f917c0e3b8450cce94646f8734215d8f04a896f21cdbca7ba77b",
        },
        "mac": {
            "url": "https://ftp.mozilla.org/pub/firefox/releases/88.0/mac/en-US/Firefox%2088.0.dmg",
            "sha256": "8e12a1f5db329e349c5e49e448a589b9649cdbda225eae13813b41e8f88f0f33",
        },
        "windows": {
            "url": None,
            "sha256": None,
        },
    },
    # Versions found by visiting https://github.com/mozilla/geckodriver/releases
    "geckodriver": {
        "linux": {
            "url": "https://github.com/mozilla/geckodriver/releases/download/v0.29.1/geckodriver-v0.29.1-linux64.tar.gz",
            "sha256": "ec164910a3de7eec71e596bd2a1814ae27ba4c9d112b611680a6470dbe2ce27b",
            "type": None,
        },
        "mac": {
            "url": "https://github.com/mozilla/geckodriver/releases/download/v0.29.1/geckodriver-v0.29.1-macos.tar.gz",
            "sha256": "9929c804ad0157ca13fdafca808866c88815b658e7059280a9f08f7e70364963",
            "type": "tgz",
        },
        "windows": {
            "url": None,
            "sha256": None,
            "type": None,
        },
    },
}

def _chrome():
    http_archive(
        name = "linux_chromedriver",
        url = _versions["chromedriver"]["linux"]["url"],
        sha256 = _versions["chromedriver"]["linux"]["sha256"],
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = _versions["chrome"]["linux"]["url"],
        sha256 = _versions["chrome"]["linux"]["sha256"],
        build_file_content = "exports_files([\"chrome-linux\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = _versions["chromedriver"]["mac"]["url"],
        sha256 = _versions["chromedriver"]["mac"]["sha256"],
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chrome",
        url = _versions["chrome"]["mac"]["url"],
        sha256 = _versions["chrome"]["mac"]["sha256"],
        strip_prefix = "chrome-mac",
        build_file_content = "exports_files([\"Chromium.app\"])",
    )

def _edge():
    http_archive(
        name = "mac_edgedriver",
        url = _versions["edgedriver"]["mac"]["url"],
        sha256 = _versions["edgedriver"]["mac"]["sha256"],
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    pkg_archive(
        name = "mac_edge",
        url = _versions["edge"]["mac"]["url"],
        sha256 = _versions["edge"]["mac"]["sha256"],
        move = {
            "MicrosoftEdge-%s.pkg/Payload/Microsoft Edge.app" % _edge_version: "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

def _firefox():
    http_archive(
        name = "linux_geckodriver",
        url = _versions["geckodriver"]["linux"]["url"],
        sha256 = _versions["geckodriver"]["linux"]["sha256"],
        build_file_content = "exports_files([\"geckodriver\"])",
        type = _versions["geckodriver"]["linux"]["type"],
    )

    http_archive(
        name = "linux_firefox",
        url = _versions["firefox"]["linux"]["url"],
        sha256 = _versions["firefox"]["linux"]["sha256"],
        build_file_content = "exports_files([\"firefox\"])",
    )

    http_archive(
        name = "mac_geckodriver",
        url = _versions["geckodriver"]["mac"]["url"],
        sha256 = _versions["geckodriver"]["mac"]["sha256"],
        build_file_content = "exports_files([\"geckodriver\"])",
        type = _versions["geckodriver"]["mac"]["type"],
    )

    dmg_archive(
        name = "mac_firefox",
        url = _versions["firefox"]["mac"]["url"],
        sha256 = _versions["firefox"]["mac"]["sha256"],
        build_file_content = "exports_files([\"Firefox.app\"])",
#        move = {
#            "Firefox.tmp1.pkg/Payload/Firefox.app": "Firefox.app",
#        }
    )

    # TODO: figure out how to unpack the firefox exe on Windows

#    http_archive(
#        name = "windows_geckodriver",
#        url = "https://github.com/mozilla/geckodriver/releases/download/v0.28.0/geckodriver-v0.28.0-win64.zip",
#        sha256 = "49f991b4f25565a5b7008936698f189debc755e6023789adba0c7440b6c960ac",
#        build_file_content = "alias(name = \"geckodriver\", actual = \"geckodriver.exe\", visibility = [\"//visibility:public\"])",
#    )
#
#
#    http_archive(
#        name = "windows_firefox",
#        url = "https://ftp.mozilla.org/pub/firefox/releases/83.0/win64/en-US/Firefox%20Setup%2083.0.exe",
#
#    )

def pin_browsers():
    local_drivers()
    _chrome()
    _edge()
    _firefox()
