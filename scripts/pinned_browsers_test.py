#!/usr/bin/env python

import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
repositories = (root / "common/repositories.bzl").read_text()
versions = (root / "java/src/org/openqa/selenium/devtools/versions.bzl").read_text()

chrome_versions = set(
    re.findall(
        r'name = "(?:linux|mac)_chrome",\s+url = "[^"]+/(\d+)\.[^"]+/(?:linux64|mac-arm64)/chrome-[^"]+\.zip"',
        repositories,
    )
)
devtools_versions = set(re.findall(r'"v(\d+)"', versions))
unmatched_chrome_versions = chrome_versions - devtools_versions

if unmatched_chrome_versions:
    raise AssertionError(
        f"Stable pinned Chrome versions {sorted(chrome_versions)} must be present in "
        "CDP_VERSIONS; found {sorted(devtools_versions)}. "
    )
