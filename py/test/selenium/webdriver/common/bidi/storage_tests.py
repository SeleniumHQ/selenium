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
            "fish",
            value,
            domain,
            path=path,
            http_only=True,
            secure=False,
            same_site=SameSite.LAX,
            expiry=expiry,
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
            "fish",
            BytesValue(BytesValue.TYPE_STRING, "cod"),
            webserver.host,
            path="/simpleTest.html",
        )

        cookie2 = PartialCookie(
            "planet",
            BytesValue(BytesValue.TYPE_STRING, "earth"),
            webserver.host,
            path="/",
        )

        # Test
        driver.storage.set_cookie(cookie=cookie1)
        driver.storage.set_cookie(cookie=cookie2)

        driver.get(pages.url("simpleTest.html"))

        # Verify
        assert_cookie_is_present_with_name(driver, "fish")
        assert_cookie_is_present_with_name(driver, "planet")

        driver.get(pages.url("formPage.html"))
        assert_cookie_is_not_present_with_name(driver, "fish")

    def test_delete_cookies_by_name_filter(self, driver, pages, webserver):
        """Test deleting cookies with specific name filter."""
        assert_no_cookies_are_present(driver)

        key1 = generate_unique_key()
        key2 = generate_unique_key()
        key3 = generate_unique_key()

        driver.add_cookie({"name": key1, "value": "value1"})
        driver.add_cookie({"name": key2, "value": "value2"})
        driver.add_cookie({"name": key3, "value": "value3"})

        # Delete only key1
        driver.storage.delete_cookies(filter=CookieFilter(name=key1))

        # Verify
        assert_cookie_is_not_present_with_name(driver, key1)
        assert_cookie_is_present_with_name(driver, key2)
        assert_cookie_is_present_with_name(driver, key3)

    def test_delete_cookies_multiple_filters(self, driver, pages, webserver):
        """Test deleting cookies with multiple filter criteria."""
        assert_no_cookies_are_present(driver)

        key = "multi_filter_delete_test"
        value = BytesValue(BytesValue.TYPE_STRING, "test_value")

        # Create two cookies with same name but different http_only attributes
        # This ensures the http_only filter actually affects which cookies are deleted
        cookie1 = PartialCookie(key, value, webserver.host, http_only=True)
        cookie2 = PartialCookie(key, value, webserver.host, http_only=False)

        driver.storage.set_cookie(cookie=cookie1)
        driver.storage.set_cookie(cookie=cookie2)

        # Delete only http_only cookies - the http_only filter should actually matter here
        driver.storage.delete_cookies(filter=CookieFilter(name=key, http_only=True))

        # Verify - only the http_only=True cookie should be deleted
        result = driver.storage.get_cookies(filter=CookieFilter(name=key))

        # Should have one cookie remaining (the http_only=False one)
        assert len(result.cookies) == 1
        assert result.cookies[0].http_only is False

    def test_delete_cookies_empty_filter(self, driver, pages, webserver):
        """Test deleting with empty filter deletes all cookies."""
        assert_no_cookies_are_present(driver)

        # Add multiple cookies
        for i in range(3):
            driver.add_cookie({"name": f"cookie_{i}", "value": f"value_{i}"})

        assert_some_cookies_are_present(driver)

        # Delete with empty filter
        driver.storage.delete_cookies(filter=CookieFilter())

        # Verify all deleted
        assert_no_cookies_are_present(driver)

    def test_set_cookie_with_http_only_attribute(self, driver, pages, webserver):
        """Test setting a cookie with http_only attribute."""
        assert_no_cookies_are_present(driver)

        key = "http_only_cookie"
        value = BytesValue(BytesValue.TYPE_STRING, "protected")

        cookie = PartialCookie(key, value, webserver.host, http_only=True)

        # Test
        driver.storage.set_cookie(cookie=cookie)

        # Verify
        cookie_filter = CookieFilter(name=key, http_only=True)
        result = driver.storage.get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        assert result.cookies[0].http_only is True

    def test_set_cookie_with_secure_attribute(self, driver, pages, webserver):
        """Test setting a cookie with secure attribute."""
        assert_no_cookies_are_present(driver)

        key = "secure_cookie"
        value = BytesValue(BytesValue.TYPE_STRING, "encrypted")

        cookie = PartialCookie(key, value, webserver.host, secure=True)

        # Test
        driver.storage.set_cookie(cookie=cookie)

        # Verify
        cookie_filter = CookieFilter(name=key, secure=True)
        result = driver.storage.get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        assert result.cookies[0].secure is True

    def test_set_cookie_with_same_site_strict(self, driver, pages, webserver):
        """Test setting a cookie with SameSite=Strict."""
        assert_no_cookies_are_present(driver)

        key = "samesite_strict"
        value = BytesValue(BytesValue.TYPE_STRING, "strict")

        cookie = PartialCookie(key, value, webserver.host, same_site=SameSite.STRICT)

        # Test
        driver.storage.set_cookie(cookie=cookie)

        # Verify
        cookie_filter = CookieFilter(name=key, same_site=SameSite.STRICT)
        result = driver.storage.get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        assert result.cookies[0].same_site == SameSite.STRICT

    def test_set_cookie_with_same_site_lax(self, driver, pages, webserver):
        """Test setting a cookie with SameSite=Lax."""
        assert_no_cookies_are_present(driver)

        key = "samesite_lax"
        value = BytesValue(BytesValue.TYPE_STRING, "lax")

        cookie = PartialCookie(key, value, webserver.host, same_site=SameSite.LAX)

        # Test
        driver.storage.set_cookie(cookie=cookie)

        # Verify
        cookie_filter = CookieFilter(name=key, same_site=SameSite.LAX)
        result = driver.storage.get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        assert result.cookies[0].same_site == SameSite.LAX

    def test_set_cookie_with_same_site_none(self, driver, pages, webserver):
        """Test setting a cookie with SameSite=None (requires Secure)."""
        assert_no_cookies_are_present(driver)

        key = "samesite_none"
        value = BytesValue(BytesValue.TYPE_STRING, "none")

        # SameSite=None typically requires secure=True
        cookie = PartialCookie(key, value, webserver.host, same_site=SameSite.NONE, secure=True)

        # Test
        driver.storage.set_cookie(cookie=cookie)

        # Verify
        cookie_filter = CookieFilter(name=key, same_site=SameSite.NONE)
        result = driver.storage.get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        assert result.cookies[0].same_site == SameSite.NONE

    def test_set_cookie_with_path_and_domain(self, driver, pages, webserver):
        """Test setting a cookie with specific path and domain."""
        assert_no_cookies_are_present(driver)

        key = "path_domain_cookie"
        value = BytesValue(BytesValue.TYPE_STRING, "scoped")
        path = "/simpleTest.html"

        cookie = PartialCookie(key, value, webserver.host, path=path)

        # Test
        driver.storage.set_cookie(cookie=cookie)

        # Verify
        cookie_filter = CookieFilter(name=key, path=path)
        result = driver.storage.get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        assert result.cookies[0].path == path
        assert result.cookies[0].domain == webserver.host

    def test_set_cookie_with_future_expiry(self, driver, pages, webserver):
        """Test setting a cookie with a future expiry date."""
        assert_no_cookies_are_present(driver)

        key = "future_expiry_cookie"
        value = BytesValue(BytesValue.TYPE_STRING, "future")

        # Set expiry to 1 hour from now
        future_expiry = int(time.time() + 3600)

        cookie = PartialCookie(key, value, webserver.host, expiry=future_expiry)

        # Test
        driver.storage.set_cookie(cookie=cookie)

        # Verify
        cookie_filter = CookieFilter(name=key)
        result = driver.storage.get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        assert result.cookies[0].expiry == future_expiry

    def test_set_cookie_with_string_value(self, driver, pages, webserver):
        """Test setting a cookie with string value (standard format)."""
        assert_no_cookies_are_present(driver)

        key = "string_value_cookie"
        value = BytesValue(BytesValue.TYPE_STRING, "hello")

        cookie = PartialCookie(key, value, webserver.host)

        # Test
        driver.storage.set_cookie(cookie=cookie)

        # Verify
        cookie_filter = CookieFilter(name=key)
        result = driver.storage.get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        assert result.cookies[0].value.value == "hello"

    def test_get_cookies_filter_by_domain(self, driver, pages, webserver):
        """Test getting cookies filtered by domain."""
        assert_no_cookies_are_present(driver)

        key = generate_unique_key()
        value = BytesValue(BytesValue.TYPE_STRING, "domain_test")

        cookie = PartialCookie(key, value, webserver.host)
        driver.storage.set_cookie(cookie=cookie)

        # Filter by domain
        cookie_filter = CookieFilter(domain=webserver.host)
        result = driver.storage.get_cookies(filter=cookie_filter)

        # Should find the cookie
        cookie_names = [c.name for c in result.cookies]
        assert key in cookie_names

    def test_get_cookies_filter_by_path(self, driver, pages, webserver):
        """Test getting cookies filtered by path."""
        assert_no_cookies_are_present(driver)

        key1 = generate_unique_key()
        key2 = generate_unique_key()
        value = BytesValue(BytesValue.TYPE_STRING, "path_test")

        # Cookie with specific path
        cookie1 = PartialCookie(key1, value, webserver.host, path="/simpleTest.html")
        # Cookie with root path
        cookie2 = PartialCookie(key2, value, webserver.host, path="/")

        driver.storage.set_cookie(cookie=cookie1)
        driver.storage.set_cookie(cookie=cookie2)

        # Filter by specific path
        cookie_filter = CookieFilter(path="/simpleTest.html")
        result = driver.storage.get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        assert all(c.path == "/simpleTest.html" for c in result.cookies)

    def test_multiple_cookies_same_name_different_paths(self, driver, pages, webserver):
        """Test setting multiple cookies with same name but different paths."""
        assert_no_cookies_are_present(driver)

        key = "multi_path_cookie"
        value = BytesValue(BytesValue.TYPE_STRING, "test")

        # Create cookies with same name but different paths
        cookie1 = PartialCookie(key, value, webserver.host, path="/")
        cookie2 = PartialCookie(key, value, webserver.host, path="/simpleTest.html")

        driver.storage.set_cookie(cookie=cookie1)
        driver.storage.set_cookie(cookie=cookie2)

        # Both should exist
        cookie_filter = CookieFilter(name=key)
        result = driver.storage.get_cookies(filter=cookie_filter)

        # Should find at least 2 cookies with this name (different paths)
        assert len(result.cookies) >= 2

    def test_delete_cookie_by_path(self, driver, pages, webserver):
        """Test deleting cookies filtered by path."""
        assert_no_cookies_are_present(driver)

        key1 = generate_unique_key()
        key2 = generate_unique_key()
        value = BytesValue(BytesValue.TYPE_STRING, "delete_test")

        cookie1 = PartialCookie(key1, value, webserver.host, path="/simpleTest.html")
        cookie2 = PartialCookie(key2, value, webserver.host, path="/")

        driver.storage.set_cookie(cookie=cookie1)
        driver.storage.set_cookie(cookie=cookie2)

        # Delete only cookies with specific path
        driver.storage.delete_cookies(filter=CookieFilter(path="/simpleTest.html"))

        # Verify path-specific cookie is deleted, root path cookie remains
        result = driver.storage.get_cookies(filter=CookieFilter())
        cookie_names = [c.name for c in result.cookies]

        assert key1 not in cookie_names or all(c.path != "/simpleTest.html" for c in result.cookies if c.name == key1)

    def test_cookie_expiry_timestamp(self, driver, pages, webserver):
        """Test that cookie expiry is stored correctly as timestamp."""
        assert_no_cookies_are_present(driver)

        key = "expiry_test"
        value = BytesValue(BytesValue.TYPE_STRING, "expires")

        # Set expiry to specific time
        expiry_time = int(time.time() + 7200)  # 2 hours from now

        cookie = PartialCookie(key, value, webserver.host, expiry=expiry_time)

        driver.storage.set_cookie(cookie=cookie)

        # Get and verify
        cookie_filter = CookieFilter(name=key)
        result = driver.storage.get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        assert result.cookies[0].expiry == expiry_time

    def test_cookie_combined_attributes(self, driver, pages, webserver):
        """Test setting and getting cookie with multiple attributes combined."""
        assert_no_cookies_are_present(driver)

        key = "combined_attrs"
        value = BytesValue(BytesValue.TYPE_STRING, "all_features")
        path = "/simpleTest.html"
        expiry = int(time.time() + 3600)

        cookie = PartialCookie(
            key,
            value,
            webserver.host,
            path=path,
            http_only=True,
            secure=True,
            same_site=SameSite.LAX,
            expiry=expiry,
        )

        # Test
        driver.storage.set_cookie(cookie=cookie)

        # Verify with matching filter
        cookie_filter = CookieFilter(
            name=key,
            path=path,
            http_only=True,
            secure=True,
            same_site=SameSite.LAX,
            expiry=expiry,
        )

        result = driver.storage.get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        cookie_result = result.cookies[0]
        assert cookie_result.name == key
        assert cookie_result.value.value == value.value
        assert cookie_result.path == path
        assert cookie_result.http_only is True
        assert cookie_result.secure is True
        assert cookie_result.same_site == SameSite.LAX
        assert cookie_result.expiry == expiry
