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

"""Mirror of ``../bidi/permissions_tests.py`` using the generated ``_bidi`` commands, not the ``driver`` facade."""

from selenium.webdriver.common._bidi.browser import Browser
from selenium.webdriver.common._bidi.browsing_context import BrowsingContext, CreateType
from selenium.webdriver.common._bidi.permissions import PermissionDescriptor, Permissions, PermissionState

GEOLOCATION = PermissionDescriptor(name="geolocation")


def get_origin(driver):
    return driver.execute_script("return window.location.origin;")


def get_geolocation_permission(driver):
    script = """
    const callback = arguments[arguments.length - 1];
    navigator.permissions.query({ name: 'geolocation' }).then(permission => {
        callback(permission.state);
    }).catch(error => {
        callback(null);
    });
    """
    return driver.execute_async_script(script)


def test_can_set_permission_to_granted(driver, pages):
    pages.load("blank.html")
    origin = get_origin(driver)

    Permissions(driver).set_permission(descriptor=GEOLOCATION, state=PermissionState.GRANTED, origin=origin)

    assert get_geolocation_permission(driver) == PermissionState.GRANTED


def test_can_set_permission_to_denied(driver, pages):
    pages.load("blank.html")
    origin = get_origin(driver)

    Permissions(driver).set_permission(descriptor=GEOLOCATION, state=PermissionState.DENIED, origin=origin)

    assert get_geolocation_permission(driver) == PermissionState.DENIED


def test_can_set_permission_to_prompt(driver, pages):
    pages.load("blank.html")
    origin = get_origin(driver)

    permissions = Permissions(driver)
    permissions.set_permission(descriptor=GEOLOCATION, state=PermissionState.DENIED, origin=origin)
    permissions.set_permission(descriptor=GEOLOCATION, state=PermissionState.PROMPT, origin=origin)

    assert get_geolocation_permission(driver) == PermissionState.PROMPT


def test_can_set_permission_for_user_context(driver, pages):
    user_context = Browser(driver).create_user_context().user_context
    context_id = BrowsingContext(driver).create(type=CreateType.TAB, user_context=user_context).context

    pages.load("blank.html")
    original_window = driver.current_window_handle
    driver.switch_to.window(context_id)
    pages.load("blank.html")
    origin = get_origin(driver)

    driver.switch_to.window(original_window)
    original_permission = get_geolocation_permission(driver)

    driver.switch_to.window(context_id)
    Permissions(driver).set_permission(
        descriptor=GEOLOCATION, state=PermissionState.GRANTED, origin=origin, user_context=user_context
    )

    driver.switch_to.window(original_window)
    assert get_geolocation_permission(driver) == original_permission

    driver.switch_to.window(context_id)
    assert get_geolocation_permission(driver) == PermissionState.GRANTED

    BrowsingContext(driver).close(context=context_id)
    Browser(driver).remove_user_context(user_context=user_context)


def test_can_set_permission_with_embedded_origin(driver, pages):
    pages.load("blank.html")
    origin = get_origin(driver)

    Permissions(driver).set_permission(
        descriptor=GEOLOCATION, state=PermissionState.GRANTED, origin=origin, embedded_origin=origin
    )

    assert get_geolocation_permission(driver) == PermissionState.GRANTED


def test_permission_states_constants():
    assert PermissionState.GRANTED == "granted"
    assert PermissionState.DENIED == "denied"
    assert PermissionState.PROMPT == "prompt"
