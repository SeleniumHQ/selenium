load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

_chromium_version = "884366"  # 92.0.4515.131
_chromedriver_version = "92.0.4515.107"
_edge_version = "92.0.902.67"

_versions = {
    # The chrome version number is found by visiting http://omahaproxy.appspot.com,
    # looking for the current stable version for any platform, and using the "lookup"
    # feature to find out "Version information". The "Branch Base Position" gives you
    # the version.
    "chrome": {
        "linux": {
            "url": "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/%s/chrome-linux.zip" % _chromium_version,
            "sha256": "c9bce4472188e9ce60a67e4b136a19ba3c48251bb302e04f31ef1e13f8cd7dbc",
        },
        "mac": {
            "url": "https://storage.googleapis.com/chromium-browser-snapshots/Mac/%s/chrome-mac.zip" % _chromium_version,
            "sha256": "7abc8919470425225f81e95356db58dec6cff9b912f662e6f0bb8965124e2883",
        },
        "windows": {
            "url": "https://storage.googleapis.com/chromium-browser-snapshots/Win_x64/%s/chrome-win.zip" % _chromium_version,
            "sha256": None,
        },
    },
    # Versions found by visiting https://chromedriver.chromium.org/downloads
    "chromedriver": {
        "linux": {
            "url": "https://chromedriver.storage.googleapis.com/%s/chromedriver_linux64.zip" % _chromedriver_version,
            "sha256": "c3cfba55df31a0a0d62d901049e91ee1ec4e38dd165e752409b7430ae59fcc8b",
        },
        "mac": {
            "url": "https://chromedriver.storage.googleapis.com/%s/chromedriver_mac64.zip" % _chromedriver_version,
            "sha256": "97f9a5733ef83a001922fd14ff2f5ac5b03c8a16aa02986ecca300cfbffaa03e",
        },
        "windows": {
            "url": "https://chromedriver.storage.googleapis.com/%s/chromedriver_win32.zip" % _chromedriver_version,
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
            "sha256": "afb14750572b49c2ad5f25b637ffb3d637107e3db094b97b14a386a9f85a9af7",
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
            "sha256": "a5afad438001fe92ee71e539fdb1dd20c72a9cec7d08c01ec6516215e4abf181",
        },
        "windows": {
            "url": "https://msedgedriver.azureedge.net/%s/edgedriver_win64.zip" % _edge_version,
            "sha256": None,
        },
    },
    # Versions found by visiting https://ftp.mozilla.org/pub/firefox/releases/
    "firefox": {
        "linux": {
            "url": "https://ftp.mozilla.org/pub/firefox/releases/91.0/linux-x86_64/en-US/firefox-91.0.tar.bz2",
            "sha256": "bced054543003caf29d0c93aa63359809bdf1f1fcbca92b82c57167fe94ca1c9",
        },
        "mac": {
            "url": "https://ftp.mozilla.org/pub/firefox/releases/91.0/mac/en-US/Firefox%2091.0.dmg",
            "sha256": "d26c43f490320b3f301578fa653a2235562dfed31ed12b9b1f7c4515da21a6fb",
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
