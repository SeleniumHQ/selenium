#!/usr/bin/env python

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path

import urllib3
from packaging.version import parse

# Find the current stable versions of each browser we
# support and the sha256 of these. That's useful for
# updating `//common:repositories.bzl`

http = urllib3.PoolManager()


def calculate_hash(url):
    print("Calculate hash for %s" % url, file=sys.stderr)
    h = hashlib.sha256()
    r = http.request("GET", url, preload_content=False)
    for b in iter(lambda: r.read(4096), b""):
        h.update(b)
    return h.hexdigest()


def get_chrome_milestone():
    parser = argparse.ArgumentParser()
    parser.add_argument('--chrome_channel', default='Stable', help='Set the Chrome channel')
    args = parser.parse_args()
    channel = args.chrome_channel

    r = http.request(
        "GET", f"https://chromiumdash.appspot.com/fetch_releases?channel={channel}&num=1&platform=Mac,Linux"
    )
    all_versions = json.loads(r.data)
    # use the same milestone for all chrome releases, so pick the lowest
    milestone = min([version["milestone"] for version in all_versions if version["milestone"]])
    r = http.request(
        "GET", "https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json"
    )
    versions = json.loads(r.data)["versions"]

    return sorted(
        filter(lambda v: v["version"].split(".")[0] == str(milestone), versions), key=lambda v: parse(v["version"])
    )[-1]


def chromedriver(selected_version):
    content = ""

    drivers = selected_version["downloads"]["chromedriver"]

    linux = [d["url"] for d in drivers if d["platform"] == "linux64"][0]
    sha = calculate_hash(linux)

    content = (
        content
        + """    http_archive(
        name = "linux_chromedriver",
        url = "%s",
        sha256 = "%s",
        strip_prefix = "chromedriver-linux64",
        build_file_content = \"\"\"
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["chromedriver"])

js_library(
    name = "chromedriver-js",
    data = ["chromedriver"],
)
\"\"\",
    )
"""
        % (linux, sha)
    )

    mac = [d["url"] for d in drivers if d["platform"] == "mac-x64"][0]
    sha = calculate_hash(mac)
    content = (
        content
        + """
    http_archive(
        name = "mac_chromedriver",
        url = "%s",
        sha256 = "%s",
        strip_prefix = "chromedriver-mac-x64",
        build_file_content = \"\"\"
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["chromedriver"])

js_library(
    name = "chromedriver-js",
    data = ["chromedriver"],
)
\"\"\",
    )
"""
        % (mac, sha)
    )

    return content


def chrome(selected_version):
    chrome_downloads = selected_version["downloads"]["chrome"]

    linux = [d["url"] for d in chrome_downloads if d["platform"] == "linux64"][0]
    sha = calculate_hash(linux)

    content = """
    http_archive(
        name = "linux_chrome",
        url = "%s",
        sha256 = "%s",
        build_file_content = \"\"\"
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
\"\"\",
    )

""" % (
        linux,
        sha,
    )

    mac = [d["url"] for d in chrome_downloads if d["platform"] == "mac-x64"][0]
    sha = calculate_hash(mac)

    content += """    http_archive(
        name = "mac_chrome",
        url = "%s",
        sha256 = "%s",
        strip_prefix = "chrome-mac-x64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = \"\"\"
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["Chrome.app"])

js_library(
    name = "chrome-js",
    data = glob(["Chrome.app/**/*"]),
)
\"\"\",
    )

""" % (
        mac,
        sha,
    )

    return content


def edge():
    content = ""
    r = http.request("GET", "https://edgeupdates.microsoft.com/api/products")
    all_data = json.loads(r.data)

    linux = None
    linux_hash = None
    mac = None
    mac_hash = None
    version = None

    for data in all_data:
        if not "Stable" == data.get("Product"):
            continue
        for release in data["Releases"]:
            if "MacOS" == release.get("Platform"):
                for artifact in release["Artifacts"]:
                    if "pkg" == artifact["ArtifactName"]:
                        mac = artifact["Location"]
                        mac_hash = artifact["Hash"]
                        mac_version = release["ProductVersion"]
            elif "Linux" == release.get("Platform"):
                for artifact in release["Artifacts"]:
                    if "deb" == artifact["ArtifactName"]:
                        linux = artifact["Location"]
                        linux_hash = artifact["Hash"]

    if mac and mac_hash:
        content += """
    pkg_archive(
        name = "mac_edge",
        url = "%s",
        sha256 = "%s",
        move = {
            "MicrosoftEdge-%s.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = \"\"\"
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["Edge.app"])

js_library(
    name = "edge-js",
    data = glob(["Edge.app/**/*"]),
)
\"\"\",
    )
""" % (
            mac,
            mac_hash.lower(),
            mac_version,
        )

    if linux and linux_hash:
        content += """
    deb_archive(
        name = "linux_edge",
        url = "%s",
        sha256 = "%s",
        build_file_content = \"\"\"
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
\"\"\",
    )
""" % (
            linux,
            linux_hash.lower()
        )

    return content


def edgedriver():
    r = http.request("GET", "https://msedgedriver.azureedge.net/LATEST_STABLE")
    v = r.data.decode("utf-16").strip()

    content = ""

    linux = "https://msedgedriver.azureedge.net/%s/edgedriver_linux64.zip" % v
    sha = calculate_hash(linux)
    content = (
        content
        + """
    http_archive(
        name = "linux_edgedriver",
        url = "%s",
        sha256 = "%s",
        build_file_content = \"\"\"
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["msedgedriver"])

js_library(
    name = "msedgedriver-js",
    data = ["msedgedriver"],
)
\"\"\",
    )
"""
        % (linux, sha)
    )

    mac = "https://msedgedriver.azureedge.net/%s/edgedriver_mac64.zip" % v
    sha = calculate_hash(mac)
    content = (
        content
        + """
    http_archive(
        name = "mac_edgedriver",
        url = "%s",
        sha256 = "%s",
        build_file_content = \"\"\"
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["msedgedriver"])

js_library(
    name = "msedgedriver-js",
    data = ["msedgedriver"],
)
\"\"\",
    )
"""
        % (mac, sha)
    )
    return content


def geckodriver():
    content = ""

    r = http.request("GET", "https://api.github.com/repos/mozilla/geckodriver/releases/latest")
    for a in json.loads(r.data)["assets"]:
        if a["name"].endswith("-linux64.tar.gz"):
            url = a["browser_download_url"]
            sha = calculate_hash(url)
            content = (
                content
                + """    http_archive(
        name = "linux_geckodriver",
        url = "%s",
        sha256 = "%s",
        build_file_content = \"\"\"
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["geckodriver"])

js_library(
    name = "geckodriver-js",
    data = ["geckodriver"],
)
\"\"\",
    )
"""
                % (url, sha)
            )

        if a["name"].endswith("-macos.tar.gz"):
            url = a["browser_download_url"]
            sha = calculate_hash(url)
            content = (
                content
                + """
    http_archive(
        name = "mac_geckodriver",
        url = "%s",
        sha256 = "%s",
        build_file_content = \"\"\"
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["geckodriver"])

js_library(
    name = "geckodriver-js",
    data = ["geckodriver"],
)
\"\"\",
    )
"""
                % (url, sha)
            )
    return content


def firefox():
    firefox_versions = json.loads(firefox_version_data())

    latest_firefox = firefox_versions["LATEST_FIREFOX_VERSION"]
    sha_linux = calculate_hash(firefox_linux(latest_firefox))
    sha_mac = calculate_hash(firefox_mac(latest_firefox))
    content = print_firefox(latest_firefox, "", sha_linux, sha_mac)

    beta_firefox = firefox_versions["LATEST_FIREFOX_RELEASED_DEVEL_VERSION"]
    if latest_firefox != beta_firefox:
        sha_linux = calculate_hash(firefox_linux(beta_firefox))
        sha_mac = calculate_hash(firefox_mac(beta_firefox))
    return content + print_firefox(beta_firefox, "beta_", sha_linux, sha_mac)


def firefox_version_data():
    versions = http.request("GET", "https://product-details.mozilla.org/1.0/firefox_versions.json")
    return versions.data


def firefox_linux(version):
    return "https://ftp.mozilla.org/pub/firefox/releases/%s/linux-x86_64/en-US/firefox-%s.tar.bz2" % (version, version)


def firefox_mac(version):
    return "https://ftp.mozilla.org/pub/firefox/releases/%s/mac/en-US/Firefox%%20%s.dmg" % (version, version)


def print_firefox(version, workspace_name, sha_linux, sha_mac):
    content = ""

    content = (
        content
        + f"""    http_archive(
        name = "linux_{workspace_name}firefox",
        url = "{firefox_linux(version)}",
        sha256 = "{sha_linux}",
        build_file_content = \"\"\"
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
\"\"\",
    )

"""
    )

    content = (
        content
        + f"""    dmg_archive(
        name = "mac_{workspace_name}firefox",
        url = "{firefox_mac(version)}",
        sha256 = "{sha_mac}",
        build_file_content = \"\"\"
load("@aspect_rules_js//js:defs.bzl", "js_library")
package(default_visibility = ["//visibility:public"])

exports_files(["Firefox.app"])

js_library(
    name = "firefox-js",
    data = glob(["Firefox.app/**/*"]),
)
\"\"\",
    )

"""
    )

    return content


if __name__ == "__main__":
    content = """# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:deb_archive.bzl", "deb_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers(name = "local_drivers")

"""
    content = content + firefox()
    content = content + geckodriver()
    content = content + edge()
    content = content + edgedriver()
    chrome_milestone = get_chrome_milestone()
    content = content + chrome(chrome_milestone)
    content = content + chromedriver(chrome_milestone)
    content += """
def _pin_browsers_extension_impl(_ctx):
    pin_browsers()

pin_browsers_extension = module_extension(
    implementation = _pin_browsers_extension_impl,
)
"""

    current_script_dir = Path(os.path.realpath(__file__)).parent
    target_file_path = current_script_dir.parent / "common/repositories.bzl"

    with open(target_file_path, "w") as file:
        file.write(content)
