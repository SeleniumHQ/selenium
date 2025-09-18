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

from selenium.webdriver.common.bidi.emulation import Emulation, GeolocationCoordinates, GeolocationPositionError
from selenium.webdriver.common.bidi.permissions import PermissionState
from selenium.webdriver.common.window import WindowTypes


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


def test_emulation_initialized(driver):
    """Test that the emulation module is initialized properly."""
    assert driver.emulation is not None
    assert isinstance(driver.emulation, Emulation)


def test_set_geolocation_override_with_coordinates_in_context(driver, pages):
    """Test setting geolocation override with coordinates."""
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
    """Test setting geolocation override with coordinates in a user context."""
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
    """Test setting geolocation override with coordinates."""
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
    """Test setting geolocation override with multiple browsing contexts."""
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
    """Test setting geolocation override with multiple user contexts."""
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
    """Test setting geolocation override with error."""
    context_id = driver.current_window_handle
    pages.load("blank.html")

    error = GeolocationPositionError()

    driver.emulation.set_geolocation_override(error=error, contexts=[context_id])

    result = get_browser_geolocation(driver)
    assert "error" in result, f"Expected geolocation error, got: {result}"
