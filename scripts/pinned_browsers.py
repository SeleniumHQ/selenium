#!/usr/bin/env python

import hashlib
import json
import urllib3

from packaging.version import LegacyVersion

# Find the current stable versions of each browser we
# support and the sha256 of these. That's useful for
# updating `//common:repositories.bzl`

http = urllib3.PoolManager()

def calculate_hash(url):
    h = hashlib.sha256()
    r = http.request('GET', url, preload_content=False)
    for b in iter(lambda: r.read(4096), b""):
        h.update(b)
    return h.hexdigest()

def get_chrome_milestone():
    channel = "Stable"
    r = http.request('GET', f'https://chromiumdash.appspot.com/fetch_releases?channel={channel}&num=1&platform=Mac,Linux')
    all_versions = json.loads(r.data)
    # use the same milestone for all chrome releases, so pick the lowest
    milestone = min([version["milestone"] for version in all_versions if version["milestone"]])
    r = http.request('GET', 'https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json')
    versions = json.loads(r.data)["versions"]

    return sorted(
        filter(lambda v: v['version'].split('.')[0] == str(milestone), versions),
        key=lambda v: LegacyVersion(v['version'])
    )[-1]

def chromedriver():
    content = ""

    selected_version = get_chrome_milestone()

    drivers = selected_version["downloads"]["chromedriver"]

    linux = [d["url"] for d in drivers if d["platform"] == "linux64"][0]
    sha = calculate_hash(linux)

    content = content + """
    http_archive(
        name = "linux_chromedriver",
        url = "%s",
        sha256 = "%s",
        strip_prefix = "chromedriver-linux64",
        build_file_content = "exports_files([\\"chromedriver\\"])",
    )
    """ % (linux, sha)

    mac = [d["url"] for d in drivers if d["platform"] == "mac-x64"][0]
    sha = calculate_hash(mac)
    content = content + """
    http_archive(
        name = "mac_chromedriver",
        url = "%s",
        sha256 = "%s",
        strip_prefix = "chromedriver-mac-x64",
        build_file_content = "exports_files([\\"chromedriver\\"])",
    )
    """ % (mac, sha)

    return content

def chrome():
    selected_version = get_chrome_milestone()

    chrome_downloads = selected_version["downloads"]["chrome"]

    linux = [d["url"] for d in chrome_downloads if d["platform"] == "linux64"][0]
    sha = calculate_hash(linux)

    content = """
    http_archive(
        name = "linux_chrome",
        url = "%s",
        sha256 = "%s",
        build_file_content = \"\"\"
filegroup(
    name = "files",
    srcs = glob(["**/*"]),
    visibility = ["//visibility:public"],
)

exports_files(
    ["chrome-linux64/chrome"],
)
\"\"\",
    )

""" % (linux, sha)

    mac = [d["url"] for d in chrome_downloads if d["platform"] == "mac-x64"][0]
    sha = calculate_hash(mac)

    content += """
    http_archive(
        name = "mac_chrome",
        url = "%s",
        sha256 = "%s",
        strip_prefix = "chrome-mac-x64",
        patch_cmds = [
            "mv 'Google Chrome for Testing.app' Chrome.app",
            "mv 'Chrome.app/Contents/MacOS/Google Chrome for Testing' Chrome.app/Contents/MacOS/Chrome",
        ],
        build_file_content = "exports_files([\\"Chrome.app\\"])",
    )

""" % (mac, sha)

    return content

def edge():
    r = http.request('GET', 'https://edgeupdates.microsoft.com/api/products')
    all_data = json.loads(r.data)

    edge = None
    hash = None
    version = None

    for data in all_data:
        if not "Stable" == data.get("Product"):
            continue
        for release in data["Releases"]:
            if "MacOS" == release.get("Platform"):
                for artifact in release["Artifacts"]:
                    if "pkg" == artifact["ArtifactName"]:
                        edge = artifact["Location"]
                        hash = artifact["Hash"]
                        version = release["ProductVersion"]

    if edge and hash:
        return """
    pkg_archive(
        name = "mac_edge",
        url = "%s",
        sha256 = "%s",
        move = {
            "MicrosoftEdge-%s.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\\"Edge.app\\"])",
    )
""" % (edge, hash.lower(), version)

    return ""

def edgedriver():
    r = http.request('GET', 'https://msedgedriver.azureedge.net/LATEST_STABLE')
    v = r.data.decode('utf-16').strip()

    content = ""

    linux = "https://msedgedriver.azureedge.net/%s/edgedriver_linux64.zip" % v
    sha = calculate_hash(linux)
    content = content + """
    http_archive(
        name = "linux_edgedriver",
        url = "%s",
        sha256 = "%s",
        build_file_content = "exports_files([\\"msedgedriver\\"])",
    )
    """ % (linux, sha)

    mac = "https://msedgedriver.azureedge.net/%s/edgedriver_mac64.zip" % v
    sha = calculate_hash(mac)
    content = content + """
    http_archive(
        name = "mac_edgedriver",
        url = "%s",
        sha256 = "%s",
        build_file_content = "exports_files([\\"msedgedriver\\"])",
    )
    """ % (mac, sha)
    return content

def geckodriver():
    content = ""

    r = http.request('GET', 'https://api.github.com/repos/mozilla/geckodriver/releases/latest')
    for a in json.loads(r.data)['assets']:
        if a['name'].endswith('-linux64.tar.gz'):
            url = a['browser_download_url']
            sha = calculate_hash(url)
            content = content + \
                  """
    http_archive(
        name = "linux_geckodriver",
        url = "%s",
        sha256 = "%s",
        build_file_content = "exports_files([\\"geckodriver\\"])",
    )
    """ % (url, sha)

        if a['name'].endswith('-macos.tar.gz'):
            url = a['browser_download_url']
            sha = calculate_hash(url)
            content = content + \
                  """
    http_archive(
        name = "mac_geckodriver",
        url = "%s",
        sha256 = "%s",
        build_file_content = "exports_files([\\"geckodriver\\"])",
    )
        """ % (url, sha)
    return content

def firefox(version_key, workspace_name):
    r = http.request('GET', 'https://product-details.mozilla.org/1.0/firefox_versions.json')
    v = json.loads(r.data)[version_key]

    content = ""

    linux = "https://ftp.mozilla.org/pub/firefox/releases/%s/linux-x86_64/en-US/firefox-%s.tar.bz2" % (v, v)
    sha = calculate_hash(linux)
    content = content + f"""
    http_archive(
        name = "linux_{workspace_name}firefox",
        url = "{linux}",
        sha256 = "{sha}",
        build_file_content = \"\"\"
filegroup(
    name = "files",
    srcs = glob(["**/*"]),
    visibility = ["//visibility:public"],
)

exports_files(
    ["firefox/firefox"],
)
\"\"\",
    )

"""

    mac = "https://ftp.mozilla.org/pub/firefox/releases/%s/mac/en-US/Firefox%%20%s.dmg" % (v, v)
    sha = calculate_hash(mac)
    content = content + f"""
    dmg_archive(
        name = "mac_{workspace_name}firefox",
        url = "{mac}",
        sha256 = "{sha}",
        build_file_content = "exports_files([\\"Firefox.app\\"])",
    )

"""

    return content

if __name__ == '__main__':
    content = """
# This file has been generated using `bazel run scripts:pinned_browsers`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:dmg_archive.bzl", "dmg_archive")
load("//common/private:drivers.bzl", "local_drivers")
load("//common/private:pkg_archive.bzl", "pkg_archive")

def pin_browsers():
    local_drivers()
"""
    content = content + firefox("LATEST_FIREFOX_VERSION", "")
    content = content + firefox("LATEST_FIREFOX_RELEASED_DEVEL_VERSION", "beta_")
    content = content + firefox("FIREFOX_DEVEDITION", "dev_")
    content = content + geckodriver()
    content = content + edge()
    content = content + edgedriver()
    content = content + chrome()
    content = content + chromedriver()

    print(content)
