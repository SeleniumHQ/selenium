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
        url = "https://ftp.mozilla.org/pub/firefox/releases/150.0/linux-x86_64/en-US/firefox-150.0.tar.xz",
        sha256 = "2ff987e94bfa6ed51f53d6b4baa7f0f8ec3fc26c4c47bd9f86c70d11aa0fbd60",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/150.0/mac/en-US/Firefox%20150.0.dmg",
        sha256 = "203667ff6b0920f89973d477b1394d99b4b78807a613914c97bb1b3200e6da1b",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["Firefox.app"])

js_library(
    name = "firefox-js",
    data = glob(["Firefox.app/**/*"], allow_empty = True),
)
""",
    )

    http_archive(
        name = "linux_beta_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/151.0b2/linux-x86_64/en-US/firefox-151.0b2.tar.xz",
        sha256 = "f348b4cbb50d085dfd5b6dab2345adb37fc49aae88e94f891bad7ac6d096dc92",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/151.0b2/mac/en-US/Firefox%20151.0b2.dmg",
        sha256 = "c1f9d907eac1d8d063e1929fea4e4bcdb6e8af4451643c5aeeefc12cc15cbec9",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["Firefox.app"])

js_library(
    name = "firefox-js",
    data = glob(["Firefox.app/**/*"], allow_empty = True),
)
""",
    )

    http_archive(
        name = "linux_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.36.0/geckodriver-v0.36.0-linux64.tar.gz",
        sha256 = "0bde38707eb0a686a20c6bd50f4adcc7d60d4f73c60eb83ee9e0db8f65823e04",
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
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.36.0/geckodriver-v0.36.0-macos-aarch64.tar.gz",
        sha256 = "c045c8c0d859e6045defbb1c31b37ebeb3c942fc61daaf11e21fc634f2d71c52",
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
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/9fbdadf9-f8ea-447d-8159-56c5652d2fc4/MicrosoftEdge-147.0.3912.86.pkg",
        sha256 = "491cd0e1d1a20c8f347f9e59292d492519ed893f2225b0f455dd3e0629365351",
        move = {
            "MicrosoftEdge-147.0.3912.86.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["Edge.app"])

js_library(
    name = "edge-js",
    data = glob(["Edge.app/**/*"], allow_empty = True),
)
""",
    )

    deb_archive(
        name = "linux_edge",
        url = "https://packages.microsoft.com/repos/edge/pool/main/m/microsoft-edge-stable/microsoft-edge-stable_147.0.3912.86-1_amd64.deb",
        sha256 = "b83715336cd84cb9a2c31bfa05bd9043caaeae47fe32bdcbf7a05bafc7f9d9c6",
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
        url = "https://msedgedriver.microsoft.com/147.0.3912.72/edgedriver_linux64.zip",
        sha256 = "e5c88348d371ab55898a1e1c823a1452344d676c0efd3d4ba41ce7e6fc5fd772",
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
        url = "https://msedgedriver.microsoft.com/147.0.3912.72/edgedriver_mac64_m1.zip",
        sha256 = "d8baee2b2977638f7804cc46b1941ef54ebe327a4590bc211ad18ba26af8f72d",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/147.0.7727.117/linux64/chrome-linux64.zip",
        sha256 = "396aa03ba871beda83ed6c246a04daaa51771fad4e753474ced11bb15921f9e4",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

filegroup(
    name = "files",
    srcs = glob(["**/*"]),
)

exports_files(["chrome-linux64/chrome"])

js_library(
    name = "chrome-js",
    data = [":files"],
)
""",
    )
    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chrome-for-testing-public/147.0.7727.117/mac-arm64/chrome-mac-arm64.zip",
        sha256 = "7a91c88d288500033f00fecbd1b3f1a0aa61803fec74432658012bdd83fd1c9f",
        strip_prefix = "chrome-mac-arm64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["Chrome.app"])

js_library(
    name = "chrome-js",
    data = glob(["Chrome.app/**/*"]),
)
""",
    )
    http_archive(
        name = "linux_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/147.0.7727.117/linux64/chromedriver-linux64.zip",
        sha256 = "7379e182f8989ef9b7f98b024ae149b13c4879b4a6ca966868c6cd36d2c8db82",
        strip_prefix = "chromedriver-linux64",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["chromedriver"])

js_library(
    name = "chromedriver-js",
    data = ["chromedriver"],
)
""",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/147.0.7727.117/mac-arm64/chromedriver-mac-arm64.zip",
        sha256 = "83f0d801f86dda924b2700beeb0395ecc9246a3061bb16a43425ddf442a0e757",
        strip_prefix = "chromedriver-mac-arm64",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["chromedriver"])

js_library(
    name = "chromedriver-js",
    data = ["chromedriver"],
)
""",
    )

    http_archive(
        name = "linux_beta_chrome",
        url = "https://storage.googleapis.com/chrome-for-testing-public/148.0.7778.56/linux64/chrome-linux64.zip",
        sha256 = "abee8ba4a1d3343970acb26e322ed60c9bcd52c63c77f29d1fafbf1b1e164114",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

filegroup(
    name = "files",
    srcs = glob(["**/*"]),
)

exports_files(["chrome-linux64/chrome"])

js_library(
    name = "chrome-js",
    data = [":files"],
)
""",
    )
    http_archive(
        name = "mac_beta_chrome",
        url = "https://storage.googleapis.com/chrome-for-testing-public/148.0.7778.56/mac-arm64/chrome-mac-arm64.zip",
        sha256 = "9272596a7f45e7b83bcdb4e7367db43371a2d3ada83db1617f1a428a3daf5d26",
        strip_prefix = "chrome-mac-arm64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["Chrome.app"])

js_library(
    name = "chrome-js",
    data = glob(["Chrome.app/**/*"]),
)
""",
    )
    http_archive(
        name = "linux_beta_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/148.0.7778.56/linux64/chromedriver-linux64.zip",
        sha256 = "cd7a5aeee582d715c5e061c485fb7529da610efc44b96b4195a0d4d25f32c544",
        strip_prefix = "chromedriver-linux64",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["chromedriver"])

js_library(
    name = "chromedriver-js",
    data = ["chromedriver"],
)
""",
    )

    http_archive(
        name = "mac_beta_chromedriver",
        url = "https://storage.googleapis.com/chrome-for-testing-public/148.0.7778.56/mac-arm64/chromedriver-mac-arm64.zip",
        sha256 = "18a6d39141a839d59417c8661ce99dc799c1064d961fcc4d7b134a7f00908645",
        strip_prefix = "chromedriver-mac-arm64",
        build_file_content = """
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["chromedriver"])

js_library(
    name = "chromedriver-js",
    data = ["chromedriver"],
)
""",
    )

def _pin_browsers_extension_impl(_ctx):
    pin_browsers()

pin_browsers_extension = module_extension(
    implementation = _pin_browsers_extension_impl,
)
