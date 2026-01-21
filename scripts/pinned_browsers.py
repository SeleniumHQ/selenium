#!/usr/bin/env python

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


def get_chrome_info_for_channel(channel):
    r = http.request(
        "GET",
        f"https://chromiumdash.appspot.com/fetch_releases?channel={channel}&num=1&platform=Mac,Linux",
    )
    all_versions = json.loads(r.data)
    # use the same milestone for all chrome releases, so pick the lowest
    milestone = min(
        [version["milestone"] for version in all_versions if version["milestone"]]
    )
    r = http.request(
        "GET",
        "https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json",
    )
    versions = json.loads(r.data)["versions"]

    return sorted(
        filter(lambda v: v["version"].split(".")[0] == str(milestone), versions),
        key=lambda v: parse(v["version"]),
    )[-1]


def chromedriver(selected_version, workspace_prefix=""):
    content = ""

    drivers = selected_version["downloads"]["chromedriver"]

    url = [d["url"] for d in drivers if d["platform"] == "linux64"][0]
    sha = calculate_hash(url)

    content += f"""    http_archive(
        name = "linux_{workspace_prefix}chromedriver",
        url = "{url}",
        sha256 = "{sha}",
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

    url = [d["url"] for d in drivers if d["platform"] == "mac-arm64"][0]
    sha = calculate_hash(url)

    content += f"""
    http_archive(
        name = "mac_{workspace_prefix}chromedriver",
        url = "{url}",
        sha256 = "{sha}",
        strip_prefix = "chromedriver-mac-arm64",
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

    return content


def chrome(selected_version, workspace_prefix=""):
    content = ""
    chrome_downloads = selected_version["downloads"]["chrome"]

    url = [d["url"] for d in chrome_downloads if d["platform"] == "linux64"][0]
    sha = calculate_hash(url)

    content += f"""
    http_archive(
        name = "linux_{workspace_prefix}chrome",
        url = "{url}",
        sha256 = "{sha}",
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
"""

    url = [d["url"] for d in chrome_downloads if d["platform"] == "mac-arm64"][0]
    sha = calculate_hash(url)  # Calculate SHA for Mac chrome

    content += f"""    http_archive(
        name = "mac_{workspace_prefix}chrome",
        url = "{url}",
        sha256 = "{sha}",
        strip_prefix = "chrome-mac-arm64",
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
"""

    return content


def convert_keys_to_lowercase(obj):
    if isinstance(obj, dict):
        return {k.lower(): convert_keys_to_lowercase(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_keys_to_lowercase(i) for i in obj]
    else:
        return obj


def case_insensitive_json_loads(json_str):
    data = json.loads(json_str)
    return convert_keys_to_lowercase(data)


def get_edge_versions(platform):
    """Fetch all available Edge browser versions for a platform from enterprise API."""
    r = http.request(
        "GET", "https://edgeupdates.microsoft.com/api/products?view=enterprise"
    )
    all_data = case_insensitive_json_loads(r.data)

    platform_name = "MacOS" if platform == "mac" else "Linux"
    artifact_name = "pkg" if platform == "mac" else "deb"

    versions = []
    for data in all_data:
        if data.get("product") != "Stable":
            continue
        for release in data["releases"]:
            if release.get("platform") != platform_name:
                continue
            for artifact in release["artifacts"]:
                if artifact["artifactname"] == artifact_name:
                    versions.append(
                        {
                            "url": artifact["location"],
                            "hash": artifact["hash"],
                            "version": release["productversion"],
                        }
                    )
    return versions


def get_edgedriver_version(major, platform):
    """Get the latest EdgeDriver version for a given major version and platform."""
    platform_suffix = "LINUX" if platform == "linux" else "MACOS"
    r = http.request(
        "GET",
        f"https://msedgedriver.microsoft.com/LATEST_RELEASE_{major}_{platform_suffix}",
    )
    if r.status != 200:
        return None
    return r.data.decode("utf-16").strip()


def get_edgedriver_url(version, platform):
    """Get EdgeDriver download URL if it exists."""
    if platform == "linux":
        url = f"https://msedgedriver.microsoft.com/{version}/edgedriver_linux64.zip"
    else:
        url = f"https://msedgedriver.microsoft.com/{version}/edgedriver_mac64_m1.zip"
    r = http.request("HEAD", url)
    return url if r.status == 200 else None


def find_matching_edge_version(platform):
    """Find the latest Edge version where both browser and driver are available."""
    browsers = get_edge_versions(platform)

    # Sort by version descending (newest first)
    browsers.sort(key=lambda x: parse(x["version"]), reverse=True)

    for browser in browsers:
        major = browser["version"].split(".")[0]
        driver_version = get_edgedriver_version(major, platform)
        if not driver_version:
            print(f"  No driver for {platform} major version {major}", file=sys.stderr)
            continue

        driver_url = get_edgedriver_url(driver_version, platform)
        if not driver_url:
            print(
                f"  Driver {driver_version} not downloadable for {platform}",
                file=sys.stderr,
            )
            continue

        print(
            f"  Found match: browser={browser['version']}, driver={driver_version}",
            file=sys.stderr,
        )
        return {
            "browser": browser,
            "driver_version": driver_version,
            "driver_url": driver_url,
        }

    return None


def mac_edge_browser_content(browser_url, browser_hash, browser_version):
    """Generate Bazel content for Mac Edge browser."""
    return """
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
""" % (browser_url, browser_hash.lower(), browser_version)


def linux_edge_browser_content(browser_url, browser_hash):
    """Generate Bazel content for Linux Edge browser."""
    return """
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
""" % (browser_url, browser_hash.lower())


def edge_and_edgedriver():
    """Fetch Edge browser and EdgeDriver, ensuring versions are compatible."""
    matches = {}

    for platform in ["mac", "linux"]:
        print(f"Finding matching Edge version for {platform}...", file=sys.stderr)
        match = find_matching_edge_version(platform)
        if match:
            matches[platform] = match
        else:
            print(
                f"Warning: No matching Edge browser/driver found for {platform}",
                file=sys.stderr,
            )

    content = ""

    # Output browsers first: mac, then linux
    if "mac" in matches:
        browser = matches["mac"]["browser"]
        content += mac_edge_browser_content(
            browser["url"], browser["hash"], browser["version"]
        )

    if "linux" in matches:
        browser = matches["linux"]["browser"]
        content += linux_edge_browser_content(browser["url"], browser["hash"])

    # Output drivers: linux, then mac
    if "linux" in matches:
        content += edgedriver_content(
            "linux_edgedriver", matches["linux"]["driver_url"]
        )

    if "mac" in matches:
        content += edgedriver_content("mac_edgedriver", matches["mac"]["driver_url"])

    return content


def edgedriver_content(name, driver_url):
    """Generate Bazel content for EdgeDriver."""
    driver_sha = calculate_hash(driver_url)
    return """
    http_archive(
        name = "%s",
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
""" % (name, driver_url, driver_sha)


def geckodriver():
    content = ""

    r = http.request(
        "GET", "https://api.github.com/repos/mozilla/geckodriver/releases/latest"
    )
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

        if a["name"].endswith("-macos-aarch64.tar.gz"):
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
    versions = http.request(
        "GET", "https://product-details.mozilla.org/1.0/firefox_versions.json"
    )
    return versions.data


def firefox_linux(version):
    if int(version.split(".")[0]) < 135:
        return (
            "https://ftp.mozilla.org/pub/firefox/releases/%s/linux-x86_64/en-US/firefox-%s.tar.bz2"
            % (version, version)
        )
    else:
        return (
            "https://ftp.mozilla.org/pub/firefox/releases/%s/linux-x86_64/en-US/firefox-%s.tar.xz"
            % (version, version)
        )


def firefox_mac(version):
    return (
        "https://ftp.mozilla.org/pub/firefox/releases/%s/mac/en-US/Firefox%%20%s.dmg"
        % (version, version)
    )


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
    content = content + edge_and_edgedriver()

    # Stable Chrome
    stable_chrome_info = get_chrome_info_for_channel(channel="Stable")
    content = content + chrome(stable_chrome_info, workspace_prefix="")
    content = content + chromedriver(stable_chrome_info, workspace_prefix="")

    # Beta Chrome
    beta_chrome_info = get_chrome_info_for_channel(channel="Beta")
    content = content + chrome(beta_chrome_info, workspace_prefix="beta_")
    content = content + chromedriver(beta_chrome_info, workspace_prefix="beta_")

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
