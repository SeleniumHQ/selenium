# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import os
import sys

import pytest

from selenium import webdriver
from selenium.webdriver.common.driver_finder import DriverFinder

from conftest import _resolve_bazel_path


@pytest.fixture
def browser_name(request):
    drivers = request.config.option.drivers
    if not drivers:
        pytest.skip("Selenium Manager tests require a single --driver/--browser")
    return drivers[0].lower()


@pytest.fixture
def pinned(request):
    return bool(request.config.option.executable)


@pytest.fixture
def driver_finder(browser_name, request):
    module = getattr(webdriver, browser_name)

    options = module.options.Options()
    if request.config.option.binary:
        options.binary_location = _resolve_bazel_path(request.config.option.binary).strip("'")

    executable = request.config.option.executable
    service = module.service.Service(executable_path=_resolve_bazel_path(executable).strip("'") if executable else None)

    return DriverFinder(service, options)


def test_resolves_an_executable_driver_path(driver_finder):
    path = driver_finder.get_driver_path()
    assert os.path.isfile(path), f"driver path is not a file: {path}"
    assert os.access(path, os.X_OK), f"driver path is not executable: {path}"


def test_resolves_an_executable_browser_path(driver_finder, pinned):
    if pinned:
        pytest.skip("Pinned runs supply the browser via options; Selenium Manager is not consulted")
    path = driver_finder.get_browser_path()
    assert os.path.isfile(path), f"browser path is not a file: {path}"
    assert os.access(path, os.X_OK), f"browser path is not executable: {path}"


def test_downloads_the_driver_into_the_selenium_cache(driver_finder, browser_name, pinned, tmp_path, monkeypatch):
    if pinned:
        pytest.skip("Pinned runs do not use Selenium Manager")
    if browser_name == "safari":
        pytest.skip("Safari driver ships with the OS")
    monkeypatch.setenv("SE_CACHE_PATH", str(tmp_path))
    monkeypatch.setenv("SE_SKIP_DRIVER_IN_PATH", "true")
    # Match by basename so 8.3 short names on Windows don't fail the comparison.
    assert tmp_path.name in driver_finder.get_driver_path()


def test_downloads_the_browser_into_the_selenium_cache(driver_finder, browser_name, pinned, tmp_path, monkeypatch):
    if pinned:
        pytest.skip("Pinned runs do not use Selenium Manager")
    if browser_name == "safari":
        pytest.skip("Safari ships with the OS")
    if browser_name == "edge" and sys.platform == "win32":
        pytest.skip("Edge MSI installer always writes to the system path")
    monkeypatch.setenv("SE_CACHE_PATH", str(tmp_path))
    monkeypatch.setenv("SE_FORCE_BROWSER_DOWNLOAD", "true")
    assert tmp_path.name in driver_finder.get_browser_path()


def test_resolves_the_browser_to_its_system_install_location(
    driver_finder, browser_name, pinned, tmp_path, monkeypatch
):
    if pinned:
        pytest.skip("Pinned runs do not use Selenium Manager")
    system_only = browser_name == "safari" or (browser_name == "edge" and sys.platform == "win32")
    if not system_only:
        pytest.skip("Only Safari and Windows Edge resolve to a system install location")
    monkeypatch.setenv("SE_CACHE_PATH", str(tmp_path))
    monkeypatch.setenv("SE_FORCE_BROWSER_DOWNLOAD", "true")
    assert tmp_path.name not in driver_finder.get_browser_path()
