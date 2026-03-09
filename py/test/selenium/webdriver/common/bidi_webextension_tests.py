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

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait

from conftest import get_extensions_location

EXTENSIONS = get_extensions_location()
EXTENSION_ID = "webextensions-selenium-example-v3@example.com"
EXTENSION_PATH = "webextensions-selenium-example-signed"
EXTENSION_ARCHIVE_PATH = "webextensions-selenium-example.xpi"


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
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = install_extension(driver, path=path)
        verify_extension_injection(driver, pages)
        uninstall_extension_and_verify_extension_uninstalled(driver, ext_info)

    def test_install_archive_extension_path(self, driver, pages):
        """Test installing an extension from an archive path."""
        path = os.path.join(EXTENSIONS, EXTENSION_ARCHIVE_PATH)
        ext_info = install_extension(driver, archive_path=path)
        verify_extension_injection(driver, pages)
        uninstall_extension_and_verify_extension_uninstalled(driver, ext_info)

    def test_install_base64_extension_path(self, driver, pages):
        """Test installing an extension from a base64 encoded string."""
        path = os.path.join(EXTENSIONS, EXTENSION_ARCHIVE_PATH)
        with open(path, "rb") as file:
            base64_encoded = base64.b64encode(file.read()).decode("utf-8")
        ext_info = install_extension(driver, base64_value=base64_encoded)
        # TODO: the extension is installed but the script is not injected, check and fix
        # verify_extension_injection(driver, pages)
        uninstall_extension_and_verify_extension_uninstalled(driver, ext_info)

    def test_install_unsigned_extension(self, driver, pages):
        """Test installing an unsigned extension."""
        path = os.path.join(EXTENSIONS, "webextensions-selenium-example")
        ext_info = install_extension(driver, path=path)
        verify_extension_injection(driver, pages)
        uninstall_extension_and_verify_extension_uninstalled(driver, ext_info)

    def test_install_with_extension_id_uninstall(self, driver, pages):
        """Test uninstalling an extension using just the extension ID."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
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
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = chromium_driver.webextension.install(path=path)

        verify_extension_injection(chromium_driver, pages_chromium)
        uninstall_extension_and_verify_extension_uninstalled(chromium_driver, ext_info)

    def test_install_unsigned_extension(self, chromium_driver, pages_chromium):
        """Test installing an unsigned extension."""
        path = os.path.join(EXTENSIONS, "webextensions-selenium-example")
        ext_info = chromium_driver.webextension.install(path=path)

        verify_extension_injection(chromium_driver, pages_chromium)
        uninstall_extension_and_verify_extension_uninstalled(chromium_driver, ext_info)

    def test_install_with_extension_id_uninstall(self, chromium_driver):
        """Test uninstalling an extension using just the extension ID."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = chromium_driver.webextension.install(path=path)
        extension_id = ext_info.get("extension")
        # Uninstall using the extension ID
        uninstall_extension_and_verify_extension_uninstalled(
            chromium_driver, extension_id
        )


# Additional edge case tests for better WPT coverage


class TestFirefoxWebExtensionEdgeCases:
    """Firefox WebExtension edge case tests."""

    @pytest.mark.xfail_chrome
    @pytest.mark.xfail_edge
    def test_uninstall_extension_by_id_string(self, driver, pages):
        """Test uninstalling extension using extension ID as string."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = install_extension(driver, path=path)
        extension_id_string = ext_info.get("extension")

        # Uninstall using ID string directly
        driver.webextension.uninstall(extension_id_string)

        # Verify uninstall was successful
        driver.browsing_context.reload(driver.current_window_handle)
        assert len(driver.find_elements(By.ID, "webextensions-selenium-example")) == 0

    @pytest.mark.xfail_chrome
    @pytest.mark.xfail_edge
    def test_uninstall_extension_by_result_dict(self, driver, pages):
        """Test uninstalling extension using result dictionary from install."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = install_extension(driver, path=path)

        # Uninstall using result dict
        driver.webextension.uninstall(ext_info)

        # Verify uninstall was successful
        driver.browsing_context.reload(driver.current_window_handle)
        assert len(driver.find_elements(By.ID, "webextensions-selenium-example")) == 0

    @pytest.mark.xfail_chrome
    @pytest.mark.xfail_edge
    def test_install_returns_extension_id(self, driver, pages):
        """Test that install returns proper extension ID in result."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = install_extension(driver, path=path)

        # Verify result structure
        assert "extension" in ext_info
        assert isinstance(ext_info.get("extension"), str)
        assert len(ext_info.get("extension", "")) > 0
        assert ext_info.get("extension") == EXTENSION_ID

        # Cleanup
        driver.webextension.uninstall(ext_info)

    @pytest.mark.xfail_chrome
    @pytest.mark.xfail_edge
    def test_extension_content_script_injection(self, driver, pages):
        """Test that extension content scripts are properly injected."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = install_extension(driver, path=path)

        # Load page and verify content script injection
        pages.load("blank.html")

        # Element should be injected by extension
        injected_element = WebDriverWait(driver, timeout=5).until(
            lambda dr: dr.find_element(By.ID, "webextensions-selenium-example")
        )

        assert injected_element is not None
        assert (
            "Content injected by webextensions-selenium-example"
            in injected_element.text
        )

        # Cleanup
        driver.webextension.uninstall(ext_info)

    @pytest.mark.xfail_chrome
    @pytest.mark.xfail_edge
    def test_uninstall_removes_content_scripts(self, driver, pages):
        """Test that uninstalling extension removes content scripts."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = install_extension(driver, path=path)

        # Verify injection works
        pages.load("blank.html")
        WebDriverWait(driver, timeout=5).until(
            lambda dr: dr.find_element(By.ID, "webextensions-selenium-example")
        )

        # Uninstall
        driver.webextension.uninstall(ext_info)

        # Reload page and verify injection is gone
        driver.browsing_context.reload(driver.current_window_handle)
        assert len(driver.find_elements(By.ID, "webextensions-selenium-example")) == 0

    @pytest.mark.xfail_chrome
    @pytest.mark.xfail_edge
    def test_install_from_archive_returns_extension_id(self, driver, pages):
        """Test that archive install returns proper extension ID."""
        archive_path = os.path.join(EXTENSIONS, EXTENSION_ARCHIVE_PATH)
        ext_info = install_extension(driver, archive_path=archive_path)

        # Verify result structure
        assert "extension" in ext_info
        assert isinstance(ext_info.get("extension"), str)
        assert len(ext_info.get("extension", "")) > 0

        # Cleanup
        driver.webextension.uninstall(ext_info)

    @pytest.mark.xfail_chrome
    @pytest.mark.xfail_edge
    def test_multiple_installations_and_uninstalls(self, driver, pages):
        """Test installing and uninstalling extension multiple times."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)

        # Install/uninstall cycle 1
        ext_info_1 = install_extension(driver, path=path)
        verify_extension_injection(driver, pages)
        driver.webextension.uninstall(ext_info_1)
        driver.browsing_context.reload(driver.current_window_handle)
        assert len(driver.find_elements(By.ID, "webextensions-selenium-example")) == 0

        # Install/uninstall cycle 2
        ext_info_2 = install_extension(driver, path=path)
        verify_extension_injection(driver, pages)
        driver.webextension.uninstall(ext_info_2)
        driver.browsing_context.reload(driver.current_window_handle)
        assert len(driver.find_elements(By.ID, "webextensions-selenium-example")) == 0


class TestChromiumWebExtensionEdgeCases:
    """Chrome/Edge WebExtension edge case tests."""

    @pytest.mark.xfail_firefox
    @pytest.fixture
    def pages_chromium(self, webserver, chromium_driver):
        class Pages:
            def load(self, name):
                chromium_driver.get(webserver.where_is(name, localhost=False))

        return Pages()

    @pytest.mark.xfail_firefox
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

    @pytest.mark.xfail_firefox
    def test_uninstall_extension_by_id_string(self, chromium_driver, pages_chromium):
        """Test uninstalling extension using extension ID as string."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = chromium_driver.webextension.install(path=path)
        extension_id_string = ext_info.get("extension")

        # Uninstall using ID string directly
        chromium_driver.webextension.uninstall(extension_id_string)

        # Verify uninstall was successful
        chromium_driver.browsing_context.reload(chromium_driver.current_window_handle)
        assert (
            len(chromium_driver.find_elements(By.ID, "webextensions-selenium-example"))
            == 0
        )

    @pytest.mark.xfail_firefox
    def test_uninstall_extension_by_result_dict(self, chromium_driver, pages_chromium):
        """Test uninstalling extension using result dictionary from install."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = chromium_driver.webextension.install(path=path)

        # Uninstall using result dict
        chromium_driver.webextension.uninstall(ext_info)

        # Verify uninstall was successful
        chromium_driver.browsing_context.reload(chromium_driver.current_window_handle)
        assert (
            len(chromium_driver.find_elements(By.ID, "webextensions-selenium-example"))
            == 0
        )

    @pytest.mark.xfail_firefox
    def test_install_returns_extension_id(self, chromium_driver, pages_chromium):
        """Test that install returns proper extension ID in result."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = chromium_driver.webextension.install(path=path)

        # Verify result structure
        assert "extension" in ext_info
        assert isinstance(ext_info.get("extension"), str)
        assert len(ext_info.get("extension", "")) > 0

        # Cleanup
        chromium_driver.webextension.uninstall(ext_info)

    @pytest.mark.xfail_firefox
    def test_extension_content_script_injection(self, chromium_driver, pages_chromium):
        """Test that extension content scripts are properly injected."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = chromium_driver.webextension.install(path=path)

        # Load page and verify content script injection
        pages_chromium.load("blank.html")

        # Element should be injected by extension
        injected_element = WebDriverWait(chromium_driver, timeout=5).until(
            lambda dr: dr.find_element(By.ID, "webextensions-selenium-example")
        )

        assert injected_element is not None
        assert (
            "Content injected by webextensions-selenium-example"
            in injected_element.text
        )

        # Cleanup
        chromium_driver.webextension.uninstall(ext_info)

    @pytest.mark.xfail_firefox
    def test_uninstall_removes_content_scripts(self, chromium_driver, pages_chromium):
        """Test that uninstalling extension removes content scripts."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)
        ext_info = chromium_driver.webextension.install(path=path)

        # Verify injection works
        pages_chromium.load("blank.html")
        WebDriverWait(chromium_driver, timeout=5).until(
            lambda dr: dr.find_element(By.ID, "webextensions-selenium-example")
        )

        # Uninstall
        chromium_driver.webextension.uninstall(ext_info)

        # Reload page and verify injection is gone
        chromium_driver.browsing_context.reload(chromium_driver.current_window_handle)
        assert (
            len(chromium_driver.find_elements(By.ID, "webextensions-selenium-example"))
            == 0
        )

    @pytest.mark.xfail_firefox
    def test_multiple_installations_and_uninstalls(
        self, chromium_driver, pages_chromium
    ):
        """Test installing and uninstalling extension multiple times."""
        path = os.path.join(EXTENSIONS, EXTENSION_PATH)

        # Install/uninstall cycle 1
        ext_info_1 = chromium_driver.webextension.install(path=path)
        verify_extension_injection(chromium_driver, pages_chromium)
        chromium_driver.webextension.uninstall(ext_info_1)
        chromium_driver.browsing_context.reload(chromium_driver.current_window_handle)
        assert (
            len(chromium_driver.find_elements(By.ID, "webextensions-selenium-example"))
            == 0
        )

        # Install/uninstall cycle 2
        ext_info_2 = chromium_driver.webextension.install(path=path)
        verify_extension_injection(chromium_driver, pages_chromium)
        chromium_driver.webextension.uninstall(ext_info_2)
        chromium_driver.browsing_context.reload(chromium_driver.current_window_handle)
        assert (
            len(chromium_driver.find_elements(By.ID, "webextensions-selenium-example"))
            == 0
        )
