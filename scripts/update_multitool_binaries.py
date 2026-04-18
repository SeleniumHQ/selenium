#!/usr/bin/env python
"""Update tool binaries in a Bazel rules_multitool lockfile.

This script updates the version of tool binaries defined in a Bazel rules_multitool lockfile.
If the tool has binaries hosted in a public GitHub repo's Release assets, it will update the
lockfile's URL and hash to the latest versions, otherwise it will skip it.

See: https://github.com/theoremlp/rules_multitool

-----------------------------------------------------------------------------------------------------------
usage: update_multitool_binaries.py [-h] [--file LOCKFILE_PATH]

options:
  -h, --help            show this help message and exit
  --file LOCKFILE_PATH  path to multitool lockfile (defaults to 'multitool.lock.json' in workspace directory)
-----------------------------------------------------------------------------------------------------------
"""

import argparse
import json
import os
import re
import urllib.request


def run(lockfile_path):
    with open(lockfile_path) as f:
        data = json.load(f)

    for tool in [tool for tool in data if tool != "$schema"]:
        match = re.search(f"download/(.*?)/{tool}", data[tool]["binaries"][0]["url"])
        if match:
            version = match[1]
        else:
            continue
        match = re.search("github.com/(.*?)/releases", data[tool]["binaries"][0]["url"])
        if match:
            releases_url = f"https://api.github.com/repos/{match[1]}/releases/latest"
        else:
            continue
        try:
            with urllib.request.urlopen(releases_url) as response:
                json_resp = json.loads(response.read())
                new_version = json_resp["tag_name"]
                assets = json_resp["assets"]
        except Exception:
            continue
        if new_version != version:
            print(f"found new version of '{tool}': {new_version}")
            urls = [asset.get("browser_download_url") for asset in assets]
            hashes = [asset.get("digest").split(":")[1] for asset in assets]
            bare_version = version.lstrip("v")
            bare_new = new_version.lstrip("v")
            for binary in data[tool]["binaries"]:
                new_url = binary["url"].replace(version, new_version)
                new_file = binary["file"].replace(version, new_version)
                if bare_version != version:
                    new_url = new_url.replace(bare_version, bare_new)
                    new_file = new_file.replace(bare_version, bare_new)
                new_hash = hashes[urls.index(new_url)]
                binary["url"] = new_url
                binary["file"] = new_file
                binary["sha256"] = new_hash

    with open(lockfile_path, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")

    print(f"\ngenerated new '{lockfile_path}' with updated urls and hashes")


def main():
    parser = argparse.ArgumentParser()
    workspace_dir = os.environ.get("BUILD_WORKSPACE_DIRECTORY", os.getcwd())
    parser.add_argument(
        "--file",
        dest="lockfile_path",
        default=os.path.join(workspace_dir, "multitool.lock.json"),
        help="path to multitool lockfile (defaults to 'multitool.lock.json' in workspace directory)",
    )
    args = parser.parse_args()
    run(args.lockfile_path)


if __name__ == "__main__":
    main()
