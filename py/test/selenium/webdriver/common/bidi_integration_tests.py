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

import pytest

from selenium.webdriver.common.by import By
from selenium.webdriver.common.window import WindowTypes
from selenium.webdriver.support.ui import WebDriverWait


class TestBidiNetworkWithCookies:
    """Test integration of network and storage modules."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        pages.load("blank.html")
        yield
        # Cleanup: delete all cookies to prevent bleed-through
        driver.delete_all_cookies()

    def test_cookies_interaction(self, driver, pages):
        """Test that cookies work with network operations."""
        pages.load("blank.html")

        # Set a cookie
        driver.add_cookie({"name": "test_cookie", "value": "test_value"})

        # Verify cookie is set
        cookies = driver.get_cookies()
        assert len(cookies) > 0
        assert any(c.get("name") == "test_cookie" for c in cookies)

    def test_cookie_modification(self, driver, pages):
        """Test that modifying cookies works properly."""
        pages.load("blank.html")

        # Add first cookie
        driver.add_cookie({"name": "cookie1", "value": "value1"})

        cookies_before = driver.get_cookies()
        initial_count = len(cookies_before)

        # Add second cookie
        driver.add_cookie({"name": "cookie2", "value": "value2"})

        cookies_after = driver.get_cookies()
        assert len(cookies_after) > initial_count


class TestBidiScriptWithNavigation:
    """Test integration of script execution and navigation."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        driver.delete_all_cookies()
        pages.load("blank.html")
        yield
        # Cleanup: delete all cookies to prevent bleed-through
        driver.delete_all_cookies()

    def test_script_execution_after_navigation(self, driver, pages):
        """Test script execution after page navigation."""
        # First page
        pages.load("blank.html")
        driver.execute_script("window.page1_loaded = true;")

        # Navigate to different page
        pages.load("blank.html")

        # Previous page variable should not exist
        result = driver.execute_script("return window.page1_loaded;")
        assert result is None

        # New variable should work
        driver.execute_script("window.page2_loaded = true;")
        result = driver.execute_script("return window.page2_loaded;")
        assert result is True

    def test_global_variable_lifecycle(self, driver, pages):
        """Test global variable lifecycle across operations."""
        pages.load("blank.html")

        # Set a global variable
        driver.execute_script("window.test_var = {data: 'value'};")

        # Verify it exists
        result = driver.execute_script("return window.test_var.data;")
        assert result == "value"

        # Navigate away
        driver.get("about:blank")

        # Variable should not exist anymore
        result = driver.execute_script("return typeof window.test_var;")
        assert result == "undefined"


class TestBidiEmulationWithNavigation:
    """Test integration of emulation and navigation."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        pages.load("blank.html")
        yield
        # Cleanup: delete all cookies to prevent bleed-through
        driver.delete_all_cookies()

    def test_basic_navigation(self, driver, pages):
        """Test basic navigation."""
        pages.load("blank.html")
        assert driver.find_element(By.TAG_NAME, "body") is not None


class TestBidiContextManagement:
    """Test integration of context creation and management."""

    def test_create_and_close_context(self, driver):
        """Test creating and closing a user context."""
        new_context = driver.browser.create_user_context()

        try:
            assert new_context is not None
        finally:
            driver.browser.remove_user_context(new_context)

    def test_multiple_contexts_creation(self, driver):
        """Test creating multiple contexts."""
        context1 = driver.browser.create_user_context()
        context2 = driver.browser.create_user_context()

        try:
            assert context1 is not None
            assert context2 is not None
            assert context1 != context2
        finally:
            driver.browser.remove_user_context(context1)
            driver.browser.remove_user_context(context2)


class TestBidiEventHandlers:
    """Test integration of event handlers."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        pages.load("blank.html")
        yield
        # Cleanup: delete all cookies to prevent bleed-through
        driver.delete_all_cookies()

    def test_multiple_console_handlers(self, driver):
        """Test multiple console message handlers."""
        messages1 = []
        messages2 = []

        handler1 = driver.script.add_console_message_handler(messages1.append)
        handler2 = driver.script.add_console_message_handler(messages2.append)

        try:
            driver.execute_script("console.log('test message');")
            WebDriverWait(driver, 5).until(
                lambda _: len(messages1) > 0 and len(messages2) > 0
            )

            assert len(messages1) > 0
            assert len(messages2) > 0
        finally:
            driver.script.remove_console_message_handler(handler1)
            driver.script.remove_console_message_handler(handler2)


class TestBidiStorageOperations:
    """Test storage operations."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        driver.delete_all_cookies()
        pages.load("blank.html")
        yield
        # Cleanup: delete all cookies to prevent bleed-through
        driver.delete_all_cookies()

    def test_cookie_operations(self, driver, pages):
        """Test basic cookie operations."""
        pages.load("blank.html")

        # Set cookie
        driver.add_cookie({"name": "test", "value": "data"})

        # Get cookies
        cookies = driver.get_cookies()
        assert any(c.get("name") == "test" for c in cookies)

        # Delete cookie
        driver.delete_cookie("test")

        # Verify deletion
        cookies_after = driver.get_cookies()
        assert not any(c.get("name") == "test" for c in cookies_after)

    def test_cookie_attributes(self, driver, pages):
        """Test cookie with various attributes."""
        pages.load("blank.html")

        driver.add_cookie(
            {"name": "attr_cookie", "value": "test_value", "path": "/", "secure": False}
        )

        cookies = driver.get_cookies()
        cookie = next((c for c in cookies if c.get("name") == "attr_cookie"), None)

        assert cookie is not None
        assert cookie.get("value") == "test_value"


class TestBidiBrowsingContexts:
    """Test browsing context operations."""

    @pytest.fixture(autouse=True)
    def setup(self, driver):
        """Setup for each test in this class."""
        driver.delete_all_cookies()
        yield
        # Cleanup: delete all cookies to prevent bleed-through
        driver.delete_all_cookies()

    def test_create_new_window(self, driver):
        """Test creating a new window context."""
        # Create new tab
        new_context = driver.browsing_context.create(type=WindowTypes.TAB)

        try:
            assert new_context is not None
        finally:
            driver.browsing_context.close(new_context)

    def test_navigation_in_context(self, driver, pages):
        """Test navigation in a specific context."""
        pages.load("blank.html")

        # Navigate using the BiDi API with the current context
        driver.browsing_context.navigate(
            context=driver.current_window_handle, url=pages.url("blank.html")
        )

        # Verify page loaded
        element = driver.find_element(By.TAG_NAME, "body")
        assert element is not None
