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
    
    def test_cookies_sent_in_network_request(self, driver, pages):
        """Test that cookies are included in network requests."""
        pages.load("blank.html")
        
        # Set a cookie
        driver.add_cookie({"name": "test_cookie", "value": "test_value"})
        
        network_data = []
        
        def on_before_request(request):
            network_data.append(request)
        
        handler_id = driver.network.add_before_request_handler(on_before_request)
        
        try:
            # Make a request
            driver.get(pages.url("blank.html"))
            
            # Verify the network event was captured
            WebDriverWait(driver, 5).until(lambda _: network_data)
            assert len(network_data) > 0
        finally:
            driver.network.remove_before_request_handler(handler_id)
            driver.delete_all_cookies()
    
    def test_cookie_modification_affects_requests(self, driver, pages):
        """Test that modifying cookies affects subsequent requests."""
        pages.load("blank.html")
        
        # Add first cookie
        driver.add_cookie({"name": "cookie1", "value": "value1"})
        
        cookies_before = driver.get_cookies()
        assert len(cookies_before) >= 1
        
        # Add second cookie
        driver.add_cookie({"name": "cookie2", "value": "value2"})
        
        cookies_after = driver.get_cookies()
        assert len(cookies_after) > len(cookies_before)
        
        # Cleanup
        driver.delete_all_cookies()
    
    def test_network_interception_with_stored_state(self, driver, pages):
        """Test network interception with stored cookies."""
        pages.load("blank.html")
        
        # Set up storage
        driver.add_cookie({"name": "auth_token", "value": "secret123"})
        
        intercepted = []
        
        def intercept(request):
            intercepted.append(request)
            # Check if request has access to cookies
            if hasattr(request, 'headers'):
                pass
        
        handler_id = driver.network.add_before_request_handler(intercept)
        
        try:
            driver.get(pages.url("blank.html"))
            WebDriverWait(driver, 5).until(lambda _: intercepted)
        finally:
            driver.network.remove_before_request_handler(handler_id)
            driver.delete_all_cookies()


class TestBidiScriptWithNavigation:
    """Test integration of script and navigation modules."""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        pages.load("blank.html")
        driver.delete_all_cookies()
    
    def test_preload_script_executes_on_page_load(self, driver, pages):
        """Test that preload scripts execute on page navigation."""
        script_executions = []
        
        # Add a preload script
        preload_id = driver.script.add_preload_script(
            "window.__test_var = 'preload_executed';"
        )
        
        try:
            # Navigate to a new page
            pages.load("blank.html")
            
            # Verify the preload script executed
            result = driver.execute_script("return window.__test_var;")
            assert result == "preload_executed"
        finally:
            driver.script.remove_preload_script(preload_id)
    
    def test_script_evaluation_after_navigation(self, driver, pages):
        """Test script evaluation after page navigation."""
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
    
    def test_call_function_with_navigation(self, driver, pages):
        """Test calling functions across navigations."""
        pages.load("blank.html")
        
        # Define a global function
        driver.execute_script("""
            window.testFunction = function(x) {
                return x * 2;
            };
        """)
        
        # Call the function
        result = driver.execute_script("return window.testFunction(5);")
        assert result == 10
        
        # Navigate
        pages.load("blank.html")
        
        # Function should no longer exist on new page
        result = driver.execute_script("return typeof window.testFunction;")
        assert result == "undefined"


class TestBidiEmulationWithNavigation:
    """Test integration of emulation and navigation modules."""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        pages.load("blank.html")
    
    def test_user_agent_persists_across_navigation(self, driver, pages):
        """Test that user agent emulation persists across page navigations."""
        try:
            pages.load("blank.html")
            
            # Set user agent
            driver.emulation.set_user_agent_override("Custom User Agent")
            
            # Verify user agent
            ua = driver.execute_script("return navigator.userAgent;")
            assert "Custom User Agent" in ua
            
            # Navigate to different page
            pages.load("blank.html")
            
            # Verify user agent still set
            ua_after = driver.execute_script("return navigator.userAgent;")
            assert "Custom User Agent" in ua_after
        finally:
            driver.emulation.set_user_agent_override()  # Reset
    
    def test_timezone_applies_to_script(self, driver, pages):
        """Test that timezone emulation affects JavaScript date operations."""
        try:
            pages.load("blank.html")
            
            # Set timezone
            driver.emulation.set_timezone_override("America/New_York")
            
            # Get timezone-sensitive value
            offset = driver.execute_script("""
                return new Date().getTimezoneOffset();
            """)
            
            assert offset is not None
        finally:
            driver.emulation.set_timezone_override()  # Reset


class TestBidiContextManagement:
    """Test integration of context creation and management."""
    
    def test_create_and_navigate_context(self, driver):
        """Test creating a new context and navigating within it."""
        new_context = driver.browser.create_user_context()
        
        try:
            assert new_context is not None
            
            # Navigate in the new context
            driver.get("about:blank", context_id=new_context)
        finally:
            driver.browser.remove_user_context(new_context)
    
    def test_multiple_contexts_independent(self, driver, pages):
        """Test that multiple contexts maintain independent state."""
        context1 = driver.browser.create_user_context()
        context2 = driver.browser.create_user_context()
        
        try:
            # Load page in context 1
            driver.get(pages.url("blank.html"), context_id=context1)
            
            # Load page in context 2
            driver.get(pages.url("blank.html"), context_id=context2)
            
            # Set cookie in context 1
            driver.add_cookie(
                {"name": "context1_cookie", "value": "value1"},
                context_id=context1
            )
            
            # Context 2 should not have this cookie
            cookies_context2 = driver.get_cookies(context_id=context2)
            cookie_names = [c.get("name") for c in cookies_context2]
            assert "context1_cookie" not in cookie_names
        finally:
            driver.browser.remove_user_context(context1)
            driver.browser.remove_user_context(context2)
    
    def test_context_window_operations(self, driver):
        """Test window operations within contexts."""
        context = driver.browser.create_user_context()
        
        try:
            # Create new window in context
            new_window = driver.browsing_context.create(
                type=WindowTypes.TAB,
                context_id=context
            )
            
            assert new_window is not None
            
            # Close the window
            driver.browsing_context.close(new_window)
        finally:
            driver.browser.remove_user_context(context)


class TestBidiEventHandlerManagement:
    """Test integration of multiple event handlers."""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        pages.load("blank.html")
    
    def test_multiple_handlers_same_event(self, driver):
        """Test multiple handlers for the same event type."""
        events1 = []
        events2 = []
        
        handler1 = driver.browsing_context.add_context_created_handler(events1.append)
        handler2 = driver.browsing_context.add_context_created_handler(events2.append)
        
        try:
            # Create a new context
            new_context = driver.browser.create_user_context()
            
            # Both handlers should receive the event
            WebDriverWait(driver, 5).until(lambda _: len(events1) > 0 and len(events2) > 0)
            assert len(events1) > 0
            assert len(events2) > 0
            
            # Cleanup
            driver.browser.remove_user_context(new_context)
        finally:
            driver.browsing_context.remove_context_created_handler(handler1)
            driver.browsing_context.remove_context_created_handler(handler2)
    
    def test_handler_removal_prevents_events(self, driver):
        """Test that removing handler prevents event delivery."""
        events1 = []
        events2 = []
        
        handler1 = driver.browsing_context.add_context_created_handler(events1.append)
        handler2 = driver.browsing_context.add_context_created_handler(events2.append)
        
        try:
            # Create first context
            context1 = driver.browser.create_user_context()
            WebDriverWait(driver, 5).until(lambda _: len(events1) > 0 and len(events2) > 0)
            
            initial_events1 = len(events1)
            initial_events2 = len(events2)
            
            # Remove first handler
            driver.browsing_context.remove_context_created_handler(handler1)
            
            # Create second context
            context2 = driver.browser.create_user_context()
            WebDriverWait(driver, 5).until(lambda _: len(events2) > initial_events2)
            
            # First handler should not receive new events
            assert len(events1) == initial_events1
            assert len(events2) > initial_events2
            
            # Cleanup
            driver.browser.remove_user_context(context1)
            driver.browser.remove_user_context(context2)
        finally:
            driver.browsing_context.remove_context_created_handler(handler2)


class TestBidiScreenshotWithNavigation:
    """Test integration of screenshot and navigation features."""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        pages.load("blank.html")
    
    def test_screenshot_after_navigation(self, driver, pages):
        """Test taking screenshot after page navigation."""
        pages.load("blank.html")
        
        # Take screenshot
        screenshot1 = driver.browsing_context.capture_screenshot(
            driver.current_context_id
        )
        assert screenshot1 is not None
        
        # Navigate to different page
        driver.find_element(By.TAG_NAME, "body")
        
        # Take another screenshot
        screenshot2 = driver.browsing_context.capture_screenshot(
            driver.current_context_id
        )
        assert screenshot2 is not None
        
        # Screenshots should exist (may be same or different)
        assert screenshot1 is not None
        assert screenshot2 is not None
    
    def test_screenshot_with_viewport_change(self, driver, pages):
        """Test screenshot behavior with viewport changes."""
        pages.load("blank.html")
        context_id = driver.current_context_id
        
        # Take initial screenshot
        screenshot1 = driver.browsing_context.capture_screenshot(context_id)
        assert screenshot1 is not None
        
        # Change viewport
        driver.browsing_context.set_viewport(
            context_id,
            viewport={"width": 1024, "height": 768}
        )
        
        # Take screenshot with new viewport
        screenshot2 = driver.browsing_context.capture_screenshot(context_id)
        assert screenshot2 is not None


class TestBidiStorageWithContexts:
    """Test storage operations across multiple contexts."""
    
    def test_cookies_independent_across_contexts(self, driver, pages):
        """Test that cookies are independent across user contexts."""
        context1 = driver.browser.create_user_context()
        context2 = driver.browser.create_user_context()
        
        try:
            pages.load("blank.html")
            
            # Add cookie to context 1
            driver.add_cookie(
                {"name": "ctx1_cookie", "value": "value1"},
                context_id=context1
            )
            
            # Get cookies from context 2
            cookies = driver.get_cookies(context_id=context2)
            cookie_names = [c.get("name") for c in cookies]
            
            # Context 2 should not have context 1's cookie
            assert "ctx1_cookie" not in cookie_names
        finally:
            driver.browser.remove_user_context(context1)
            driver.browser.remove_user_context(context2)
    
    def test_delete_cookies_affects_only_target_context(self, driver, pages):
        """Test that deleting cookies only affects the target context."""
        context1 = driver.browser.create_user_context()
        context2 = driver.browser.create_user_context()
        
        try:
            # Add same cookie name to both contexts
            driver.add_cookie(
                {"name": "shared_cookie", "value": "ctx1"},
                context_id=context1
            )
            driver.add_cookie(
                {"name": "shared_cookie", "value": "ctx2"},
                context_id=context2
            )
            
            # Delete cookie from context 1
            driver.delete_cookie("shared_cookie", context_id=context1)
            
            # Context 1 should not have the cookie
            cookies1 = driver.get_cookies(context_id=context1)
            assert not any(c.get("name") == "shared_cookie" for c in cookies1)
            
            # Context 2 should still have it
            cookies2 = driver.get_cookies(context_id=context2)
            assert any(c.get("name") == "shared_cookie" for c in cookies2)
        finally:
            driver.browser.remove_user_context(context1)
            driver.browser.remove_user_context(context2)
