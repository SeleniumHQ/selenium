load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

_chromium_version = "871231"  # 91.0.4472.114
_edge_version = "91.0.864.67"

_versions = {
    # The chrome version number is found by visiting http://omahaproxy.appspot.com,
    # looking for the current stable version for any platform, and using the "lookup"
    # feature to find out "Version information". The "Branch Base Position" gives you
    # the version.
    "chrome": {
        "linux": {
            "url": "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/%s/chrome-linux.zip" % _chromium_version,
            "sha256": "1fa063fa7dd8abf08e02dc02403ccffc64634a3d4b6223c4971eb7e7d1ac0615",
        },
        "mac": {
            "url": "https://storage.googleapis.com/chromium-browser-snapshots/Mac/%s/chrome-mac.zip" % _chromium_version,
            "sha256": "d85a251a32e9a69c9c9a4fd8368f27a78f3823e397ca0e563a40fb2787f2c240",
        },
        "windows": {
            "url": "https://storage.googleapis.com/chromium-browser-snapshots/Win_x64/%s/chrome-win.zip" % _chromium_version,
            "sha256": None,
        },
    },
    # Versions found by visiting https://chromedriver.chromium.org/downloads
    "chromedriver": {
        "linux": {
            "url": "https://chromedriver.storage.googleapis.com/91.0.4472.101/chromedriver_linux64.zip",
            "sha256": "cf064f2a7c0ac3710e1bde24f59dd3c954dd4e9b65e75322f1a065f18b29fd37",
        },
        "mac": {
            "url": "https://chromedriver.storage.googleapis.com/91.0.4472.101/chromedriver_mac64.zip",
            "sha256": "c84c506dc5d45d85c4e4729822ce2fa843741dccdfc3ed2823cad85cab0cce59",
        },
        "windows": {
            "url": "https://chromedriver.storage.googleapis.com/91.0.4472.101/chromedriver_win32.zip",
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
            "sha256": "078bb879499625eb0952d62c0b1990ba858ebeb308653373ba76e5c9afd1a69f",
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
            "sha256": "3db26dafd45e2cb46f47f405d6fc5537f9eaac7401093fe8285f4c25ec92e97c",
        },
        "windows": {
            "url": "https://msedgedriver.azureedge.net/%s/edgedriver_win64.zip" % _edge_version,
            "sha256": None,
        },
    },
    # Versions found by visiting https://ftp.mozilla.org/pub/firefox/releases/
    "firefox": {
        "linux": {
            "url": "https://ftp.mozilla.org/pub/firefox/releases/90.0/linux-x86_64/en-US/firefox-90.0.tar.bz2",
            "sha256": "29fd51b6316d1e589220c2f47e5ff7cdd996cddd450f64ce1dd28ed0e8e4e8fa",
        },
        "mac": {
            "url": "https://ftp.mozilla.org/pub/firefox/releases/90.0/mac/en-US/Firefox%2090.0.dmg",
            "sha256": "dbc08038e2a26017d360bbf366a935084ed0e0914dc50f3e7e419e5b765c8863",
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
