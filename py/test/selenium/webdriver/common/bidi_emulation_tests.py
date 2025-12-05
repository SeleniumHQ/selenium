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

from selenium.webdriver.common.bidi.emulation import (
    Emulation,
    GeolocationCoordinates,
    GeolocationPositionError,
    ScreenOrientation,
    ScreenOrientationNatural,
    ScreenOrientationType,
)
from selenium.webdriver.common.bidi.permissions import PermissionState
from selenium.webdriver.common.window import WindowTypes


def get_browser_timezone_string(driver):
    result = driver.script._evaluate(
        "Intl.DateTimeFormat().resolvedOptions().timeZone",
        {"context": driver.current_window_handle},
        await_promise=False,
    )
    return result.result["value"]


def get_browser_timezone_offset(driver):
    result = driver.script._evaluate(
        "new Date().getTimezoneOffset()", {"context": driver.current_window_handle}, await_promise=False
    )
    return result.result["value"]


def get_browser_geolocation(driver, user_context=None):
    origin = driver.execute_script("return window.location.origin;")
    driver.permissions.set_permission("geolocation", PermissionState.GRANTED, origin, user_context=user_context)

    return driver.execute_async_script("""
        const callback = arguments[arguments.length - 1];
        navigator.geolocation.getCurrentPosition(
            position => {
                const coords = position.coords;
                callback({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: coords.accuracy,
                    altitude: coords.altitude,
                    altitudeAccuracy: coords.altitudeAccuracy,
                    heading: coords.heading,
                    speed: coords.speed,
                    timestamp: position.timestamp
                });
            },
            error => {
                callback({ error: error.message });
            }
        );
    """)


def get_browser_locale(driver):
    result = driver.script._evaluate(
        "Intl.DateTimeFormat().resolvedOptions().locale",
        {"context": driver.current_window_handle},
        await_promise=False,
    )
    return result.result["value"]


def get_screen_orientation(driver, context_id):
    result = driver.script._evaluate(
        "screen.orientation.type",
        {"context": context_id},
        await_promise=False,
    )
    orientation_type = result.result["value"]

    result = driver.script._evaluate(
        "screen.orientation.angle",
        {"context": context_id},
        await_promise=False,
    )
    orientation_angle = result.result["value"]

    return {"type": orientation_type, "angle": orientation_angle}


def get_browser_user_agent(driver):
    result = driver.script._evaluate(
        "navigator.userAgent",
        {"context": driver.current_window_handle},
        await_promise=False,
    )
    return result.result["value"]


def test_emulation_initialized(driver):
    assert driver.emulation is not None
    assert isinstance(driver.emulation, Emulation)


def test_set_geolocation_override_with_coordinates_in_context(driver, pages):
    context_id = driver.current_window_handle
    pages.load("blank.html")
    coords = GeolocationCoordinates(45.5, -122.4194, accuracy=10.0)

    driver.emulation.set_geolocation_override(coordinates=coords, contexts=[context_id])

    result = get_browser_geolocation(driver)

    assert "error" not in result, f"Geolocation error: {result.get('error')}"
    assert abs(result["latitude"] - coords.latitude) < 0.0001, f"Latitude mismatch: {result['latitude']}"
    assert abs(result["longitude"] - coords.longitude) < 0.0001, f"Longitude mismatch: {result['longitude']}"
    assert abs(result["accuracy"] - coords.accuracy) < 1.0, f"Accuracy mismatch: {result['accuracy']}"


def test_set_geolocation_override_with_coordinates_in_user_context(driver, pages):
    # Create a user context
    user_context = driver.browser.create_user_context()

    context_id = driver.browsing_context.create(type=WindowTypes.TAB, user_context=user_context)

    driver.switch_to.window(context_id)
    pages.load("blank.html")

    coords = GeolocationCoordinates(45.5, -122.4194, accuracy=10.0)

    driver.emulation.set_geolocation_override(coordinates=coords, user_contexts=[user_context])

    result = get_browser_geolocation(driver, user_context=user_context)

    assert "error" not in result, f"Geolocation error: {result.get('error')}"
    assert abs(result["latitude"] - coords.latitude) < 0.0001, f"Latitude mismatch: {result['latitude']}"
    assert abs(result["longitude"] - coords.longitude) < 0.0001, f"Longitude mismatch: {result['longitude']}"
    assert abs(result["accuracy"] - coords.accuracy) < 1.0, f"Accuracy mismatch: {result['accuracy']}"

    driver.browsing_context.close(context_id)
    driver.browser.remove_user_context(user_context)


def test_set_geolocation_override_all_coords(driver, pages):
    context_id = driver.current_window_handle
    pages.load("blank.html")
    coords = GeolocationCoordinates(
        45.5, -122.4194, accuracy=10.0, altitude=100.2, altitude_accuracy=5.0, heading=183.2, speed=10.0
    )

    driver.emulation.set_geolocation_override(coordinates=coords, contexts=[context_id])

    result = get_browser_geolocation(driver)

    assert "error" not in result, f"Geolocation error: {result.get('error')}"
    assert abs(result["latitude"] - coords.latitude) < 0.0001, f"Latitude mismatch: {result['latitude']}"
    assert abs(result["longitude"] - coords.longitude) < 0.0001, f"Longitude mismatch: {result['longitude']}"
    assert abs(result["accuracy"] - coords.accuracy) < 1.0, f"Accuracy mismatch: {result['accuracy']}"
    assert abs(result["altitude"] - coords.altitude) < 0.0001, f"Altitude mismatch: {result['altitude']}"
    assert abs(result["altitudeAccuracy"] - coords.altitude_accuracy) < 0.1, (
        f"Altitude accuracy mismatch: {result['altitudeAccuracy']}"
    )
    assert abs(result["heading"] - coords.heading) < 0.1, f"Heading mismatch: {result['heading']}"
    assert abs(result["speed"] - coords.speed) < 0.1, f"Speed mismatch: {result['speed']}"

    driver.browsing_context.close(context_id)


def test_set_geolocation_override_with_multiple_contexts(driver, pages):
    # Create two browsing contexts
    context1_id = driver.browsing_context.create(type=WindowTypes.TAB)
    context2_id = driver.browsing_context.create(type=WindowTypes.TAB)

    coords = GeolocationCoordinates(45.5, -122.4194, accuracy=10.0)

    driver.emulation.set_geolocation_override(coordinates=coords, contexts=[context1_id, context2_id])

    # Test first context
    driver.switch_to.window(context1_id)
    pages.load("blank.html")
    result1 = get_browser_geolocation(driver)

    assert "error" not in result1, f"Geolocation error in context1: {result1.get('error')}"
    assert abs(result1["latitude"] - coords.latitude) < 0.0001, f"Context1 latitude mismatch: {result1['latitude']}"
    assert abs(result1["longitude"] - coords.longitude) < 0.0001, f"Context1 longitude mismatch: {result1['longitude']}"
    assert abs(result1["accuracy"] - coords.accuracy) < 1.0, f"Context1 accuracy mismatch: {result1['accuracy']}"

    # Test second context
    driver.switch_to.window(context2_id)
    pages.load("blank.html")
    result2 = get_browser_geolocation(driver)

    assert "error" not in result2, f"Geolocation error in context2: {result2.get('error')}"
    assert abs(result2["latitude"] - coords.latitude) < 0.0001, f"Context2 latitude mismatch: {result2['latitude']}"
    assert abs(result2["longitude"] - coords.longitude) < 0.0001, f"Context2 longitude mismatch: {result2['longitude']}"
    assert abs(result2["accuracy"] - coords.accuracy) < 1.0, f"Context2 accuracy mismatch: {result2['accuracy']}"

    driver.browsing_context.close(context1_id)
    driver.browsing_context.close(context2_id)


def test_set_geolocation_override_with_multiple_user_contexts(driver, pages):
    # Create two user contexts
    user_context1 = driver.browser.create_user_context()
    user_context2 = driver.browser.create_user_context()

    context1_id = driver.browsing_context.create(type=WindowTypes.TAB, user_context=user_context1)
    context2_id = driver.browsing_context.create(type=WindowTypes.TAB, user_context=user_context2)

    coords = GeolocationCoordinates(45.5, -122.4194, accuracy=10.0)

    driver.emulation.set_geolocation_override(coordinates=coords, user_contexts=[user_context1, user_context2])

    # Test first user context
    driver.switch_to.window(context1_id)
    pages.load("blank.html")
    result1 = get_browser_geolocation(driver, user_context=user_context1)

    assert "error" not in result1, f"Geolocation error in user_context1: {result1.get('error')}"
    assert abs(result1["latitude"] - coords.latitude) < 0.0001, (
        f"User context1 latitude mismatch: {result1['latitude']}"
    )
    assert abs(result1["longitude"] - coords.longitude) < 0.0001, (
        f"User context1 longitude mismatch: {result1['longitude']}"
    )
    assert abs(result1["accuracy"] - coords.accuracy) < 1.0, f"User context1 accuracy mismatch: {result1['accuracy']}"

    # Test second user context
    driver.switch_to.window(context2_id)
    pages.load("blank.html")
    result2 = get_browser_geolocation(driver, user_context=user_context2)

    assert "error" not in result2, f"Geolocation error in user_context2: {result2.get('error')}"
    assert abs(result2["latitude"] - coords.latitude) < 0.0001, (
        f"User context2 latitude mismatch: {result2['latitude']}"
    )
    assert abs(result2["longitude"] - coords.longitude) < 0.0001, (
        f"User context2 longitude mismatch: {result2['longitude']}"
    )
    assert abs(result2["accuracy"] - coords.accuracy) < 1.0, f"User context2 accuracy mismatch: {result2['accuracy']}"

    driver.browsing_context.close(context1_id)
    driver.browsing_context.close(context2_id)
    driver.browser.remove_user_context(user_context1)
    driver.browser.remove_user_context(user_context2)


@pytest.mark.xfail_firefox
def test_set_geolocation_override_with_error(driver, pages):
    context_id = driver.current_window_handle
    pages.load("blank.html")

    error = GeolocationPositionError()

    driver.emulation.set_geolocation_override(error=error, contexts=[context_id])

    result = get_browser_geolocation(driver)
    assert "error" in result, f"Expected geolocation error, got: {result}"


def test_set_timezone_override_with_context(driver, pages):
    context_id = driver.current_window_handle
    pages.load("blank.html")

    initial_timezone_string = get_browser_timezone_string(driver)

    # Set timezone to Tokyo (UTC+9)
    driver.emulation.set_timezone_override(timezone="Asia/Tokyo", contexts=[context_id])

    timezone_offset = get_browser_timezone_offset(driver)
    timezone_string = get_browser_timezone_string(driver)

    # Tokyo is UTC+9, so the offset should be -540 minutes (negative because it's ahead of UTC)
    assert timezone_offset == -540, f"Expected timezone offset -540, got: {timezone_offset}"
    assert timezone_string == "Asia/Tokyo", f"Expected timezone 'Asia/Tokyo', got: {timezone_string}"

    # Clear the timezone override
    driver.emulation.set_timezone_override(timezone=None, contexts=[context_id])

    # verify setting timezone to None clears the timezone override
    timezone_after_clear_with_none = get_browser_timezone_string(driver)
    assert timezone_after_clear_with_none == initial_timezone_string


def test_set_timezone_override_with_user_context(driver, pages):
    user_context = driver.browser.create_user_context()
    context_id = driver.browsing_context.create(type=WindowTypes.TAB, user_context=user_context)

    driver.switch_to.window(context_id)
    pages.load("blank.html")

    driver.emulation.set_timezone_override(timezone="America/New_York", user_contexts=[user_context])

    timezone_string = get_browser_timezone_string(driver)
    assert timezone_string == "America/New_York", f"Expected timezone 'America/New_York', got: {timezone_string}"

    driver.emulation.set_timezone_override(timezone=None, user_contexts=[user_context])

    driver.browsing_context.close(context_id)
    driver.browser.remove_user_context(user_context)


@pytest.mark.xfail_firefox(reason="Firefox returns UTC as timezone string in case of offset.")
def test_set_timezone_override_using_offset(driver, pages):
    context_id = driver.current_window_handle
    pages.load("blank.html")

    # set timezone to India (UTC+05:30) using offset
    driver.emulation.set_timezone_override(timezone="+05:30", contexts=[context_id])

    timezone_offset = get_browser_timezone_offset(driver)
    timezone_string = get_browser_timezone_string(driver)

    # India is UTC+05:30, so the offset should be -330 minutes (negative because it's ahead of UTC)
    assert timezone_offset == -330, f"Expected timezone offset -540, got: {timezone_offset}"
    assert timezone_string == "+05:30", f"Expected timezone '+05:30', got: {timezone_string}"

    driver.emulation.set_timezone_override(timezone=None, contexts=[context_id])


@pytest.mark.parametrize(
    "locale,expected_locale",
    [
        # Locale with Unicode extension keyword for collation.
        ("de-DE-u-co-phonebk", "de-DE"),
        # Lowercase language and region.
        ("fr-ca", "fr-CA"),
        # Uppercase language and region (should be normalized by Intl.Locale).
        ("FR-CA", "fr-CA"),
        # Mixed case language and region (should be normalized by Intl.Locale).
        ("fR-cA", "fr-CA"),
        # Locale with transform extension (simple case).
        ("en-t-zh", "en"),
    ],
)
def test_set_locale_override_with_contexts(driver, pages, locale, expected_locale):
    context_id = driver.current_window_handle

    driver.emulation.set_locale_override(locale=locale, contexts=[context_id])

    driver.browsing_context.navigate(context_id, pages.url("formPage.html"), wait="complete")

    current_locale = get_browser_locale(driver)
    assert current_locale == expected_locale, f"Expected locale {expected_locale}, got {current_locale}"


@pytest.mark.parametrize(
    "value",
    [
        # Simple language code (2-letter).
        "en",
        # Language and region (both 2-letter).
        "en-US",
        # Language and script (4-letter).
        "sr-Latn",
        # Language, script, and region.
        "zh-Hans-CN",
    ],
)
def test_set_locale_override_with_user_contexts(driver, pages, value):
    user_context = driver.browser.create_user_context()
    try:
        context_id = driver.browsing_context.create(type=WindowTypes.TAB, user_context=user_context)
        try:
            driver.switch_to.window(context_id)

            driver.emulation.set_locale_override(locale=value, user_contexts=[user_context])

            driver.browsing_context.navigate(context_id, pages.url("formPage.html"), wait="complete")

            current_locale = get_browser_locale(driver)
            assert current_locale == value, f"Expected locale {value}, got {current_locale}"
        finally:
            driver.browsing_context.close(context_id)
    finally:
        driver.browser.remove_user_context(user_context)


@pytest.mark.xfail_firefox(reason="Not yet supported")
def test_set_scripting_enabled_with_contexts(driver, pages):
    context_id = driver.current_window_handle

    # disable scripting
    driver.emulation.set_scripting_enabled(enabled=False, contexts=[context_id])

    driver.browsing_context.navigate(
        context=context_id,
        url="data:text/html,<script>window.foo=123;</script>",
        wait="complete",
    )
    result = driver.script._evaluate("'foo' in window", {"context": context_id}, await_promise=False)
    assert result.result["value"] is False, "Page script should not have executed when scripting is disabled"

    # clear override via None to restore JS
    driver.emulation.set_scripting_enabled(enabled=None, contexts=[context_id])
    driver.browsing_context.navigate(
        context=context_id,
        url="data:text/html,<script>window.foo=123;</script>",
        wait="complete",
    )
    result = driver.script._evaluate("'foo' in window", {"context": context_id}, await_promise=False)
    assert result.result["value"] is True, "Page script should execute after clearing the override"


@pytest.mark.xfail_firefox(reason="Not yet supported")
def test_set_scripting_enabled_with_user_contexts(driver, pages):
    user_context = driver.browser.create_user_context()
    try:
        context_id = driver.browsing_context.create(type=WindowTypes.TAB, user_context=user_context)
        try:
            driver.switch_to.window(context_id)

            driver.emulation.set_scripting_enabled(enabled=False, user_contexts=[user_context])

            url = pages.url("javascriptPage.html")
            driver.browsing_context.navigate(context_id, url, wait="complete")

            # Check that inline event handlers don't work; this page has an onclick handler
            click_field = driver.find_element("id", "clickField")
            initial_value = click_field.get_attribute("value")  # initial value is 'Hello'
            click_field.click()

            # Get the value after click, it should remain unchanged if scripting is disabled
            result_value = driver.script._evaluate(
                "document.getElementById('clickField').value", {"context": context_id}, await_promise=False
            )
            assert result_value.result["value"] == initial_value, (
                "Inline onclick handler should not execute, i.e, value should not change to 'clicked'"
            )

            # Clear the scripting override
            driver.emulation.set_scripting_enabled(enabled=None, user_contexts=[user_context])

            driver.browsing_context.navigate(context_id, url, wait="complete")

            # Click the element again, it should change to 'Clicked' now
            driver.find_element("id", "clickField").click()
            result_value = driver.script._evaluate(
                "document.getElementById('clickField').value", {"context": context_id}, await_promise=False
            )
            assert result_value.result["value"] == "Clicked"
        finally:
            driver.browsing_context.close(context_id)
    finally:
        driver.browser.remove_user_context(user_context)


def test_set_screen_orientation_override_with_contexts(driver, pages):
    context_id = driver.current_window_handle
    initial_orientation = get_screen_orientation(driver, context_id)

    # Set landscape-primary orientation
    orientation = ScreenOrientation(
        natural=ScreenOrientationNatural.LANDSCAPE,
        type=ScreenOrientationType.LANDSCAPE_PRIMARY,
    )
    driver.emulation.set_screen_orientation_override(screen_orientation=orientation, contexts=[context_id])

    url = pages.url("formPage.html")
    driver.browsing_context.navigate(context_id, url, wait="complete")

    # Verify the orientation was set
    current_orientation = get_screen_orientation(driver, context_id)
    assert current_orientation["type"] == "landscape-primary", f"Expected landscape-primary, got {current_orientation}"
    assert current_orientation["angle"] == 0, f"Expected angle 0, got {current_orientation['angle']}"

    # Set portrait-secondary orientation
    orientation = ScreenOrientation(
        natural=ScreenOrientationNatural.PORTRAIT,
        type=ScreenOrientationType.PORTRAIT_SECONDARY,
    )
    driver.emulation.set_screen_orientation_override(screen_orientation=orientation, contexts=[context_id])

    # Verify the orientation was changed
    current_orientation = get_screen_orientation(driver, context_id)
    assert current_orientation["type"] == "portrait-secondary", (
        f"Expected portrait-secondary, got {current_orientation}"
    )
    assert current_orientation["angle"] == 180, f"Expected angle 180, got {current_orientation['angle']}"

    driver.emulation.set_screen_orientation_override(screen_orientation=None, contexts=[context_id])

    # Verify orientation was cleared
    assert get_screen_orientation(driver, context_id) == initial_orientation


@pytest.mark.parametrize(
    "natural,orientation_type,expected_angle",
    [
        # Portrait natural orientations
        ("Portrait", "portrait-primary", 0),
        ("portrait", "portrait-secondary", 180),
        ("portrait", "landscape-primary", 90),
        ("portrait", "landscape-secondary", 270),
        # Landscape natural orientations
        ("Landscape", "Portrait-Primary", 90),  # test with different casing
        ("landscape", "portrait-secondary", 270),
        ("landscape", "landscape-primary", 0),
        ("landscape", "landscape-secondary", 180),
    ],
)
def test_set_screen_orientation_override_with_user_contexts(driver, pages, natural, orientation_type, expected_angle):
    user_context = driver.browser.create_user_context()
    try:
        context_id = driver.browsing_context.create(type=WindowTypes.TAB, user_context=user_context)
        try:
            driver.switch_to.window(context_id)

            # Set the specified orientation
            orientation = ScreenOrientation(natural=natural, type=orientation_type)
            driver.emulation.set_screen_orientation_override(
                screen_orientation=orientation, user_contexts=[user_context]
            )

            url = pages.url("formPage.html")
            driver.browsing_context.navigate(context_id, url, wait="complete")

            # Verify the orientation was set
            current_orientation = get_screen_orientation(driver, context_id)

            assert current_orientation["type"] == orientation_type.lower()
            assert current_orientation["angle"] == expected_angle

            driver.emulation.set_screen_orientation_override(screen_orientation=None, user_contexts=[user_context])
        finally:
            driver.browsing_context.close(context_id)
    finally:
        driver.browser.remove_user_context(user_context)


def test_set_user_agent_override_with_contexts(driver, pages):
    context_id = driver.current_window_handle
    url = pages.url("formPage.html")
    driver.browsing_context.navigate(context_id, url, wait="complete")
    initial_user_agent = get_browser_user_agent(driver)

    custom_user_agent = "Mozilla/5.0 (Custom Test Agent)"
    driver.emulation.set_user_agent_override(user_agent=custom_user_agent, contexts=[context_id])

    assert get_browser_user_agent(driver) == custom_user_agent

    driver.emulation.set_user_agent_override(user_agent=None, contexts=[context_id])
    assert get_browser_user_agent(driver) == initial_user_agent


def test_set_user_agent_override_with_user_contexts(driver, pages):
    user_context = driver.browser.create_user_context()
    try:
        context_id = driver.browsing_context.create(type=WindowTypes.TAB, user_context=user_context)
        try:
            driver.switch_to.window(context_id)
            url = pages.url("formPage.html")
            driver.browsing_context.navigate(context_id, url, wait="complete")
            initial_user_agent = get_browser_user_agent(driver)

            custom_user_agent = "Mozilla/5.0 (Custom User Context Agent)"
            driver.emulation.set_user_agent_override(user_agent=custom_user_agent, user_contexts=[user_context])

            assert get_browser_user_agent(driver) == custom_user_agent

            driver.emulation.set_user_agent_override(user_agent=None, user_contexts=[user_context])
            assert get_browser_user_agent(driver) == initial_user_agent
        finally:
            driver.browsing_context.close(context_id)
    finally:
        driver.browser.remove_user_context(user_context)
