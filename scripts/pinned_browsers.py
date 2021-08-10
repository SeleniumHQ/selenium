#!/usr/bin/env python

import codecs
import hashlib
import json
import urllib3

# Find the current stable versions of each browser we
# support and the sha256 of these. That's useful for
# updating `//commmon:repositories.bzl`

http = urllib3.PoolManager()

def calculate_hash(url):
    h = hashlib.sha256()
    r = http.request('GET', url, preload_content=False)
    for b in iter(lambda: r.read(4096), b""):
        h.update(b)
    return h.hexdigest()

def chromedriver():
    r = http.request('GET', 'https://chromedriver.storage.googleapis.com/LATEST_RELEASE')
    v = r.data.decode('utf-8')

    content = ""

    linux = 'https://chromedriver.storage.googleapis.com/%s/chromedriver_linux64.zip' % v
    sha = calculate_hash(linux)
    content = content + """
    http_archive(
        name = "linux_chromedriver",
        url = "%s",
        sha256 = "%s",
        build_file_content = "exports_files([\\"chromedriver\\"])",
    )
    """ % (linux, sha)

    mac = 'https://chromedriver.storage.googleapis.com/%s/chromedriver_mac64.zip' % v
    sha = calculate_hash(mac)
    content = content + """
    http_archive(
        name = "mac_chromedriver",
        url = "%s",
        sha256 = "%s",
        build_file_content = "exports_files([\\"chromedriver\\"])",
    )
    """ % (mac, sha)
    return content

def chrome():
    # Find the current latest stable revision
    r = http.request('GET', 'https://omahaproxy.appspot.com/all.json?channel=stable&os=linux')
    max_version = int(json.loads(r.data)[0]['versions'][0]['branch_base_position'])
    min_version = max_version - 1500

    # count down from most recent to a version which has something for everyone
    for v in range(max_version, min_version, -1):
        r = http.request(
            'HEAD',
            'https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/%s/chrome-linux.zip' % v)
        if r.status != 200:
            continue

        r = http.request(
            'HEAD',
            'https://storage.googleapis.com/chromium-browser-snapshots/Mac/%s/chrome-mac.zip' % v)
        if r.status != 200:
            continue

        content = ""

        linux = 'https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/%s/chrome-linux.zip' % v
        sha = calculate_hash(linux)

        content = content + """
    http_archive(
        name = "linux_chrome",
        url = "%s",
        sha256 = "%s",
        build_file_content = "exports_files([\\"chrome-linux\\"])",
    )
    """ % (linux, sha)

        mac = 'https://storage.googleapis.com/chromium-browser-snapshots/Mac/%s/chrome-mac.zip' % v
        sha = calculate_hash(mac)

        content = content + """
    http_archive(
        name = "mac_chrome",
        url = "%s",
        sha256 = "%s",
        strip_prefix = "chrome-mac",
        build_file_content = "exports_files([\\"Chromium.app\\"])",
    )
    """ % (mac, sha)

        return content
    raise RuntimeError("Cannot find stable chrome")

def edge():
    r = http.request('GET', 'https://msedgedriver.azureedge.net/LATEST_STABLE')
    v = r.data.decode('utf-16').strip()

    content = ""

    edge = "https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge-%s.pkg?platform=Mac&Consent=0&channel=Stable" % v
    sha = calculate_hash(edge)

    content = content + """
    pkg_archive(
        name = "mac_edge",
        url = "%s",
        sha256 = "%s",
        move = {
            "MicrosoftEdge-%s.pkg/Payload/Microsoft Edge.app": "Edge.app",
        },
        build_file_content = "exports_files([\\"Edge.app\\"])",
    )
    """ % (edge, sha, v)

    driver = "https://msedgedriver.azureedge.net/%s/edgedriver_mac64.zip" % v
    sha = calculate_hash(driver)

    content = content + """
    http_archive(
        name = "mac_edgedriver",
        url = "%s",
        sha256 = "%s",
        build_file_content = "exports_files([\\"msedgedriver\\"])",
    )
    """ % (driver, sha)

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

def firefox():
    r = http.request('GET', 'https://product-details.mozilla.org/1.0/firefox_versions.json')
    v = json.loads(r.data)['LATEST_FIREFOX_VERSION']

    content = ""

    linux = "https://ftp.mozilla.org/pub/firefox/releases/%s/linux-x86_64/en-US/firefox-%s.tar.bz2" % (v, v)
    sha = calculate_hash(linux)
    content = content + """
    http_archive(
        name = "linux_firefox",
        url = "%s",
        sha256 = "%s",
        build_file_content = "exports_files([\\"firefox\\"])",
    )
    """ % (linux, sha)

    mac = "https://ftp.mozilla.org/pub/firefox/releases/%s/mac/en-US/Firefox%%20%s.dmg" % (v, v)
    sha = calculate_hash(mac)
    content = content + """
    dmg_archive(
        name = "mac_firefox",
        url = "%s",
        sha256 = "%s",
        build_file_content = "exports_files([\\"Firefox.app\\"])",
    )
    """ % (mac, sha)

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
    content = content + firefox()
    content = content + geckodriver()
    content = content + edge()
    content = content + chrome()
    content = content + chromedriver()

    print(content)
