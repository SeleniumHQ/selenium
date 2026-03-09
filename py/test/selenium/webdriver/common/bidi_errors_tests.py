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

from selenium.common.exceptions import InvalidArgumentException
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By


def test_errors_module_initialized(driver):
    """Test that the errors module is accessible."""
    assert driver.script is not None


def test_invalid_browsing_context_id(driver):
    """Test that invalid browsing context ID raises an error."""
    with pytest.raises(WebDriverException):
        driver.browsing_context.close("invalid-context-id")


def test_invalid_script_evaluate(driver):
    """Test that invalid script evaluation raises an error."""
    with pytest.raises(WebDriverException):
        driver.script.evaluate("invalid javascript }{", await_promise=False)


def test_invalid_navigation_url(driver):
    """Test that invalid URL navigation raises an error."""
    with pytest.raises((WebDriverException, ValueError)):
        driver.browsing_context.navigate(None)


def test_invalid_add_preload_script_no_function_declaration(driver):
    """Test that adding preload script without proper format raises an error."""
    with pytest.raises((WebDriverException, InvalidArgumentException)):
        driver.script.add_preload_script("not a valid script;}")


def test_remove_nonexistent_user_context(driver):
    """Test that removing non-existent user context raises an error."""
    with pytest.raises(WebDriverException):
        driver.browser.remove_user_context("non-existent-context-id")


def test_invalid_call_function_parameters(driver, pages):
    """Test that call_function with invalid parameters raises an error."""
    pages.load("blank.html")
    
    # Try to call with invalid script
    with pytest.raises(WebDriverException):
        driver.script.call_function(
            "invalid function }{",
            [],
            await_promise=False
        )


def test_invalid_screenshot_clipping(driver, pages):
    """Test that invalid screenshot clipping region raises an error."""
    pages.load("blank.html")
    context_id = driver.current_context_id
    
    # Try with invalid clipping region (negative dimensions)
    with pytest.raises((WebDriverException, ValueError)):
        driver.browsing_context.capture_screenshot(
            context_id,
            clip={"x": 0, "y": 0, "width": -100, "height": 100}
        )


def test_invalid_set_viewport_dimensions(driver, pages):
    """Test that setting invalid viewport dimensions raises an error."""
    pages.load("blank.html")
    context_id = driver.current_context_id
    
    # Try with negative dimensions
    with pytest.raises((WebDriverException, ValueError)):
        driver.browsing_context.set_viewport(
            context_id,
            viewport={"width": -1, "height": -1}
        )


def test_invalid_set_cookie(driver, pages):
    """Test that setting invalid cookie raises an error."""
    pages.load("blank.html")
    
    # Try to set cookie with missing required fields
    with pytest.raises((WebDriverException, TypeError, InvalidArgumentException)):
        driver.storage.set_cookie(None)


def test_invalid_network_intercept_phase(driver):
    """Test that invalid network intercept phase raises an error."""
    with pytest.raises((WebDriverException, ValueError)):
        driver.network.add_intercept(
            phases=["invalid_phase"],
            url_patterns=[]
        )


def test_invalid_emulation_timezone(driver):
    """Test that invalid timezone string raises an error."""
    with pytest.raises((WebDriverException, ValueError)):
        driver.emulation.set_timezone_override("Invalid/Timezone")


def test_invalid_geolocation_coordinates(driver):
    """Test that invalid geolocation coordinates raise an error."""
    with pytest.raises((WebDriverException, ValueError)):
        driver.emulation.set_geolocation_override(
            latitude=999,  # Invalid latitude
            longitude=180
        )


def test_invalid_script_realm_type(driver):
    """Test that invalid realm type raises an error."""
    with pytest.raises((WebDriverException, ValueError)):
        driver.script.get_realms(realm_type="invalid_realm_type")


def test_protocol_error_with_invalid_session(driver):
    """Test that operations on invalid session context raise errors."""
    # Try to use a context that doesn't exist
    with pytest.raises(WebDriverException):
        driver.browsing_context.navigate("https://www.example.com", context_id="nonexistent")


def test_error_on_locate_nodes_with_invalid_selector(driver, pages):
    """Test that invalid locator strategy raises an error."""
    pages.load("blank.html")
    context_id = driver.current_context_id
    
    # Try with invalid selector strategy
    with pytest.raises((WebDriverException, ValueError)):
        driver.browsing_context.locate_nodes(
            locator={"type": "invalid_strategy", "value": "test"},
            context_id=context_id
        )


def test_error_on_perform_actions_invalid_action(driver, pages):
    """Test that invalid action sequence raises an error."""
    pages.load("blank.html")
    
    with pytest.raises((WebDriverException, InvalidArgumentException)):
        driver.input.perform_actions(actions=None)


def test_error_on_multiple_context_operations(driver):
    """Test error handling with rapid context operations."""
    # Create a context
    context1 = driver.browser.create_user_context()
    assert context1 is not None
    
    # Try to remove it immediately after (should succeed)
    driver.browser.remove_user_context(context1)
    
    # Try to remove again (should fail)
    with pytest.raises(WebDriverException):
        driver.browser.remove_user_context(context1)


class TestBidiErrorHandling:
    """Test class for error handling in BiDi operations."""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        pages.load("blank.html")
    
    def test_error_on_subscribe_invalid_event(self, driver):
        """Test that subscribing to invalid event type raises error."""
        with pytest.raises((WebDriverException, ValueError)):
            driver.session.subscribe(events=["invalid.event.type"])
    
    def test_error_on_unsubscribe_without_subscription(self, driver):
        """Test that unsubscribing from non-existent subscription raises error."""
        with pytest.raises(WebDriverException):
            driver.session.unsubscribe(events=["non.subscribed.event"])
    
    def test_error_recovery_after_failed_navigation(self, driver):
        """Test that driver can recover after failed navigation."""
        # First, try an invalid navigation
        with pytest.raises(WebDriverException):
            driver.browsing_context.navigate(None)
        
        # Driver should still be functional
        driver.get("about:blank")
        assert driver.find_element(By.TAG_NAME, "body") is not None
