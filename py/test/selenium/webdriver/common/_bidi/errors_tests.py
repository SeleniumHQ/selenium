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

"""Mirror of ``../bidi/errors_tests.py`` using the generated ``_bidi`` commands, not the ``driver`` facade."""

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.browser import Browser
from selenium.webdriver.common._bidi.browsing_context import BrowsingContext
from selenium.webdriver.common._bidi.emulation import Emulation, GeolocationCoordinates
from selenium.webdriver.common._bidi.input import Input
from selenium.webdriver.common._bidi.storage import Storage
from selenium.webdriver.common.by import By


def test_invalid_browsing_context_id(driver):
    with pytest.raises(WebDriverException):
        BrowsingContext(driver).close(context="invalid-context-id")


def test_invalid_navigation_url(driver):
    with pytest.raises(WebDriverException):
        BrowsingContext(driver).navigate(context="invalid-context-id", url="about:blank")


def test_invalid_geolocation_coordinates(driver):
    with pytest.raises((WebDriverException, ValueError, TypeError)):
        coords = GeolocationCoordinates(latitude=999, longitude=180, accuracy=10)
        Emulation(driver).set_geolocation_override(coordinates=coords)


def test_invalid_timezone(driver):
    with pytest.raises((WebDriverException, ValueError)):
        Emulation(driver).set_timezone_override(timezone="Invalid/Timezone")


def test_invalid_set_cookie(driver, pages):
    pages.load("blank.html")
    with pytest.raises((WebDriverException, TypeError, AttributeError)):
        Storage(driver).set_cookie(None)


def test_remove_nonexistent_context(driver):
    with pytest.raises(WebDriverException):
        Browser(driver).remove_user_context(user_context="non-existent-context-id")


def test_invalid_perform_actions_missing_context(driver, pages):
    pages.load("blank.html")
    with pytest.raises(TypeError):
        Input(driver).perform_actions(actions=[])


def test_error_recovery_after_invalid_navigation(driver):
    with pytest.raises(WebDriverException):
        BrowsingContext(driver).navigate(context="invalid-context", url="about:blank")

    driver.get("about:blank")
    assert driver.find_element(By.TAG_NAME, "body") is not None


def test_multiple_error_conditions(driver, pages):
    pages.load("blank.html")

    with pytest.raises(WebDriverException):
        Browser(driver).remove_user_context(user_context="invalid")

    assert driver.find_element(By.TAG_NAME, "body") is not None

    with pytest.raises((WebDriverException, ValueError)):
        Emulation(driver).set_timezone_override(timezone="Invalid")

    driver.get("about:blank")


class TestBidiErrorHandling:
    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        pages.load("blank.html")

    def test_error_on_invalid_context_operations(self, driver):
        with pytest.raises(WebDriverException):
            BrowsingContext(driver).close(context="nonexistent")

    def test_error_recovery_sequence(self, driver):
        with pytest.raises(WebDriverException):
            Browser(driver).remove_user_context(user_context="bad-id")

        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_consecutive_errors(self, driver):
        errors_caught = 0

        try:
            Browser(driver).remove_user_context(user_context="id1")
        except WebDriverException:
            errors_caught += 1

        try:
            Browser(driver).remove_user_context(user_context="id2")
        except WebDriverException:
            errors_caught += 1

        assert errors_caught == 2

        driver.get("about:blank")
