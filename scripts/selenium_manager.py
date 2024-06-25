#!/usr/bin/env python

import json
import os
from pathlib import Path

import urllib3

# Get latest version of selenium manager with sha256 values
# updates `//common:selenium_manager.bzl`

http = urllib3.PoolManager()


def get_url():
    r = http.request(
        "GET", f"https://github.com/SeleniumHQ/selenium_manager_artifacts/releases/latest"
    )
    return r.url.replace("tag", "download")


def get_sha_json():
    r = http.request("GET", f"https://raw.githubusercontent.com/SeleniumHQ/selenium_manager_artifacts/trunk/latest.json")
    return json.loads(r.data)


def print_linux(base_url, sha):
    return ("""    http_file(
        name = "download_sm_linux",
        executable = True,
        sha256 = "%s",
        url = "%s",
    )

"""
            % (sha, base_url + "/selenium-manager-linux")
            )


def print_macos(base_url, sha):
    return ("""    http_file(
        name = "download_sm_macos",
        executable = True,
        sha256 = "%s",
        url = "%s",
    )

"""
            % (sha, base_url + "/selenium-manager-macos")
            )


def print_windows(base_url, sha):
    return ("""    http_file(
        name = "download_sm_windows",
        executable = True,
        sha256 = "%s",
        url = "%s",
    )
"""
            % (sha, base_url + "/selenium-manager-windows.exe")
            )


if __name__ == "__main__":
    content = """# This file has been generated using `bazel run scripts:selenium_manager`

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_file")

def selenium_manager():
"""
    base_url = get_url()
    sha_dict = get_sha_json()
    content = content + print_linux(base_url, sha_dict['linux'])
    content = content + print_macos(base_url, sha_dict['macos'])
    content = content + print_windows(base_url, sha_dict['windows'])
    content += """
def _selenium_manager_artifacts_impl(_ctx):
    selenium_manager()

selenium_manager_artifacts = module_extension(
    implementation = _selenium_manager_artifacts_impl,
)
"""

    current_script_dir = Path(os.path.realpath(__file__)).parent
    target_file_path = current_script_dir.parent / "common/selenium_manager.bzl"

    with open(target_file_path, "w") as file:
        file.write(content)
