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

"""Mirror of ``../bidi/emulation_tests.py`` using the generated ``_bidi`` commands, not the ``driver`` facade."""

import pytest

from selenium.webdriver.common._bidi.browser import Browser
from selenium.webdriver.common._bidi.browsing_context import BrowsingContext, CreateType, ReadinessState
from selenium.webdriver.common._bidi.emulation import (
    Emulation,
    GeolocationCoordinates,
    GeolocationPositionError,
    NetworkConditionsOffline,
    ScreenArea,
    ScreenOrientation,
    ScreenOrientationNatural,
    ScreenOrientationType,
)
from selenium.webdriver.common._bidi.permissions import PermissionDescriptor, Permissions, PermissionState
from selenium.webdriver.common._bidi.script import ContextTarget, Script


def _eval(driver, expression, context_id):
    return Script(driver).evaluate(expression, ContextTarget(context=context_id), False).result.value


def get_browser_timezone_string(driver):
    return _eval(driver, "Intl.DateTimeFormat().resolvedOptions().timeZone", driver.current_window_handle)


def get_browser_timezone_offset(driver):
    return _eval(driver, "new Date().getTimezoneOffset()", driver.current_window_handle)


def get_browser_geolocation(driver, user_context=None):
    origin = driver.execute_script("return window.location.origin;")
    extra = {"user_context": user_context} if user_context else {}
    Permissions(driver).set_permission(
        descriptor=PermissionDescriptor(name="geolocation"), state=PermissionState.GRANTED, origin=origin, **extra
    )

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
    return _eval(driver, "Intl.DateTimeFormat().resolvedOptions().locale", driver.current_window_handle)


def get_screen_orientation(driver, context_id):
    return {
        "type": _eval(driver, "screen.orientation.type", context_id),
        "angle": _eval(driver, "screen.orientation.angle", context_id),
    }


def get_browser_user_agent(driver):
    return _eval(driver, "navigator.userAgent", driver.current_window_handle)


def is_online(driver, context_id):
    return _eval(driver, "navigator.onLine", context_id)


def get_screen_dimensions(driver, context_id):
    return {
        "width": _eval(driver, "screen.width", context_id),
        "height": _eval(driver, "screen.height", context_id),
    }


def test_set_geolocation_override_with_coordinates_in_context(driver, pages):
    context_id = driver.current_window_handle
    pages.load("blank.html")
    coords = GeolocationCoordinates(45.5, -122.4194, accuracy=10.0)

    Emulation(driver).set_geolocation_override(coordinates=coords, contexts=[context_id])

    result = get_browser_geolocation(driver)
    assert "error" not in result, f"Geolocation error: {result.get('error')}"
    assert abs(result["latitude"] - coords.latitude) < 0.0001
    assert abs(result["longitude"] - coords.longitude) < 0.0001
    assert abs(result["accuracy"] - coords.accuracy) < 1.0


def test_set_geolocation_override_with_coordinates_in_user_context(driver, pages):
    user_context = Browser(driver).create_user_context().user_context
    context_id = BrowsingContext(driver).create(type=CreateType.TAB, user_context=user_context).context

    driver.switch_to.window(context_id)
    pages.load("blank.html")
    coords = GeolocationCoordinates(45.5, -122.4194, accuracy=10.0)

    Emulation(driver).set_geolocation_override(coordinates=coords, user_contexts=[user_context])

    result = get_browser_geolocation(driver, user_context=user_context)
    assert "error" not in result, f"Geolocation error: {result.get('error')}"
    assert abs(result["latitude"] - coords.latitude) < 0.0001
    assert abs(result["longitude"] - coords.longitude) < 0.0001
    assert abs(result["accuracy"] - coords.accuracy) < 1.0

    BrowsingContext(driver).close(context=context_id)
    Browser(driver).remove_user_context(user_context=user_context)


def test_set_geolocation_override_all_coords(driver, pages):
    context_id = driver.current_window_handle
    pages.load("blank.html")
    coords = GeolocationCoordinates(
        45.5, -122.4194, accuracy=10.0, altitude=100.2, altitude_accuracy=5.0, heading=183.2, speed=10.0
    )

    Emulation(driver).set_geolocation_override(coordinates=coords, contexts=[context_id])

    result = get_browser_geolocation(driver)
    assert "error" not in result
    assert abs(result["latitude"] - coords.latitude) < 0.0001
    assert abs(result["longitude"] - coords.longitude) < 0.0001
    assert abs(result["accuracy"] - coords.accuracy) < 1.0
    assert abs(result["altitude"] - coords.altitude) < 0.0001
    assert abs(result["altitudeAccuracy"] - coords.altitude_accuracy) < 0.1
    assert abs(result["heading"] - coords.heading) < 0.1
    assert abs(result["speed"] - coords.speed) < 0.1

    BrowsingContext(driver).close(context=context_id)


def test_set_geolocation_override_with_multiple_contexts(driver, pages):
    bc = BrowsingContext(driver)
    context1_id = bc.create(type=CreateType.TAB).context
    context2_id = bc.create(type=CreateType.TAB).context

    coords = GeolocationCoordinates(45.5, -122.4194, accuracy=10.0)
    Emulation(driver).set_geolocation_override(coordinates=coords, contexts=[context1_id, context2_id])

    for context_id in (context1_id, context2_id):
        driver.switch_to.window(context_id)
        pages.load("blank.html")
        result = get_browser_geolocation(driver)
        assert "error" not in result
        assert abs(result["latitude"] - coords.latitude) < 0.0001
        assert abs(result["longitude"] - coords.longitude) < 0.0001
        assert abs(result["accuracy"] - coords.accuracy) < 1.0

    bc.close(context=context1_id)
    bc.close(context=context2_id)


def test_set_geolocation_override_with_multiple_user_contexts(driver, pages):
    browser = Browser(driver)
    user_context1 = browser.create_user_context().user_context
    user_context2 = browser.create_user_context().user_context

    bc = BrowsingContext(driver)
    context1_id = bc.create(type=CreateType.TAB, user_context=user_context1).context
    context2_id = bc.create(type=CreateType.TAB, user_context=user_context2).context

    coords = GeolocationCoordinates(45.5, -122.4194, accuracy=10.0)
    Emulation(driver).set_geolocation_override(coordinates=coords, user_contexts=[user_context1, user_context2])

    for context_id, user_context in ((context1_id, user_context1), (context2_id, user_context2)):
        driver.switch_to.window(context_id)
        pages.load("blank.html")
        result = get_browser_geolocation(driver, user_context=user_context)
        assert "error" not in result
        assert abs(result["latitude"] - coords.latitude) < 0.0001
        assert abs(result["longitude"] - coords.longitude) < 0.0001
        assert abs(result["accuracy"] - coords.accuracy) < 1.0

    bc.close(context=context1_id)
    bc.close(context=context2_id)
    browser.remove_user_context(user_context=user_context1)
    browser.remove_user_context(user_context=user_context2)


@pytest.mark.xfail_firefox
def test_set_geolocation_override_with_error(driver, pages):
    context_id = driver.current_window_handle
    pages.load("blank.html")

    Emulation(driver).set_geolocation_override(error=GeolocationPositionError(), contexts=[context_id])

    result = get_browser_geolocation(driver)
    assert "error" in result


def test_set_timezone_override_with_context(driver, pages):
    context_id = driver.current_window_handle
    pages.load("blank.html")
    initial_timezone_string = get_browser_timezone_string(driver)

    Emulation(driver).set_timezone_override(timezone="Asia/Tokyo", contexts=[context_id])

    assert get_browser_timezone_offset(driver) == -540
    assert get_browser_timezone_string(driver) == "Asia/Tokyo"

    Emulation(driver).set_timezone_override(timezone=None, contexts=[context_id])
    assert get_browser_timezone_string(driver) == initial_timezone_string


def test_set_timezone_override_with_user_context(driver, pages):
    user_context = Browser(driver).create_user_context().user_context
    context_id = BrowsingContext(driver).create(type=CreateType.TAB, user_context=user_context).context

    driver.switch_to.window(context_id)
    pages.load("blank.html")

    Emulation(driver).set_timezone_override(timezone="America/New_York", user_contexts=[user_context])
    assert get_browser_timezone_string(driver) == "America/New_York"

    Emulation(driver).set_timezone_override(timezone=None, user_contexts=[user_context])

    BrowsingContext(driver).close(context=context_id)
    Browser(driver).remove_user_context(user_context=user_context)


@pytest.mark.xfail_firefox(reason="Firefox returns UTC as timezone string in case of offset.")
def test_set_timezone_override_using_offset(driver, pages):
    context_id = driver.current_window_handle
    pages.load("blank.html")

    Emulation(driver).set_timezone_override(timezone="+05:30", contexts=[context_id])

    assert get_browser_timezone_offset(driver) == -330
    assert get_browser_timezone_string(driver) == "+05:30"

    Emulation(driver).set_timezone_override(timezone=None, contexts=[context_id])


@pytest.mark.parametrize(
    ("locale", "expected_locale"),
    [
        ("de-DE-u-co-phonebk", "de-DE"),
        ("fr-ca", "fr-CA"),
        ("FR-CA", "fr-CA"),
        ("fR-cA", "fr-CA"),
        ("en-t-zh", "en"),
    ],
)
def test_set_locale_override_with_contexts(driver, pages, locale, expected_locale):
    context_id = driver.current_window_handle

    Emulation(driver).set_locale_override(locale=locale, contexts=[context_id])
    BrowsingContext(driver).navigate(context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE)

    assert get_browser_locale(driver) == expected_locale


@pytest.mark.parametrize("value", ["en", "en-US", "sr-Latn", "zh-Hans-CN"])
def test_set_locale_override_with_user_contexts(driver, pages, value):
    user_context = Browser(driver).create_user_context().user_context
    try:
        context_id = BrowsingContext(driver).create(type=CreateType.TAB, user_context=user_context).context
        try:
            driver.switch_to.window(context_id)
            Emulation(driver).set_locale_override(locale=value, user_contexts=[user_context])
            BrowsingContext(driver).navigate(
                context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE
            )
            assert get_browser_locale(driver) == value
        finally:
            BrowsingContext(driver).close(context=context_id)
    finally:
        Browser(driver).remove_user_context(user_context=user_context)


@pytest.mark.xfail_firefox(reason="Not yet supported")
def test_set_scripting_enabled_with_contexts(driver, pages):
    context_id = driver.current_window_handle
    emulation = Emulation(driver)
    bc = BrowsingContext(driver)

    emulation.set_scripting_enabled(enabled=False, contexts=[context_id])
    bc.navigate(context=context_id, url="data:text/html,<script>window.foo=123;</script>", wait=ReadinessState.COMPLETE)
    assert _eval(driver, "'foo' in window", context_id) is False

    emulation.set_scripting_enabled(enabled=None, contexts=[context_id])
    bc.navigate(context=context_id, url="data:text/html,<script>window.foo=123;</script>", wait=ReadinessState.COMPLETE)
    assert _eval(driver, "'foo' in window", context_id) is True


@pytest.mark.xfail_firefox(reason="Not yet supported")
def test_set_scripting_enabled_with_user_contexts(driver, pages):
    user_context = Browser(driver).create_user_context().user_context
    try:
        context_id = BrowsingContext(driver).create(type=CreateType.TAB, user_context=user_context).context
        try:
            driver.switch_to.window(context_id)
            Emulation(driver).set_scripting_enabled(enabled=False, user_contexts=[user_context])

            url = pages.url("javascriptPage.html")
            BrowsingContext(driver).navigate(context=context_id, url=url, wait=ReadinessState.COMPLETE)

            click_field = driver.find_element("id", "clickField")
            initial_value = click_field.get_attribute("value")
            click_field.click()
            assert _eval(driver, "document.getElementById('clickField').value", context_id) == initial_value

            Emulation(driver).set_scripting_enabled(enabled=None, user_contexts=[user_context])
            BrowsingContext(driver).navigate(context=context_id, url=url, wait=ReadinessState.COMPLETE)
            driver.find_element("id", "clickField").click()
            assert _eval(driver, "document.getElementById('clickField').value", context_id) == "Clicked"
        finally:
            BrowsingContext(driver).close(context=context_id)
    finally:
        Browser(driver).remove_user_context(user_context=user_context)


def test_set_screen_orientation_override_with_contexts(driver, pages):
    context_id = driver.current_window_handle
    initial_orientation = get_screen_orientation(driver, context_id)

    orientation = ScreenOrientation(
        natural=ScreenOrientationNatural.LANDSCAPE, type=ScreenOrientationType.LANDSCAPE_PRIMARY
    )
    Emulation(driver).set_screen_orientation_override(screen_orientation=orientation, contexts=[context_id])
    BrowsingContext(driver).navigate(context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE)

    current = get_screen_orientation(driver, context_id)
    assert current["type"] == "landscape-primary"
    assert current["angle"] == 0

    orientation = ScreenOrientation(
        natural=ScreenOrientationNatural.PORTRAIT, type=ScreenOrientationType.PORTRAIT_SECONDARY
    )
    Emulation(driver).set_screen_orientation_override(screen_orientation=orientation, contexts=[context_id])
    current = get_screen_orientation(driver, context_id)
    assert current["type"] == "portrait-secondary"
    assert current["angle"] == 180

    Emulation(driver).set_screen_orientation_override(screen_orientation=None, contexts=[context_id])
    assert get_screen_orientation(driver, context_id) == initial_orientation


@pytest.mark.parametrize(
    ("natural", "orientation_type", "expected_angle"),
    [
        ("Portrait", "portrait-primary", 0),
        ("portrait", "portrait-secondary", 180),
        ("portrait", "landscape-primary", 90),
        ("portrait", "landscape-secondary", 270),
        ("Landscape", "Portrait-Primary", 90),
        ("landscape", "portrait-secondary", 270),
        ("landscape", "landscape-primary", 0),
        ("landscape", "landscape-secondary", 180),
    ],
)
def test_set_screen_orientation_override_with_user_contexts(driver, pages, natural, orientation_type, expected_angle):
    user_context = Browser(driver).create_user_context().user_context
    try:
        context_id = BrowsingContext(driver).create(type=CreateType.TAB, user_context=user_context).context
        try:
            driver.switch_to.window(context_id)
            # ScreenOrientation validates its enum fields on serialize, so normalize the mixed-case strings.
            orientation = ScreenOrientation(
                natural=ScreenOrientationNatural(natural.lower()), type=ScreenOrientationType(orientation_type.lower())
            )
            Emulation(driver).set_screen_orientation_override(
                screen_orientation=orientation, user_contexts=[user_context]
            )
            BrowsingContext(driver).navigate(
                context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE
            )

            current = get_screen_orientation(driver, context_id)
            assert current["type"] == orientation_type.lower()
            assert current["angle"] == expected_angle

            Emulation(driver).set_screen_orientation_override(screen_orientation=None, user_contexts=[user_context])
        finally:
            BrowsingContext(driver).close(context=context_id)
    finally:
        Browser(driver).remove_user_context(user_context=user_context)


def test_set_user_agent_override_with_contexts(driver, pages):
    context_id = driver.current_window_handle
    BrowsingContext(driver).navigate(context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE)
    initial_user_agent = get_browser_user_agent(driver)

    custom_user_agent = "Mozilla/5.0 (Custom Test Agent)"
    Emulation(driver).set_user_agent_override(user_agent=custom_user_agent, contexts=[context_id])
    assert get_browser_user_agent(driver) == custom_user_agent

    Emulation(driver).set_user_agent_override(user_agent=None, contexts=[context_id])
    assert get_browser_user_agent(driver) == initial_user_agent


def test_set_user_agent_override_with_user_contexts(driver, pages):
    user_context = Browser(driver).create_user_context().user_context
    try:
        context_id = BrowsingContext(driver).create(type=CreateType.TAB, user_context=user_context).context
        try:
            driver.switch_to.window(context_id)
            BrowsingContext(driver).navigate(
                context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE
            )
            initial_user_agent = get_browser_user_agent(driver)

            custom_user_agent = "Mozilla/5.0 (Custom User Context Agent)"
            Emulation(driver).set_user_agent_override(user_agent=custom_user_agent, user_contexts=[user_context])
            assert get_browser_user_agent(driver) == custom_user_agent

            Emulation(driver).set_user_agent_override(user_agent=None, user_contexts=[user_context])
            assert get_browser_user_agent(driver) == initial_user_agent
        finally:
            BrowsingContext(driver).close(context=context_id)
    finally:
        Browser(driver).remove_user_context(user_context=user_context)


@pytest.mark.xfail_firefox
def test_set_network_conditions_offline_with_context(driver, pages):
    context_id = driver.current_window_handle
    BrowsingContext(driver).navigate(context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE)

    assert is_online(driver, context_id) is True
    try:
        Emulation(driver).set_network_conditions(network_conditions=NetworkConditionsOffline(), contexts=[context_id])
        assert is_online(driver, context_id) is False
    finally:
        Emulation(driver).set_network_conditions(network_conditions=None, contexts=[context_id])
        assert is_online(driver, context_id) is True


@pytest.mark.xfail_firefox
def test_set_network_conditions_offline_with_user_context(driver, pages):
    user_context = Browser(driver).create_user_context().user_context
    try:
        context_id = BrowsingContext(driver).create(type=CreateType.TAB, user_context=user_context).context
        try:
            driver.switch_to.window(context_id)
            BrowsingContext(driver).navigate(
                context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE
            )
            assert is_online(driver, context_id) is True

            Emulation(driver).set_network_conditions(
                network_conditions=NetworkConditionsOffline(), user_contexts=[user_context]
            )
            assert is_online(driver, context_id) is False
        finally:
            Emulation(driver).set_network_conditions(network_conditions=None, user_contexts=[user_context])
            BrowsingContext(driver).close(context=context_id)
    finally:
        Browser(driver).remove_user_context(user_context=user_context)


@pytest.mark.xfail_chrome
@pytest.mark.xfail_edge
def test_set_screen_settings_override_with_contexts(driver, pages):
    context_id = driver.current_window_handle
    BrowsingContext(driver).navigate(context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE)
    initial_dimensions = get_screen_dimensions(driver, context_id)

    try:
        Emulation(driver).set_screen_settings_override(
            screen_area=ScreenArea(width=1024, height=768), contexts=[context_id]
        )
        current = get_screen_dimensions(driver, context_id)
        assert current["width"] == 1024
        assert current["height"] == 768
    finally:
        Emulation(driver).set_screen_settings_override(screen_area=None, contexts=[context_id])
        assert get_screen_dimensions(driver, context_id) == initial_dimensions


@pytest.mark.xfail_chrome
@pytest.mark.xfail_edge
def test_set_screen_settings_override_with_user_contexts(driver, pages):
    user_context = Browser(driver).create_user_context().user_context
    try:
        context_id = BrowsingContext(driver).create(type=CreateType.TAB, user_context=user_context).context
        try:
            driver.switch_to.window(context_id)
            BrowsingContext(driver).navigate(
                context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE
            )
            initial_dimensions = get_screen_dimensions(driver, context_id)

            Emulation(driver).set_screen_settings_override(
                screen_area=ScreenArea(width=800, height=600), user_contexts=[user_context]
            )
            current = get_screen_dimensions(driver, context_id)
            assert current["width"] == 800
            assert current["height"] == 600

            Emulation(driver).set_screen_settings_override(screen_area=None, user_contexts=[user_context])
            assert get_screen_dimensions(driver, context_id) == initial_dimensions
        finally:
            BrowsingContext(driver).close(context=context_id)
    finally:
        Browser(driver).remove_user_context(user_context=user_context)
