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

"""Driver-level install_web_extension / uninstall_web_extension.

The module-level `driver.webextension` commands are covered by
webextension_tests.py; these exercise the driver methods from
docs/decisions/17817-driver-extension-install.md.
"""

import base64
import os
import shutil
import tempfile

import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.web_extension import WebExtension
from selenium.webdriver.support.wait import WebDriverWait

from conftest import _resolve_bazel_path, get_extensions_location

EXTENSIONS = get_extensions_location()
EXTENSION_ID = "webextensions-selenium-example-v3@example.com"
EXTENSION_PATH = "webextensions-selenium-example-signed"
EXTENSION_ARCHIVE_PATH = "webextensions-selenium-example.xpi"


def verify_extension_injection(driver, pages):
    pages.load("blank.html")
    injected = WebDriverWait(driver, timeout=2).until(
        lambda dr: dr.find_element(By.ID, "webextensions-selenium-example")
    )
    assert injected.text == "Content injected by webextensions-selenium-example"


def verify_uninstalled(driver, extension):
    driver.uninstall_web_extension(extension)
    driver.browsing_context.reload(driver.current_window_handle)
    assert len(driver.find_elements(By.ID, "webextensions-selenium-example")) == 0


@pytest.mark.xfail_chrome
@pytest.mark.xfail_edge
class TestFirefoxDriverWebExtension:
    def test_install_from_directory(self, driver, pages):
        extension = driver.install_web_extension(os.path.join(EXTENSIONS, EXTENSION_PATH))

        assert isinstance(extension, WebExtension)
        assert extension.id == EXTENSION_ID
        verify_extension_injection(driver, pages)
        verify_uninstalled(driver, extension)

    def test_install_from_archive(self, driver, pages):
        extension = driver.install_web_extension(os.path.join(EXTENSIONS, EXTENSION_ARCHIVE_PATH))

        assert extension.id == EXTENSION_ID
        verify_extension_injection(driver, pages)
        verify_uninstalled(driver, extension)

    def test_install_from_base64(self, driver):
        with open(os.path.join(EXTENSIONS, EXTENSION_ARCHIVE_PATH), "rb") as archive:
            encoded = base64.b64encode(archive.read()).decode("utf-8")

        extension = driver.install_web_extension(encoded)

        assert extension.id == EXTENSION_ID
        driver.uninstall_web_extension(extension)

    def test_install_unsigned_from_directory(self, driver, pages):
        extension = driver.install_web_extension(
            os.path.join(EXTENSIONS, "webextensions-selenium-example")
        )

        assert extension.id == EXTENSION_ID
        verify_extension_injection(driver, pages)
        verify_uninstalled(driver, extension)

    def test_install_permanently_and_allow_private_browsing(self, driver, pages):
        extension = driver.install_web_extension(
            os.path.join(EXTENSIONS, EXTENSION_PATH),
            permanent=True,
            allow_private_browsing=True,
        )

        assert extension.id == EXTENSION_ID
        verify_extension_injection(driver, pages)
        verify_uninstalled(driver, extension)

    def test_uninstall_rejects_a_raw_id(self, driver):
        extension = driver.install_web_extension(os.path.join(EXTENSIONS, EXTENSION_PATH))
        try:
            with pytest.raises(TypeError):
                driver.uninstall_web_extension(extension.id)
        finally:
            driver.uninstall_web_extension(extension)


@pytest.mark.xfail_firefox
class TestChromiumDriverWebExtension:
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

        binary = _resolve_bazel_path(request.config.option.binary)
        if binary:
            chromium_options.binary_location = binary

        executable = _resolve_bazel_path(request.config.option.executable)
        if executable:
            service = browser_service(executable_path=executable)
        else:
            service = browser_service()

        chromium_driver = browser_class(options=chromium_options, service=service)

        yield chromium_driver
        chromium_driver.quit()

        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

    def test_install_from_directory(self, chromium_driver, pages_chromium):
        extension = chromium_driver.install_web_extension(os.path.join(EXTENSIONS, EXTENSION_PATH))

        assert isinstance(extension, WebExtension)
        verify_extension_injection(chromium_driver, pages_chromium)
        verify_uninstalled(chromium_driver, extension)

    def test_install_unsigned_from_directory(self, chromium_driver, pages_chromium):
        extension = chromium_driver.install_web_extension(
            os.path.join(EXTENSIONS, "webextensions-selenium-example")
        )

        verify_extension_injection(chromium_driver, pages_chromium)
        verify_uninstalled(chromium_driver, extension)

    def test_firefox_options_are_rejected(self, chromium_driver):
        with pytest.raises(ValueError):
            chromium_driver.install_web_extension(
                os.path.join(EXTENSIONS, EXTENSION_PATH), permanent=True
            )
