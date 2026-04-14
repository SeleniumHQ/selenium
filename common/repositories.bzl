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
        url = "https://ftp.mozilla.org/pub/firefox/releases/149.0.2/linux-x86_64/en-US/firefox-149.0.2.tar.xz",
        sha256 = "814e872b969a4a33b6d44d27a2ab2f4b2c81692560cadb5855c0a3ae269e20e8",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/149.0.2/mac/en-US/Firefox%20149.0.2.dmg",
        sha256 = "3c4f90c4d8e52ded2ab3c173323d57c9f2943b448d05cb68f938760bb56d524f",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/150.0b9/linux-x86_64/en-US/firefox-150.0b9.tar.xz",
        sha256 = "0948f5f6ccd6c480221d026d9dfe5dc9f3facbd50cb2a77bff7fddb00753e5f8",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/150.0b9/mac/en-US/Firefox%20150.0b9.dmg",
        sha256 = "846fab82aad86766805f12e34cf2ebf3fff92e21f294944d462333da0100b8d5",
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
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/5fe04b8e-37d4-4632-81d4-54b7ed1f3832/MicrosoftEdge-147.0.3912.60.pkg",
        sha256 = "d17bade18881a7a22987e40bc13533c0e1010bd50603b737a4edcddfc7dde894",
        move = {
            "MicrosoftEdge-147.0.3912.60.pkg/Payload/Microsoft Edge.app": "Edge.app",
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
        url = "https://packages.microsoft.com/repos/edge/pool/main/m/microsoft-edge-stable/microsoft-edge-stable_147.0.3912.60-1_amd64.deb",
        sha256 = "7dbec190fba23f72a32f0e21ea277232268cb9eb152ec79381b94b9f3e997d35",
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
        url = "https://msedgedriver.microsoft.com/147.0.3912.60/edgedriver_linux64.zip",
        sha256 = "f6068f9f826df65a93060f47e8e46e4319e4b806beb8ddedc1df9835e893cefe",
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
        url = "https://msedgedriver.microsoft.com/147.0.3912.60/edgedriver_mac64_m1.zip",
        sha256 = "a394f57171c9763ba17ee39a2b28573024cb3bcee767f0db06c6f3bc3655a69e",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/147.0.7727.56/linux64/chrome-linux64.zip",
        sha256 = "6019890a909bb6359ea40c2f0f82d40c25dae52aa6fcb9c7706739b8dcd6b28e",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/147.0.7727.56/mac-arm64/chrome-mac-arm64.zip",
        sha256 = "7fe456a58579d9e67a7399897eb51a0784359e51875f759b723e8f81a573cb66",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/147.0.7727.56/linux64/chromedriver-linux64.zip",
        sha256 = "0e216c504847a600dc4c0515f33ab85811c4d0800521959d2c187bca4d476af1",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/147.0.7727.56/mac-arm64/chromedriver-mac-arm64.zip",
        sha256 = "19ed9b91280710b89f5f677c4829cb975998ed935000d8241b84b177380ca525",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/148.0.7778.6/linux64/chrome-linux64.zip",
        sha256 = "ec7e89ae98542638d665c3aefd40d2545542980141f2eb052c6504f494bb0a8f",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/148.0.7778.6/mac-arm64/chrome-mac-arm64.zip",
        sha256 = "0b85efa5f1f33e4d953dd3de9b1140f298026eaedf5cd405f3b3e89e67629eb0",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/148.0.7778.6/linux64/chromedriver-linux64.zip",
        sha256 = "38066d15838c88d2ee74fffd6a253536e0e99ee5fea2c84df64a1d75f1df6671",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/148.0.7778.6/mac-arm64/chromedriver-mac-arm64.zip",
        sha256 = "1dd798a9be6a5cc6e5b35c6703032ad263d24734bfad555c9426633bad39c50b",
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
