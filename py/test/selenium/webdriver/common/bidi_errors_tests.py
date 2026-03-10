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

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By


def test_invalid_browsing_context_id(driver):
    """Test that invalid browsing context ID raises an error."""
    with pytest.raises(WebDriverException):
        driver.browsing_context.close("invalid-context-id")


def test_invalid_navigation_url(driver):
    """Test that navigation with invalid context should fail."""
    with pytest.raises(WebDriverException):
        # Invalid context ID should fail
        driver.browsing_context.navigate("invalid-context-id", "about:blank")


def test_invalid_geolocation_coordinates(driver):
    """Test that invalid geolocation coordinates raise an error."""
    from selenium.webdriver.common.bidi.emulation import GeolocationCoordinates

    with pytest.raises((WebDriverException, ValueError, TypeError)):
        # Invalid latitude (> 90)
        coords = GeolocationCoordinates(latitude=999, longitude=180, accuracy=10)
        driver.emulation.set_geolocation_override(coordinates=coords)


def test_invalid_timezone(driver):
    """Test that invalid timezone string raises an error."""
    with pytest.raises((WebDriverException, ValueError)):
        driver.emulation.set_timezone_override("Invalid/Timezone")


def test_invalid_set_cookie(driver, pages):
    """Test that setting cookie with None raises an error."""
    pages.load("blank.html")

    with pytest.raises((WebDriverException, TypeError, AttributeError)):
        driver.storage.set_cookie(None)


def test_remove_nonexistent_context(driver):
    """Test that removing non-existent context raises an error."""
    with pytest.raises(WebDriverException):
        driver.browser.remove_user_context("non-existent-context-id")


def test_invalid_perform_actions_missing_context(driver, pages):
    """Test that perform_actions without context raises an error."""
    pages.load("blank.html")

    with pytest.raises(TypeError):
        # Missing required 'context' parameter
        driver.input.perform_actions(actions=[])


def test_error_recovery_after_invalid_navigation(driver):
    """Test that driver can recover after failed navigation."""
    # Try an invalid navigation with bad context
    with pytest.raises(WebDriverException):
        driver.browsing_context.navigate("invalid-context", "about:blank")

    # Driver should still be functional
    driver.get("about:blank")
    assert driver.find_element(By.TAG_NAME, "body") is not None


def test_multiple_error_conditions(driver, pages):
    """Test handling multiple error conditions in sequence."""
    pages.load("blank.html")

    # First error
    with pytest.raises(WebDriverException):
        driver.browser.remove_user_context("invalid")

    # Driver should still work
    assert driver.find_element(By.TAG_NAME, "body") is not None

    # Second error
    with pytest.raises((WebDriverException, ValueError)):
        driver.emulation.set_timezone_override("Invalid")

    # Driver still functional
    driver.get("about:blank")


class TestBidiErrorHandling:
    """Test class for error handling in BiDi operations."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        pages.load("blank.html")

    def test_error_on_invalid_context_operations(self, driver):
        """Test error handling with invalid context operations."""
        # Try to close non-existent context
        with pytest.raises(WebDriverException):
            driver.browsing_context.close("nonexistent")

    def test_error_recovery_sequence(self, driver):
        """Test that driver recovers properly from errors."""
        # First operation fails
        with pytest.raises(WebDriverException):
            driver.browser.remove_user_context("bad-id")

        # Recovery test
        element = driver.find_element(By.TAG_NAME, "body")
        assert element is not None

    def test_consecutive_errors(self, driver):
        """Test handling consecutive errors."""
        errors_caught = 0

        # First error
        try:
            driver.browser.remove_user_context("id1")
        except WebDriverException:
            errors_caught += 1

        # Second error
        try:
            driver.browser.remove_user_context("id2")
        except WebDriverException:
            errors_caught += 1

        assert errors_caught == 2

        # Driver should still work
        driver.get("about:blank")
