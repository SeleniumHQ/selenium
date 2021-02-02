load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

_edge_version = "89.0.713.0"

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
            "url": "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdgeCanary-89.0.713.0.pkg?platform=Mac&Consent=0&channel=Canary",
            "sha256": "25dfe56b00d5f0af1f9d7ed3d84442fd9d783aa2abe1be93c9ea8e7088f5e5c6",
        },
        "windows": {
            "url": None,
            "sha256": None,
        },
    },
    # Versions found by visiting https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
    "edgedriver": {
        "linux": {
            "url": None,
            "sha256": "d498eaacc414adbaf638333b59390cdfea5d780f941f57f41fd90280df78b159",
        },
        "mac": {
            "url": "https://msedgedriver.azureedge.net/%s/edgedriver_mac64.zip" % _edge_version,
            "sha256": "0282fa65d7f303f59fc4f8001b3d1ce25a44b0394a449f18291f68b6d0f9e691",
        },
        "windows": {
            "url": "https://msedgedriver.azureedge.net/87.0.669.0/edgedriver_win64.zip",
            "sha256": None,
        },
    },
    # Versions found by visiting https://ftp.mozilla.org/pub/firefox/releases/
    "firefox": {
        "linux": {
            "url": "https://ftp.mozilla.org/pub/firefox/releases/83.0/linux-x86_64/en-US/firefox-83.0.tar.bz2",
            "sha256": "93ff827fdcba92ddb71851c46ac8192a727ed61402e896c6262943e382f92412",
        },
        "mac": {
            "url": "https://ftp.mozilla.org/pub/firefox/releases/83.0/mac/en-US/Firefox%2083.0.dmg",
            "sha256": "7e527884e40039c6c97929591754b92394aa965fd61d42158fea5df075636ec6",
        },
        "windows": {
            "url": None,
            "sha256": None,
        },
    },
    # Versions found by visiting https://github.com/mozilla/geckodriver/releases
    "geckodriver": {
        "linux": {
            "url": "https://github.com/mozilla/geckodriver/releases/download/v0.28.0/geckodriver-v0.28.0-linux64.tar.gz",
            "sha256": "61bfc547a623d7305256611a81ecd24e6bf9dac555529ed6baeafcf8160900da",
        },
        "mac": {
            "url": "https://github.com/mozilla/geckodriver/releases/download/v0.28.0/geckodriver-v0.28.0-macos.tar.gz",
            "sha256": "c288ff6db39adfd5eea0e25b4c3e71bfd9fb383eccf521cdd65f67ea78eb1761",
        },
        "windows": {
            "url": None,
            "sha256": None,
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
            "MicrosoftEdgeCanary-%s.pkg/Payload/Microsoft Edge Canary.app" % _edge_version: "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

def _firefox():
    http_archive(
        name = "linux_geckodriver",
        url = _versions["geckodriver"]["linux"]["url"],
        sha256 = _versions["geckodriver"]["linux"]["sha256"],
        build_file_content = "exports_files([\"geckodriver\"])",
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
    )

    dmg_archive(
        name = "mac_firefox",
        url = _versions["firefox"]["mac"]["url"],
        sha256 = _versions["firefox"]["mac"]["sha256"],
        build_file_content = "exports_files([\"Firefox.app\"])",
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
