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
    driver.permissions.set_permission("geolocation", PermissionState.GRANTED, origin)

    result = get_geolocation_permission(driver)
    assert result == PermissionState.GRANTED


def test_can_set_permission_to_denied(driver, pages):
    """Test setting permission to denied state."""
    pages.load("blank.html")

    origin = get_origin(driver)

    # Set geolocation permission to denied
    driver.permissions.set_permission("geolocation", PermissionState.DENIED, origin)

    result = get_geolocation_permission(driver)
    assert result == PermissionState.DENIED


def test_can_set_permission_to_prompt(driver, pages):
    """Test setting permission to prompt state."""
    pages.load("blank.html")

    origin = get_origin(driver)

    # First set to denied, then to prompt since most of the time the default state is prompt
    driver.permissions.set_permission("geolocation", PermissionState.DENIED, origin)
    driver.permissions.set_permission("geolocation", PermissionState.PROMPT, origin)

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
    driver.permissions.set_permission(descriptor, PermissionState.GRANTED, origin, user_context)

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
        driver.permissions.set_permission(descriptor, "invalid_state", origin)


def test_permission_states_constants():
    """Test that permission state constants are correctly defined."""
    assert PermissionState.GRANTED == "granted"
    assert PermissionState.DENIED == "denied"
    assert PermissionState.PROMPT == "prompt"
