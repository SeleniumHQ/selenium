# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()

    http_archive(
        name = "linux_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/109.0.1/linux-x86_64/en-US/firefox-109.0.1.tar.bz2",
        sha256 = "487a18ecbb0b3b91e402b55424f429d2e4e6127696ee48bb0e60ce7f9879d581",
        build_file_content = """
filegroup(
    name = "files",
    srcs = glob(["**/*"]),
    visibility = ["//visibility:public"],
)

exports_files(
    ["firefox/firefox"],
)
""",
    )

    dmg_archive(
        name = "mac_firefox",
        url = "https://ftp.mozilla.org/pub/firefox/releases/109.0.1/mac/en-US/Firefox%20109.0.1.dmg",
        sha256 = "4d69f1675824ff317710d4eadb8ca875573c29692247f398e23bc7a4d31159ba",
        build_file_content = "exports_files([\"Firefox.app\"])",
    )

    http_archive(
        name = "linux_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.32.1/geckodriver-v0.32.1-linux64.tar.gz",
        sha256 = "8059f4b4e0bc62dac0c26d020948e92918a8425c382585a19aa50fe3c8284fa8",
        build_file_content = "exports_files([\"geckodriver\"])",
    )

    http_archive(
        name = "mac_geckodriver",
        url = "https://github.com/mozilla/geckodriver/releases/download/v0.32.1/geckodriver-v0.32.1-macos.tar.gz",
        sha256 = "09883777f88e4f40aeebc6bd8eed75197ea80cff3f89c41a69455e0bc1b92536",
        build_file_content = "exports_files([\"geckodriver\"])",
    )

    pkg_archive(
        name = "mac_edge",
        url = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-109.0.1518.78.pkg?platform=Mac&Consent=0&channel=Stable",
        sha256 = "a5d59232a411f0d90fe080f739cd2cc14bc5bcea02d86250f9d5df84e32dd162",
        move = {
            "MicrosoftEdge-109.0.1518.78.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\"Edge.app\"])",
    )

    http_archive(
        name = "linux_edgedriver",
        url = "https://msedgedriver.azureedge.net/109.0.1518.78/edgedriver_linux64.zip",
        sha256 = "7492b69802cd52a0d1cc36752fa2aa87122757473b61567b716e0ed5e18431da",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "mac_edgedriver",
        url = "https://msedgedriver.azureedge.net/109.0.1518.78/edgedriver_mac64.zip",
        sha256 = "3235c877f1665487437ca5990d8519e7e30439e8e7b39b22b5d4975e6ba295c8",
        build_file_content = "exports_files([\"msedgedriver\"])",
    )

    http_archive(
        name = "linux_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1070019/chrome-linux.zip",
        sha256 = "735f46d06fe00fac95ed0d51630e38ba12b255621df2011750ff94eba9024b93",
        build_file_content = """
filegroup(
    name = "files",
    srcs = glob(["**/*"]),
    visibility = ["//visibility:public"],
)

exports_files(
    ["chrome-linux/chrome"],
)
""",
    )

    http_archive(
        name = "mac_chrome",
        url = "https://storage.googleapis.com/chromium-browser-snapshots/Mac/1070019/chrome-mac.zip",
        sha256 = "d7bf04e425405318bed942b3b6208a424bcbc2e98183063db16a5d2407a035b3",
        strip_prefix = "chrome-mac",
        build_file_content = "exports_files([\"Chromium.app\"])",
    )

    http_archive(
        name = "linux_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/109.0.5414.74/chromedriver_linux64.zip",
        sha256 = "ced4d463501d8a1195f1264a91373b1626ba52beb08e3c7e868ef7a82ae116d6",
        build_file_content = "exports_files([\"chromedriver\"])",
    )

    http_archive(
        name = "mac_chromedriver",
        url = "https://chromedriver.storage.googleapis.com/109.0.5414.74/chromedriver_mac64.zip",
        sha256 = "a0dad15fab5c00f8b09d8a2b04eddb8915b3457b5c5aa77177399e5a40eb8670",
        build_file_content = "exports_files([\"chromedriver\"])",
    )
