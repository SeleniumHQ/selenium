#!/usr/bin/env python

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import urllib3
from packaging.version import parse

http = urllib3.PoolManager()
root_dir = Path(os.path.realpath(__file__)).parent.parent


def get_chrome_milestone():
    """This is the same method from pinned_browser. Use --chrome_channel=Beta if
    using early stable release."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--chrome_channel", default="Stable", help="Set the Chrome channel")
    args = parser.parse_args()
    channel = args.chrome_channel

    r = http.request(
        "GET", f"https://chromiumdash.appspot.com/fetch_releases?channel={channel}&num=1&platform=Mac,Linux"
    )
    all_versions = json.loads(r.data)
    # use the same milestone for all Chrome releases, so pick the lowest
    milestone = min([version["milestone"] for version in all_versions if version["milestone"]])
    r = http.request(
        "GET", "https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json"
    )
    versions = json.loads(r.data)["versions"]

    return sorted(
        filter(lambda v: v["version"].split(".")[0] == str(milestone), versions), key=lambda v: parse(v["version"])
    )[-1]


def fetch_and_save(url, file_path):
    response = http.request("GET", url)
    with open(file_path, "wb") as file:
        file.write(response.data)


def new_chrome(chrome_milestone):
    return chrome_milestone["version"].split(".")[0]


def previous_chrome(chrome_milestone):
    return str(int(new_chrome(chrome_milestone)) - 1)


def old_chrome(chrome_milestone):
    return str(int(new_chrome(chrome_milestone)) - 3)


def add_pdls(chrome_milestone):
    source_dir = root_dir / f"common/devtools/chromium/v{previous_chrome(chrome_milestone)}"
    target_dir = root_dir / f"common/devtools/chromium/v{new_chrome(chrome_milestone)}"
    old_dir = root_dir / f"common/devtools/chromium/v{old_chrome(chrome_milestone)}"

    if os.path.isdir(old_dir):
        shutil.rmtree(old_dir)

    if not os.path.isdir(target_dir):
        os.makedirs(target_dir, exist_ok=True)
        if os.path.isdir(source_dir):
            shutil.copytree(source_dir, target_dir, dirs_exist_ok=True)

        fetch_and_save(
            f"https://raw.githubusercontent.com/chromium/chromium/{chrome_milestone['version']}/third_party/blink/public/devtools_protocol/browser_protocol.pdl",
            f"{target_dir}/browser_protocol.pdl",
        )

        deps_content = http.request(
            "GET", f"https://raw.githubusercontent.com/chromium/chromium/{chrome_milestone['version']}/DEPS"
        ).data.decode("utf-8")
        v8_revision = [line for line in deps_content.split("\n") if "v8_revision" in line][0].split(": ")[1].strip("',")
        fetch_and_save(
            f"https://raw.githubusercontent.com/v8/v8/{v8_revision}/include/js_protocol.pdl",
            f"{target_dir}/js_protocol.pdl",
        )

        # javadocs does not like script tags
        with open(f"{target_dir}/browser_protocol.pdl", "r+") as file:
            script_replace = file.read().replace("`<script>`", "`script`")
            file.seek(0)
            file.write(script_replace)
            file.truncate()

        subprocess.run(["git", "add", str(target_dir / "*")], cwd=root_dir)


def create_new_chrome_files(src_base, chrome_milestone):
    """Java and .NET need to copy previous version directory into new version
    directory."""
    source_dir = root_dir / f"{src_base}/v{previous_chrome(chrome_milestone)}"
    target_dir = root_dir / f"{src_base}/v{new_chrome(chrome_milestone)}"
    old_dir = root_dir / f"{src_base}/v{old_chrome(chrome_milestone)}"

    if old_dir.is_dir():
        shutil.rmtree(old_dir)

    if source_dir.is_dir() and any(source_dir.iterdir()):
        os.makedirs(target_dir, exist_ok=True)
        for item in source_dir.iterdir():
            shutil.copy(item, target_dir)

        for file in target_dir.iterdir():
            replace_in_file(file, previous_chrome(chrome_milestone), new_chrome(chrome_milestone))
            new_filename = file.name.replace(previous_chrome(chrome_milestone), new_chrome(chrome_milestone))
            file.rename(target_dir / new_filename)

    subprocess.run(["git", "add", str(target_dir / "*")], cwd=root_dir)


def replace_in_file(file_path, old_string, new_string, is_regex=False):
    with open(file_path, "r+") as file:
        if not is_regex:
            old_string = re.escape(old_string)
        data = re.sub(old_string, new_string, file.read())
        file.seek(0)
        file.write(data)
        file.truncate()


def update_java(chrome_milestone):
    create_new_chrome_files("java/src/org/openqa/selenium/devtools", chrome_milestone)

    files = [
        root_dir / "java/src/org/openqa/selenium/devtools/versions.bzl",
        root_dir / "Rakefile",
    ]
    for file in files:
        replace_in_file(file, old_chrome(chrome_milestone), new_chrome(chrome_milestone))


def update_dotnet(chrome_milestone):
    create_new_chrome_files("dotnet/src/webdriver/DevTools", chrome_milestone)

    files = [
        root_dir / "dotnet/selenium-dotnet-version.bzl",
        root_dir / "dotnet/src/webdriver/WebDriver.csproj",
        root_dir / "dotnet/src/webdriver/DevTools/DevToolsDomains.cs",
    ]
    for file in files:
        replace_in_file(file, old_chrome(chrome_milestone), new_chrome(chrome_milestone))

    files = [root_dir / "dotnet/test/common/CustomDriverConfigs/StableChannelChromeDriver.cs"]
    dir_path = root_dir / "dotnet/test/common/DevTools"
    files.extend(str(file) for file in dir_path.glob("*") if file.is_file())
    for file in files:
        replace_in_file(file, previous_chrome(chrome_milestone), new_chrome(chrome_milestone))


def update_ruby(chrome_milestone):
    file = root_dir / "rb/lib/selenium/devtools/BUILD.bazel"
    replace_in_file(file, old_chrome(chrome_milestone), new_chrome(chrome_milestone))

    file = root_dir / "rb/lib/selenium/devtools/version.rb"
    replace_in_file(file, rf"{previous_chrome(chrome_milestone)}\.[0-9]*", f"{new_chrome(chrome_milestone)}.0", True)

    subprocess.run(["bundle", "install"], cwd=root_dir / "rb", check=True)

def update_python(chrome_milestone):
    file = root_dir / "py/BUILD.bazel"
    replace_in_file(file, old_chrome(chrome_milestone), new_chrome(chrome_milestone))


def update_js(chrome_milestone):
    file = root_dir / "javascript/node/selenium-webdriver/BUILD.bazel"
    replace_in_file(file, old_chrome(chrome_milestone), new_chrome(chrome_milestone))


if __name__ == "__main__":
    chrome_milestone = get_chrome_milestone()
    add_pdls(chrome_milestone)
    update_java(chrome_milestone)
    update_dotnet(chrome_milestone)
    update_ruby(chrome_milestone)
    update_python(chrome_milestone)
    update_js(chrome_milestone)

    print(f"adding CDP {new_chrome(chrome_milestone)} and removing {old_chrome(chrome_milestone)}")
