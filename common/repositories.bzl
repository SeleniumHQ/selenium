# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:deb_archive.bzl", "deb_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers(name = "local_drivers")

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/127.0.1/linux-x86_64/en-US/firefox-127.0.1.tar.bz2",
        sha256 = "57564e6219f8f79418ba49d1e7a6edf44f8e253f777d0ae7de7dbff200c3d5f4",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

filegroup(
    name = "files",
    srcs = glob(["**/*"]),
)

exports_files(["firefox/firefox"])

js_library(
    name = "firefox-js",
    data = [":files"],
)
""",
    )

    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/127.0.1/mac/en-US/Firefox%20127.0.1.dmg",
        sha256 = "b26e36efe95b2cb0c6c01b726587183c6e6e324fd51b5a0b95c1744bf1a54c3d",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["Firefox.app"])

js_library(
    name = "firefox-js",
    data = glob(["Firefox.app/**/*"]),
)
""",
    )

    http_archive(
        name = "linux_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/128.0b5/linux-x86_64/en-US/firefox-128.0b5.tar.bz2",
        sha256 = "577220df55883cc20a397823dc05a385d9afbc446b23ed472fc75628ed54b608",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

filegroup(
    name = "files",
    srcs = glob(["**/*"]),
)

exports_files(["firefox/firefox"])

js_library(
    name = "firefox-js",
    data = [":files"],
)
""",
    )

    dmg_archive(
        name = "mac_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/128.0b5/mac/en-US/Firefox%20128.0b5.dmg",
        sha256 = "11ce1a8e6b4d86bb399964f1ee6868b59468049f47af8401f65c1e910eb95f11",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["Firefox.app"])

js_library(
    name = "firefox-js",
    data = glob(["Firefox.app/**/*"]),
)
""",
    )

    http_archive(
        name = "linux_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-linux64.tar.gz",
        sha256 = "79b2e77edd02c0ec890395140d7cdc04a7ff0ec64503e62a0b74f88674ef1313",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["geckodriver"])

js_library(
    name = "geckodriver-js",
    data = ["geckodriver"],
)
""",
    )

    http_archive(
        name = "mac_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-macos.tar.gz",
        sha256 = "9cec1546585b532959782c8220599aa97c1f99265bb2d75ad00cd56ef98f650c",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["geckodriver"])

js_library(
    name = "geckodriver-js",
    data = ["geckodriver"],
)
""",
    )

    pkg_archive(
        name = "mac_edge",
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/7f06ea4d-1753-4d40-aab4-edf087546165/MicrosoftEdge-126.0.2592.61.pkg",
        sha256 = "ebadb7f4095b98cb627663bff918f3a7f2601462058fdac65a78818dabd1f68e",
        move = {
            "MicrosoftEdge-126.0.2592.61.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["Edge.app"])

js_library(
    name = "edge-js",
    data = glob(["Edge.app/**/*"]),
)
""",
    )

    deb_archive(
        name = "linux_edge",
        url = "https://packages.microsoft.com/repos/edge/pool/main/m/microsoft-edge-stable/microsoft-edge-stable_126.0.2592.61-1_amd64.deb",
        sha256 = "ee0a6adf6dd341ea7570497198ab2a58fb6331c881f999c4f2cecb8d89ca9cdb",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

filegroup(
    name = "files",
    srcs = glob(["**/*"]),
)

exports_files(["opt/microsoft/msedge/microsoft-edge"])

js_library(
    name = "edge-js",
    data = [":files"],
)
""",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/126.0.2592.61/edgedriver_linux64.zip",
        sha256 = "9b99973dd92d8e1115c6d317f7e3a9586125abb57c4c19a7f14c755ecc1b8cb4",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["msedgedriver"])

js_library(
    name = "msedgedriver-js",
    data = ["msedgedriver"],
)
""",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/126.0.2592.61/edgedriver_mac64.zip",
        sha256 = "df6c180720a152b3f7096426cfb722a4ebc4c35715f3e15641323fb45c3c57e6",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["msedgedriver"])

js_library(
    name = "msedgedriver-js",
    data = ["msedgedriver"],
)
""",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chrome-for-testing-public/126.0.6478.62/linux64/chrome-linux64.zip",
        sha256 = "6f42045c9134bdd3cfcea03fb54876ad061da998cabd624c92a25ac6811cd737",
        build_file_content = """
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")
package(default_visibility = ["//visibility:public"])

filegroup(
    name = "files",
    srcs = glob(["**/*"]),
)

exports_files(["chrome-linux64/chrome"])

copy_to_bin(
    name = "chrome-js",
    srcs = [":files"],
)
""",
    )

    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chrome-for-testing-public/126.0.6478.62/mac-x64/chrome-mac-x64.zip",
        sha256 = "be21f6b9387c6e52c318b60379291959693889e27c3e64111e95135ecffa82ad",
        strip_prefix = "chrome-mac-x64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = """
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")
package(default_visibility = ["//visibility:public"])

exports_files(["Chrome.app"])

copy_to_bin(
    name = "chrome-js",
    srcs = glob(["Chrome.app/**/*"]),
)
""",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/126.0.6478.62/linux64/chromedriver-linux64.zip",
        sha256 = "a304e692480c726bae846bf6dee36316305d0b8f4826dfafeab8d6bbbc6e7214",
        strip_prefix = "chromedriver-linux64",
        build_file_content = """
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")
package(default_visibility = ["//visibility:public"])

exports_files(["chromedriver"])

copy_to_bin(
    name = "chromedriver-js",
    srcs = ["chromedriver"],
)
""",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/126.0.6478.62/mac-x64/chromedriver-mac-x64.zip",
        sha256 = "05665a6b5fb71141b5d519998e36f01b650f661942a56dd7f6b929896ae38333",
        strip_prefix = "chromedriver-mac-x64",
        build_file_content = """
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")
package(default_visibility = ["//visibility:public"])

exports_files(["chromedriver"])

copy_to_bin(
    name = "chromedriver-js",
    srcs = ["chromedriver"],
)
""",
    )

def _pin_browsers_extension_impl(_ctx):
    pin_browsers()

pin_browsers_extension = module_extension(
    implementation = _pin_browsers_extension_impl,
)
