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
        url = "https://ftp.mozilla.org/pub/firefox/releases/151.0.4/linux-x86_64/en-US/firefox-151.0.4.tar.xz",
        sha256 = "5fa872cb4845a52829fa58568c2901edcbda4b79ce466b4b9b09afe41cffcd9b",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/151.0.4/mac/en-US/Firefox%20151.0.4.dmg",
        sha256 = "bc2e72f6abf31aa854b30a3e2841d3f2b8b8e153eaa0a5c3ab285728b7f9b160",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/152.0b10/linux-x86_64/en-US/firefox-152.0b10.tar.xz",
        sha256 = "7230c8ff442b694c806bedc4bb6ca3d4cd1111a2f0aa9bbe071e69473b4e3cb0",
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
        url = "https://ftp.mozilla.org/pub/firefox/releases/152.0b10/mac/en-US/Firefox%20152.0b10.dmg",
        sha256 = "d8305fbf6419af3ddcd073b14ed827fc1fd75d7f61ed0cbd4d99ad538d3a3ed3",
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
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.37.0/geckodriver-v0.37.0-linux64.tar.gz",
        sha256 = "90d4e33bd9816684400c160d1309aaffec23a3f65103511d5a62d8501062e548",
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
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.37.0/geckodriver-v0.37.0-macos-aarch64.tar.gz",
        sha256 = "369165b614164f8adc43d8e017f55fe1ced208afe474be2f0cc1c01fc6529725",
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
        url = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/0be72a65-0973-4687-a2ed-f6e188f98928/MicrosoftEdge-149.0.4022.69.pkg",
        sha256 = "f48920fa84a849cae1219eee944a6b33d1a7da08050c29833834e11444c55d85",
        move = {
            "MicrosoftEdge-149.0.4022.69.pkg/Payload/Microsoft Edge.app": "Edge.app",
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
        url = "https://packages.microsoft.com/repos/edge/pool/main/m/microsoft-edge-stable/microsoft-edge-stable_149.0.4022.69-1_amd64.deb",
        sha256 = "d14afed0a28943b553afb20c6b1e41220c127fa8cd86bd008b3f92a3b1e3fce1",
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
        url = "https://msedgedriver.microsoft.com/149.0.4022.69/edgedriver_linux64.zip",
        sha256 = "9b59c4ec64b86d63178e1a3c16022c6811d84e410ea39a6540231c32797b6966",
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
        url = "https://msedgedriver.microsoft.com/149.0.4022.69/edgedriver_mac64_m1.zip",
        sha256 = "c81ff3281dd05216c9da21b01b718d0aad541215593c03689bf85f99262502c5",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/149.0.7827.115/linux64/chrome-linux64.zip",
        sha256 = "4adece5eeaaf9ca95bd2c87792163e34652097c29a253e8bf9e4c58fcab28884",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/149.0.7827.115/mac-arm64/chrome-mac-arm64.zip",
        sha256 = "562af577e8a8ae69f91bba8440a6806f4e54c2e8d4caa384b610b55007386d79",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/149.0.7827.115/linux64/chromedriver-linux64.zip",
        sha256 = "fa88a66c496d5396e472464222265901c1e4b5bfe1e50905256277c35c14c7ad",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/149.0.7827.115/mac-arm64/chromedriver-mac-arm64.zip",
        sha256 = "33b3acac9e97dc1e61eb5563d4fc316fd9b359e4dd964e689fe847b72f23582a",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/150.0.7871.13/linux64/chrome-linux64.zip",
        sha256 = "d9d5e6746530d888e74d5cacc43b508de388c25ebd91925c13fa2ebea306cd95",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/150.0.7871.13/mac-arm64/chrome-mac-arm64.zip",
        sha256 = "34c0955d81e08520cb8d8baf896863ea64c09233c5b083ff7b96fcaaac8e049d",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/150.0.7871.13/linux64/chromedriver-linux64.zip",
        sha256 = "13efe788d32e1ed935d8ca8e389b33d3fec4fc25bb97e42d80082a337ed87a19",
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
        url = "https://storage.googleapis.com/chrome-for-testing-public/150.0.7871.13/mac-arm64/chromedriver-mac-arm64.zip",
        sha256 = "9c16a2036dfc06013d6a58df4698677d9b9c94f58bb4027d8ab57be183203bbf",
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
