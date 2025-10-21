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

import base64
import os
import shutil
import tempfile

import pytest
from python.runfiles import Runfiles

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait

EXTENSION_ID = "webextensions-selenium-example-v3@example.com"
EXTENSION_PATH = "webextensions-selenium-example-signed"
EXTENSION_ARCHIVE_PATH = "webextensions-selenium-example.xpi"

# Use bazel Runfiles to locate the test extension directory
r = Runfiles.Create()
extensions = r.Rlocation("selenium/py/test/extensions")


def install_extension(driver, **kwargs):
    result = driver.webextension.install(**kwargs)
    assert result.get("extension") == EXTENSION_ID
    return result


def verify_extension_injection(driver, pages):
    pages.load("blank.html")
    injected = WebDriverWait(driver, timeout=2).until(
        lambda dr: dr.find_element(By.ID, "webextensions-selenium-example")
    )
    assert injected.text == "Content injected by webextensions-selenium-example"


def uninstall_extension_and_verify_extension_uninstalled(driver, extension_info):
    driver.webextension.uninstall(extension_info)

    context_id = driver.current_window_handle
    driver.browsing_context.reload(context_id)
    assert len(driver.find_elements(By.ID, "webextensions-selenium-example")) == 0


def test_webextension_initialized(driver):
    """Test that the webextension module is initialized properly."""
    assert driver.webextension is not None


@pytest.mark.xfail_chrome
@pytest.mark.xfail_edge
class TestFirefoxWebExtension:
    """Firefox-specific WebExtension tests."""

    def test_install_extension_path(self, driver, pages):
        """Test installing an extension from a directory path."""

        path = os.path.join(extensions, EXTENSION_PATH)
        ext_info = install_extension(driver, path=path)
        verify_extension_injection(driver, pages)
        uninstall_extension_and_verify_extension_uninstalled(driver, ext_info)

    def test_install_archive_extension_path(self, driver, pages):
        """Test installing an extension from an archive path."""

        path = os.path.join(extensions, EXTENSION_ARCHIVE_PATH)
        ext_info = install_extension(driver, archive_path=path)
        verify_extension_injection(driver, pages)
        uninstall_extension_and_verify_extension_uninstalled(driver, ext_info)

    def test_install_base64_extension_path(self, driver, pages):
        """Test installing an extension from a base64 encoded string."""

        path = os.path.join(extensions, EXTENSION_ARCHIVE_PATH)
        with open(path, "rb") as file:
            base64_encoded = base64.b64encode(file.read()).decode("utf-8")
        ext_info = install_extension(driver, base64_value=base64_encoded)
        # TODO: the extension is installed but the script is not injected, check and fix
        # verify_extension_injection(driver, pages)
        uninstall_extension_and_verify_extension_uninstalled(driver, ext_info)

    def test_install_unsigned_extension(self, driver, pages):
        """Test installing an unsigned extension."""

        path = os.path.join(extensions, "webextensions-selenium-example")
        ext_info = install_extension(driver, path=path)
        verify_extension_injection(driver, pages)
        uninstall_extension_and_verify_extension_uninstalled(driver, ext_info)

    def test_install_with_extension_id_uninstall(self, driver, pages):
        """Test uninstalling an extension using just the extension ID."""

        path = os.path.join(extensions, EXTENSION_PATH)
        ext_info = install_extension(driver, path=path)
        extension_id = ext_info.get("extension")
        # Uninstall using the extension ID
        uninstall_extension_and_verify_extension_uninstalled(driver, extension_id)


@pytest.mark.xfail_firefox
class TestChromiumWebExtension:
    """Chrome/Edge-specific WebExtension tests with custom driver."""

    @pytest.fixture
    def pages_chromium(self, webserver, chromium_driver):
        class Pages:
            def load(self, name):
                chromium_driver.get(webserver.where_is(name, localhost=False))

        return Pages()

    @pytest.fixture
    def chromium_driver(self, chromium_options, request):
        """Create a Chrome/Edge driver with webextension support enabled."""
        driver_option = request.config.option.drivers[0].lower()

        if driver_option == "chrome":
            browser_class = webdriver.Chrome
            browser_service = webdriver.ChromeService
        elif driver_option == "edge":
            browser_class = webdriver.Edge
            browser_service = webdriver.EdgeService

        temp_dir = tempfile.mkdtemp(prefix="chromium-profile-")

        chromium_options.enable_bidi = True
        chromium_options.enable_webextensions = True
        chromium_options.add_argument(f"--user-data-dir={temp_dir}")
        chromium_options.add_argument("--no-sandbox")
        chromium_options.add_argument("--disable-dev-shm-usage")

        binary = request.config.option.binary
        if binary:
            chromium_options.binary_location = binary

        executable = request.config.option.executable
        if executable:
            service = browser_service(executable_path=executable)
        else:
            service = browser_service()

        chromium_driver = browser_class(options=chromium_options, service=service)

        yield chromium_driver
        chromium_driver.quit()

        # delete the temp directory
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

    def test_install_extension_path(self, chromium_driver, pages_chromium):
        """Test installing an extension from a directory path."""
        path = os.path.join(extensions, EXTENSION_PATH)
        ext_info = chromium_driver.webextension.install(path=path)

        verify_extension_injection(chromium_driver, pages_chromium)
        uninstall_extension_and_verify_extension_uninstalled(chromium_driver, ext_info)

    def test_install_unsigned_extension(self, chromium_driver, pages_chromium):
        """Test installing an unsigned extension."""
        path = os.path.join(extensions, "webextensions-selenium-example")
        ext_info = chromium_driver.webextension.install(path=path)

        verify_extension_injection(chromium_driver, pages_chromium)
        uninstall_extension_and_verify_extension_uninstalled(chromium_driver, ext_info)

    def test_install_with_extension_id_uninstall(self, chromium_driver):
        """Test uninstalling an extension using just the extension ID."""
        path = os.path.join(extensions, EXTENSION_PATH)
        ext_info = chromium_driver.webextension.install(path=path)
        extension_id = ext_info.get("extension")
        # Uninstall using the extension ID
        uninstall_extension_and_verify_extension_uninstalled(chromium_driver, extension_id)
