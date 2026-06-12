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

from selenium.webdriver.common.bidi.permissions import PermissionDescriptor, PermissionState
from selenium.webdriver.common.window import WindowTypes


def get_origin(driver):
    """Get the current window origin."""
    return driver.execute_script("return window.location.origin;")


def get_geolocation_permission(driver):
    """Get the geolocation permission state."""
    script = """
    const callback = arguments[arguments.length - 1];
    navigator.permissions.query({ name: 'geolocation' }).then(permission => {
        callback(permission.state);
    }).catch(error => {
        callback(null);
    });
    """
    return driver.execute_async_script(script)


def test_permissions_initialized(driver):
    """Test that the permissions module is initialized properly."""
    assert driver.permissions is not None


def test_can_set_permission_to_granted(driver, pages):
    """Test setting permission to granted state."""
    pages.load("blank.html")

    origin = get_origin(driver)

    # Set geolocation permission to granted
    driver.permissions.set_permission("geolocation", PermissionState.GRANTED, origin=origin)

    result = get_geolocation_permission(driver)
    assert result == PermissionState.GRANTED


def test_can_set_permission_to_denied(driver, pages):
    """Test setting permission to denied state."""
    pages.load("blank.html")

    origin = get_origin(driver)

    # Set geolocation permission to denied
    driver.permissions.set_permission("geolocation", PermissionState.DENIED, origin=origin)

    result = get_geolocation_permission(driver)
    assert result == PermissionState.DENIED


def test_can_set_permission_to_prompt(driver, pages):
    """Test setting permission to prompt state."""
    pages.load("blank.html")

    origin = get_origin(driver)

    # First set to denied, then to prompt since most of the time the default state is prompt
    driver.permissions.set_permission("geolocation", PermissionState.DENIED, origin=origin)
    driver.permissions.set_permission("geolocation", PermissionState.PROMPT, origin=origin)

    result = get_geolocation_permission(driver)
    assert result == PermissionState.PROMPT


def test_can_set_permission_for_user_context(driver, pages):
    """Test setting permission for a specific user context."""
    # Create a user context
    user_context = driver.browser.create_user_context()

    context_id = driver.browsing_context.create(type=WindowTypes.TAB, user_context=user_context)

    # Navigate both contexts to the same page
    pages.load("blank.html")
    original_window = driver.current_window_handle
    driver.switch_to.window(context_id)
    pages.load("blank.html")

    origin = get_origin(driver)

    # Get original permission states
    driver.switch_to.window(original_window)
    original_permission = get_geolocation_permission(driver)

    driver.switch_to.window(context_id)

    # Set permission only for the user context using PermissionDescriptor
    descriptor = PermissionDescriptor("geolocation")
    driver.permissions.set_permission(descriptor, PermissionState.GRANTED, origin=origin, user_context=user_context)

    # Check that the original window's permission hasn't changed
    driver.switch_to.window(original_window)
    updated_original_permission = get_geolocation_permission(driver)
    assert updated_original_permission == original_permission

    # Check that the new context's permission was updated
    driver.switch_to.window(context_id)
    updated_new_context_permission = get_geolocation_permission(driver)
    assert updated_new_context_permission == PermissionState.GRANTED

    driver.browsing_context.close(context_id)
    driver.browser.remove_user_context(user_context)


def test_invalid_permission_state_raises_error(driver, pages):
    """Test that invalid permission state raises ValueError."""
    pages.load("blank.html")
    origin = get_origin(driver)

    # set permission using PermissionDescriptor
    descriptor = PermissionDescriptor("geolocation")

    with pytest.raises(ValueError, match="Invalid permission state"):
        driver.permissions.set_permission(descriptor, "invalid_state", origin=origin)


def test_permission_states_constants():
    """Test that permission state constants are correctly defined."""
    assert PermissionState.GRANTED == "granted"
    assert PermissionState.DENIED == "denied"
    assert PermissionState.PROMPT == "prompt"


def test_scoping_args_are_keyword_only(driver, pages):
    """Verify origin, user_context, and embedded_origin are all keyword-only.

    Only descriptor and state may be passed positionally; everything that scopes
    the permission must be a keyword argument, matching the grant/deny/reset API.
    """
    pages.load("blank.html")
    origin = get_origin(driver)

    # origin passed positionally must raise TypeError
    with pytest.raises(TypeError):
        driver.permissions.set_permission("geolocation", PermissionState.DENIED, origin)


def test_can_set_permission_with_embedded_origin(driver, pages):
    """Verify that embedded_origin can be passed as a keyword argument without error.

    Uses the same origin for both origin and embedded_origin since the test
    environment is single-origin; the goal is to confirm that the keyword argument
    is accepted and the permission change is applied, not to test cross-origin policy.
    """
    pages.load("blank.html")
    origin = get_origin(driver)

    # embedded_origin is keyword-only — passing it should not raise
    driver.permissions.set_permission(
        "geolocation",
        PermissionState.GRANTED,
        origin=origin,
        embedded_origin=origin,
    )

    result = get_geolocation_permission(driver)
    assert result == PermissionState.GRANTED


# ---------------------------------------------------------------------------
# Convenience methods: grant / deny / reset
# ---------------------------------------------------------------------------


def test_grant_sets_permission_to_granted(driver, pages):
    """Test that grant() sets a permission to the granted state."""
    pages.load("blank.html")
    origin = get_origin(driver)

    driver.permissions.grant("geolocation", origin=origin)

    assert get_geolocation_permission(driver) == PermissionState.GRANTED


def test_deny_sets_permission_to_denied(driver, pages):
    """Test that deny() sets a permission to the denied state."""
    pages.load("blank.html")
    origin = get_origin(driver)

    driver.permissions.deny("geolocation", origin=origin)

    assert get_geolocation_permission(driver) == PermissionState.DENIED


def test_reset_restores_prompt(driver, pages):
    """Test that reset() with a descriptor restores the permission to prompt."""
    pages.load("blank.html")
    origin = get_origin(driver)

    driver.permissions.deny("geolocation", origin=origin)
    driver.permissions.reset("geolocation", origin=origin)

    assert get_geolocation_permission(driver) == PermissionState.PROMPT


def test_grant_with_list_grants_multiple_permissions(driver, pages):
    """Test that grant() with a list grants all listed permissions."""
    pages.load("blank.html")
    origin = get_origin(driver)

    driver.permissions.grant(["geolocation", "notifications"], origin=origin)

    assert get_geolocation_permission(driver) == PermissionState.GRANTED


def test_grant_with_permission_descriptor(driver, pages):
    """Test that grant() accepts a PermissionDescriptor as well as a string."""
    pages.load("blank.html")
    origin = get_origin(driver)

    driver.permissions.grant(PermissionDescriptor("geolocation"), origin=origin)

    assert get_geolocation_permission(driver) == PermissionState.GRANTED


def test_grant_with_user_context(driver, pages):
    """Test that grant() with user_context scopes the override to that context only."""
    user_context = driver.browser.create_user_context()
    context_id = driver.browsing_context.create(type=WindowTypes.TAB, user_context=user_context)

    pages.load("blank.html")
    original_window = driver.current_window_handle
    driver.switch_to.window(context_id)
    pages.load("blank.html")
    origin = get_origin(driver)

    driver.switch_to.window(original_window)
    original_permission = get_geolocation_permission(driver)

    driver.permissions.grant("geolocation", origin=origin, user_context=user_context)

    driver.switch_to.window(original_window)
    assert get_geolocation_permission(driver) == original_permission

    driver.switch_to.window(context_id)
    assert get_geolocation_permission(driver) == PermissionState.GRANTED

    driver.browsing_context.close(context_id)
    driver.browser.remove_user_context(user_context)


# ---------------------------------------------------------------------------
# reset (no-arg and list forms)
# ---------------------------------------------------------------------------


def test_reset_with_no_args_clears_all_tracked_overrides(driver, pages):
    """Test that reset() with no argument resets all overrides applied via grant/deny."""
    pages.load("blank.html")
    origin = get_origin(driver)

    driver.permissions.grant("geolocation", origin=origin)
    assert get_geolocation_permission(driver) == PermissionState.GRANTED

    driver.permissions.reset()

    assert get_geolocation_permission(driver) == PermissionState.PROMPT


def test_reset_with_list_resets_multiple_permissions(driver, pages):
    """Test that reset() with a list resets each listed permission to prompt."""
    pages.load("blank.html")
    origin = get_origin(driver)

    driver.permissions.grant("geolocation", origin=origin)
    driver.permissions.reset(["geolocation"], origin=origin)

    assert get_geolocation_permission(driver) == PermissionState.PROMPT


def test_reset_no_args_only_affects_tracked_overrides(driver, pages):
    """Test that reset() does not disturb permissions set via set_permission directly."""
    pages.load("blank.html")
    origin = get_origin(driver)

    # set_permission is not tracked by the manager
    driver.permissions.set_permission("geolocation", PermissionState.GRANTED, origin=origin)

    # reset() with no args is a no-op here (nothing tracked)
    driver.permissions.reset()

    # The permission set via set_permission is unaffected
    assert get_geolocation_permission(driver) == PermissionState.GRANTED


# ---------------------------------------------------------------------------
# override context manager
# ---------------------------------------------------------------------------


def test_override_grants_within_block_and_resets_after(driver, pages):
    """Test that override() applies the state on enter and resets to prompt on exit."""
    pages.load("blank.html")
    origin = get_origin(driver)

    with driver.permissions.override("geolocation", "granted", origin=origin):
        assert get_geolocation_permission(driver) == PermissionState.GRANTED

    assert get_geolocation_permission(driver) == PermissionState.PROMPT


def test_override_resets_even_after_exception(driver, pages):
    """Test that override() resets the permission even when the body raises."""
    pages.load("blank.html")
    origin = get_origin(driver)

    try:
        with driver.permissions.override("geolocation", "granted", origin=origin):
            raise RuntimeError("simulated failure")
    except RuntimeError:
        pass

    assert get_geolocation_permission(driver) == PermissionState.PROMPT


def test_override_with_permission_descriptor(driver, pages):
    """Test that override() accepts a PermissionDescriptor as well as a string."""
    pages.load("blank.html")
    origin = get_origin(driver)

    with driver.permissions.override(PermissionDescriptor("geolocation"), "denied", origin=origin):
        assert get_geolocation_permission(driver) == PermissionState.DENIED

    assert get_geolocation_permission(driver) == PermissionState.PROMPT
