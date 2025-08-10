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

import random
import time

import pytest

from selenium.webdriver.common.bidi.storage import (
    BrowsingContextPartitionDescriptor,
    BytesValue,
    CookieFilter,
    PartialCookie,
    SameSite,
    StorageKeyPartitionDescriptor,
)
from selenium.webdriver.common.window import WindowTypes


def generate_unique_key():
    return f"key_{random.randint(0, 100000)}"


def assert_cookie_is_not_present_with_name(driver, key):
    assert driver.get_cookie(key) is None
    document_cookie = get_document_cookie_or_none(driver)
    if document_cookie is not None:
        assert key + "=" not in document_cookie


def assert_cookie_is_present_with_name(driver, key):
    assert driver.get_cookie(key) is not None
    document_cookie = get_document_cookie_or_none(driver)
    if document_cookie is not None:
        assert key + "=" in document_cookie


def assert_cookie_has_value(driver, key, value):
    assert driver.get_cookie(key)["value"] == value
    document_cookie = get_document_cookie_or_none(driver)
    if document_cookie is not None:
        assert f"{key}={value}" in document_cookie


def assert_no_cookies_are_present(driver):
    assert len(driver.get_cookies()) == 0
    document_cookie = get_document_cookie_or_none(driver)
    if document_cookie is not None:
        assert document_cookie == ""


def assert_some_cookies_are_present(driver):
    assert len(driver.get_cookies()) > 0
    document_cookie = get_document_cookie_or_none(driver)
    if document_cookie is not None:
        assert document_cookie != ""


def get_document_cookie_or_none(driver):
    try:
        return driver.execute_script("return document.cookie")
    except Exception:
        return None


class TestBidiStorage:
    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        driver.get(pages.url("simpleTest.html"))
        driver.delete_all_cookies()

    def test_storage_initialized(self, driver):
        """Test that the storage module is initialized properly."""
        assert driver.storage is not None

    def test_get_cookie_by_name(self, driver, pages, webserver):
        """Test getting a cookie by name."""
        assert_no_cookies_are_present(driver)

        key = generate_unique_key()
        value = "set"
        assert_cookie_is_not_present_with_name(driver, key)

        driver.add_cookie({"name": key, "value": value})

        # Test
        cookie_filter = CookieFilter(name=key, value=BytesValue(BytesValue.TYPE_STRING, "set"))

        result = driver.storage.get_cookies(filter=cookie_filter)

        # Verify
        assert len(result.cookies) > 0
        assert result.cookies[0].value.value == value

    @pytest.mark.xfail_chrome
    @pytest.mark.xfail_edge
    def test_get_cookie_in_default_user_context(self, driver, pages, webserver):
        """Test getting a cookie in the default user context."""
        assert_no_cookies_are_present(driver)

        window_handle = driver.current_window_handle
        key = generate_unique_key()
        value = "set"
        assert_cookie_is_not_present_with_name(driver, key)

        driver.add_cookie({"name": key, "value": value})

        # Test
        cookie_filter = CookieFilter(name=key, value=BytesValue(BytesValue.TYPE_STRING, "set"))

        driver.switch_to.new_window(WindowTypes.WINDOW)

        descriptor = BrowsingContextPartitionDescriptor(driver.current_window_handle)

        params = cookie_filter
        result_after_switching_context = driver.storage.get_cookies(filter=params, partition=descriptor)

        assert len(result_after_switching_context.cookies) > 0
        assert result_after_switching_context.cookies[0].value.value == value

        driver.switch_to.window(window_handle)

        descriptor = BrowsingContextPartitionDescriptor(driver.current_window_handle)

        result = driver.storage.get_cookies(filter=cookie_filter, partition=descriptor)

        assert len(result.cookies) > 0
        assert result.cookies[0].value.value == value
        partition_key = result.partition_key

        assert partition_key.source_origin is not None
        assert partition_key.user_context is not None
        assert partition_key.user_context == "default"

    def test_get_cookie_in_a_user_context(self, driver, pages, webserver):
        """Test getting a cookie in a user context."""
        assert_no_cookies_are_present(driver)

        user_context = driver.browser.create_user_context()
        window_handle = driver.current_window_handle

        key = generate_unique_key()
        value = "set"

        descriptor = StorageKeyPartitionDescriptor(user_context=user_context)

        parameters = PartialCookie(key, BytesValue(BytesValue.TYPE_STRING, value), webserver.host)

        driver.storage.set_cookie(cookie=parameters, partition=descriptor)

        # Test
        cookie_filter = CookieFilter(name=key, value=BytesValue(BytesValue.TYPE_STRING, "set"))

        # Create a new window with the user context
        new_window = driver.browsing_context.create(type=WindowTypes.TAB, user_context=user_context)

        driver.switch_to.window(new_window)

        result = driver.storage.get_cookies(filter=cookie_filter, partition=descriptor)

        assert len(result.cookies) > 0
        assert result.cookies[0].value.value == value
        partition_key = result.partition_key

        assert partition_key.user_context is not None
        assert partition_key.user_context == user_context

        driver.switch_to.window(window_handle)

        browsing_context_partition_descriptor = BrowsingContextPartitionDescriptor(window_handle)

        result1 = driver.storage.get_cookies(filter=cookie_filter, partition=browsing_context_partition_descriptor)

        assert len(result1.cookies) == 0

        # Clean up
        driver.browsing_context.close(new_window)
        driver.browser.remove_user_context(user_context)

    def test_add_cookie(self, driver, pages, webserver):
        """Test adding a cookie."""
        assert_no_cookies_are_present(driver)

        key = generate_unique_key()
        value = "foo"

        parameters = PartialCookie(key, BytesValue(BytesValue.TYPE_STRING, value), webserver.host)
        assert_cookie_is_not_present_with_name(driver, key)

        # Test
        driver.storage.set_cookie(cookie=parameters)

        # Verify
        assert_cookie_has_value(driver, key, value)
        driver.get(pages.url("simpleTest.html"))
        assert_cookie_has_value(driver, key, value)

    @pytest.mark.xfail_chrome
    @pytest.mark.xfail_edge
    def test_add_and_get_cookie(self, driver, pages, webserver):
        """Test adding and getting a cookie with all parameters."""
        assert_no_cookies_are_present(driver)

        value = BytesValue(BytesValue.TYPE_STRING, "cod")
        domain = webserver.host

        expiry = int(time.time() + 3600)

        path = "/simpleTest.html"

        cookie = PartialCookie(
            "fish", value, domain, path=path, http_only=True, secure=False, same_site=SameSite.LAX, expiry=expiry
        )

        # Test
        driver.storage.set_cookie(cookie=cookie)

        driver.get(pages.url("simpleTest.html"))

        cookie_filter = CookieFilter(
            name="fish",
            value=value,
            domain=domain,
            path=path,
            http_only=True,
            secure=False,
            same_site=SameSite.LAX,
            expiry=expiry,
        )

        descriptor = BrowsingContextPartitionDescriptor(driver.current_window_handle)

        result = driver.storage.get_cookies(filter=cookie_filter, partition=descriptor)
        key = result.partition_key

        # Verify
        assert len(result.cookies) > 0
        result_cookie = result.cookies[0]

        assert result_cookie.name == "fish"
        assert result_cookie.value.value == value.value
        assert result_cookie.domain == domain
        assert result_cookie.path == path
        assert result_cookie.http_only is True
        assert result_cookie.secure is False
        assert result_cookie.same_site == SameSite.LAX
        assert result_cookie.expiry == expiry
        assert key.source_origin is not None
        assert key.user_context is not None
        assert key.user_context == "default"

    def test_get_all_cookies(self, driver, pages, webserver):
        """Test getting all cookies."""
        assert_no_cookies_are_present(driver)

        key1 = generate_unique_key()
        key2 = generate_unique_key()

        assert_cookie_is_not_present_with_name(driver, key1)
        assert_cookie_is_not_present_with_name(driver, key2)

        # Test
        params = CookieFilter()
        result = driver.storage.get_cookies(filter=params)

        count_before = len(result.cookies)

        driver.add_cookie({"name": key1, "value": "value"})
        driver.add_cookie({"name": key2, "value": "value"})

        driver.get(pages.url("simpleTest.html"))
        result = driver.storage.get_cookies(filter=params)

        # Verify
        assert len(result.cookies) == count_before + 2
        cookie_names = [cookie.name for cookie in result.cookies]
        assert key1 in cookie_names
        assert key2 in cookie_names

    def test_delete_all_cookies(self, driver, pages, webserver):
        """Test deleting all cookies."""
        assert_no_cookies_are_present(driver)

        driver.add_cookie({"name": "foo", "value": "set"})
        assert_some_cookies_are_present(driver)

        # Test
        driver.storage.delete_cookies(filter=CookieFilter())

        # Verify
        assert_no_cookies_are_present(driver)

        driver.get(pages.url("simpleTest.html"))
        assert_no_cookies_are_present(driver)

    def test_delete_cookie_with_name(self, driver, pages, webserver):
        """Test deleting a cookie with a specific name."""
        assert_no_cookies_are_present(driver)

        key1 = generate_unique_key()
        key2 = generate_unique_key()

        driver.add_cookie({"name": key1, "value": "set"})
        driver.add_cookie({"name": key2, "value": "set"})

        assert_cookie_is_present_with_name(driver, key1)
        assert_cookie_is_present_with_name(driver, key2)

        # Test
        driver.storage.delete_cookies(filter=CookieFilter(name=key1))

        # Verify
        assert_cookie_is_not_present_with_name(driver, key1)
        assert_cookie_is_present_with_name(driver, key2)

        driver.get(pages.url("simpleTest.html"))
        assert_cookie_is_not_present_with_name(driver, key1)
        assert_cookie_is_present_with_name(driver, key2)

    def test_add_cookies_with_different_paths(self, driver, pages, webserver):
        """Test adding cookies with different paths that are related to ours."""
        assert_no_cookies_are_present(driver)

        cookie1 = PartialCookie(
            "fish", BytesValue(BytesValue.TYPE_STRING, "cod"), webserver.host, path="/simpleTest.html"
        )

        cookie2 = PartialCookie("planet", BytesValue(BytesValue.TYPE_STRING, "earth"), webserver.host, path="/")

        # Test
        driver.storage.set_cookie(cookie=cookie1)
        driver.storage.set_cookie(cookie=cookie2)

        driver.get(pages.url("simpleTest.html"))

        # Verify
        assert_cookie_is_present_with_name(driver, "fish")
        assert_cookie_is_present_with_name(driver, "planet")

        driver.get(pages.url("formPage.html"))
        assert_cookie_is_not_present_with_name(driver, "fish")
