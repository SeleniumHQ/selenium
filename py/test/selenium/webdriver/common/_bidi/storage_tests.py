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

"""Mirror of ``../bidi/storage_tests.py`` using the generated ``_bidi`` commands, not the ``driver`` facade."""

import random
import time

import pytest

from selenium.webdriver.common._bidi.browser import Browser
from selenium.webdriver.common._bidi.browsing_context import BrowsingContext, CreateType
from selenium.webdriver.common._bidi.network import SameSite, StringValue
from selenium.webdriver.common._bidi.storage import (
    BrowsingContextPartitionDescriptor,
    CookieFilter,
    PartialCookie,
    Storage,
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

    def test_get_cookie_by_name(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = generate_unique_key()
        value = "set"
        assert_cookie_is_not_present_with_name(driver, key)

        driver.add_cookie({"name": key, "value": value})

        cookie_filter = CookieFilter(name=key, value=StringValue(value="set"))
        result = Storage(driver).get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        assert result.cookies[0].value.value == value

    @pytest.mark.xfail_chrome
    @pytest.mark.xfail_edge
    def test_get_cookie_in_default_user_context(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        window_handle = driver.current_window_handle
        key = generate_unique_key()
        value = "set"
        assert_cookie_is_not_present_with_name(driver, key)

        driver.add_cookie({"name": key, "value": value})

        cookie_filter = CookieFilter(name=key, value=StringValue(value="set"))
        storage = Storage(driver)

        driver.switch_to.new_window(WindowTypes.WINDOW)

        descriptor = BrowsingContextPartitionDescriptor(context=driver.current_window_handle)
        result_after_switching_context = storage.get_cookies(filter=cookie_filter, partition=descriptor)

        assert len(result_after_switching_context.cookies) > 0
        assert result_after_switching_context.cookies[0].value.value == value

        driver.switch_to.window(window_handle)

        descriptor = BrowsingContextPartitionDescriptor(context=driver.current_window_handle)
        result = storage.get_cookies(filter=cookie_filter, partition=descriptor)

        assert len(result.cookies) > 0
        assert result.cookies[0].value.value == value
        partition_key = result.partition_key
        assert partition_key.source_origin is not None
        assert partition_key.user_context is not None
        assert partition_key.user_context == "default"

    def test_get_cookie_in_a_user_context(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        user_context = Browser(driver).create_user_context().user_context
        window_handle = driver.current_window_handle

        key = generate_unique_key()
        value = "set"

        descriptor = StorageKeyPartitionDescriptor(user_context=user_context)
        storage = Storage(driver)
        storage.set_cookie(cookie=PartialCookie(key, StringValue(value=value), webserver.host), partition=descriptor)

        cookie_filter = CookieFilter(name=key, value=StringValue(value="set"))

        new_window = BrowsingContext(driver).create(type=CreateType.TAB, user_context=user_context).context
        driver.switch_to.window(new_window)

        result = storage.get_cookies(filter=cookie_filter, partition=descriptor)
        assert len(result.cookies) > 0
        assert result.cookies[0].value.value == value
        assert result.partition_key.user_context == user_context

        driver.switch_to.window(window_handle)

        by_context = BrowsingContextPartitionDescriptor(context=window_handle)
        result1 = storage.get_cookies(filter=cookie_filter, partition=by_context)
        assert len(result1.cookies) == 0

        BrowsingContext(driver).close(context=new_window)
        Browser(driver).remove_user_context(user_context=user_context)

    def test_add_cookie(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = generate_unique_key()
        value = "foo"

        assert_cookie_is_not_present_with_name(driver, key)
        Storage(driver).set_cookie(cookie=PartialCookie(key, StringValue(value=value), webserver.host))

        assert_cookie_has_value(driver, key, value)
        driver.get(pages.url("simpleTest.html"))
        assert_cookie_has_value(driver, key, value)

    @pytest.mark.xfail_chrome
    @pytest.mark.xfail_edge
    def test_add_and_get_cookie(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        value = StringValue(value="cod")
        domain = webserver.host
        expiry = int(time.time() + 3600)
        path = "/simpleTest.html"

        cookie = PartialCookie(
            "fish", value, domain, path=path, http_only=True, secure=False, same_site=SameSite.LAX, expiry=expiry
        )
        Storage(driver).set_cookie(cookie=cookie)

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
        descriptor = BrowsingContextPartitionDescriptor(context=driver.current_window_handle)
        result = Storage(driver).get_cookies(filter=cookie_filter, partition=descriptor)

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
        assert result.partition_key.source_origin is not None
        assert result.partition_key.user_context == "default"

    def test_get_all_cookies(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key1 = generate_unique_key()
        key2 = generate_unique_key()
        assert_cookie_is_not_present_with_name(driver, key1)
        assert_cookie_is_not_present_with_name(driver, key2)

        storage = Storage(driver)
        count_before = len(storage.get_cookies(filter=CookieFilter()).cookies)

        driver.add_cookie({"name": key1, "value": "value"})
        driver.add_cookie({"name": key2, "value": "value"})
        driver.get(pages.url("simpleTest.html"))

        result = storage.get_cookies(filter=CookieFilter())
        assert len(result.cookies) == count_before + 2
        cookie_names = [cookie.name for cookie in result.cookies]
        assert key1 in cookie_names
        assert key2 in cookie_names

    def test_delete_all_cookies(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        driver.add_cookie({"name": "foo", "value": "set"})
        assert_some_cookies_are_present(driver)

        Storage(driver).delete_cookies(filter=CookieFilter())

        assert_no_cookies_are_present(driver)
        driver.get(pages.url("simpleTest.html"))
        assert_no_cookies_are_present(driver)

    def test_delete_cookie_with_name(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key1 = generate_unique_key()
        key2 = generate_unique_key()
        driver.add_cookie({"name": key1, "value": "set"})
        driver.add_cookie({"name": key2, "value": "set"})
        assert_cookie_is_present_with_name(driver, key1)
        assert_cookie_is_present_with_name(driver, key2)

        Storage(driver).delete_cookies(filter=CookieFilter(name=key1))

        assert_cookie_is_not_present_with_name(driver, key1)
        assert_cookie_is_present_with_name(driver, key2)
        driver.get(pages.url("simpleTest.html"))
        assert_cookie_is_not_present_with_name(driver, key1)
        assert_cookie_is_present_with_name(driver, key2)

    def test_add_cookies_with_different_paths(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        storage = Storage(driver)
        storage.set_cookie(
            cookie=PartialCookie("fish", StringValue(value="cod"), webserver.host, path="/simpleTest.html")
        )
        storage.set_cookie(cookie=PartialCookie("planet", StringValue(value="earth"), webserver.host, path="/"))

        driver.get(pages.url("simpleTest.html"))
        assert_cookie_is_present_with_name(driver, "fish")
        assert_cookie_is_present_with_name(driver, "planet")

        driver.get(pages.url("formPage.html"))
        assert_cookie_is_not_present_with_name(driver, "fish")

    def test_delete_cookies_by_name_filter(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key1 = generate_unique_key()
        key2 = generate_unique_key()
        key3 = generate_unique_key()
        driver.add_cookie({"name": key1, "value": "value1"})
        driver.add_cookie({"name": key2, "value": "value2"})
        driver.add_cookie({"name": key3, "value": "value3"})

        Storage(driver).delete_cookies(filter=CookieFilter(name=key1))

        assert_cookie_is_not_present_with_name(driver, key1)
        assert_cookie_is_present_with_name(driver, key2)
        assert_cookie_is_present_with_name(driver, key3)

    def test_delete_cookies_multiple_filters(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = "multi_filter_delete_test"
        value = StringValue(value="test_value")

        storage = Storage(driver)
        storage.set_cookie(cookie=PartialCookie(key, value, webserver.host, http_only=True))
        storage.set_cookie(cookie=PartialCookie(key, value, webserver.host, http_only=False))

        storage.delete_cookies(filter=CookieFilter(name=key, http_only=True))

        result = storage.get_cookies(filter=CookieFilter(name=key))
        assert len(result.cookies) == 1
        assert result.cookies[0].http_only is False

    def test_delete_cookies_empty_filter(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        for i in range(3):
            driver.add_cookie({"name": f"cookie_{i}", "value": f"value_{i}"})
        assert_some_cookies_are_present(driver)

        Storage(driver).delete_cookies(filter=CookieFilter())
        assert_no_cookies_are_present(driver)

    def test_set_cookie_with_http_only_attribute(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = "http_only_cookie"
        Storage(driver).set_cookie(
            cookie=PartialCookie(key, StringValue(value="protected"), webserver.host, http_only=True)
        )

        result = Storage(driver).get_cookies(filter=CookieFilter(name=key, http_only=True))
        assert len(result.cookies) > 0
        assert result.cookies[0].http_only is True

    def test_set_cookie_with_secure_attribute(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = "secure_cookie"
        Storage(driver).set_cookie(
            cookie=PartialCookie(key, StringValue(value="encrypted"), webserver.host, secure=True)
        )

        result = Storage(driver).get_cookies(filter=CookieFilter(name=key, secure=True))
        assert len(result.cookies) > 0
        assert result.cookies[0].secure is True

    def test_set_cookie_with_same_site_strict(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = "samesite_strict"
        Storage(driver).set_cookie(
            cookie=PartialCookie(key, StringValue(value="strict"), webserver.host, same_site=SameSite.STRICT)
        )

        result = Storage(driver).get_cookies(filter=CookieFilter(name=key, same_site=SameSite.STRICT))
        assert len(result.cookies) > 0
        assert result.cookies[0].same_site == SameSite.STRICT

    def test_set_cookie_with_same_site_lax(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = "samesite_lax"
        Storage(driver).set_cookie(
            cookie=PartialCookie(key, StringValue(value="lax"), webserver.host, same_site=SameSite.LAX)
        )

        result = Storage(driver).get_cookies(filter=CookieFilter(name=key, same_site=SameSite.LAX))
        assert len(result.cookies) > 0
        assert result.cookies[0].same_site == SameSite.LAX

    def test_set_cookie_with_same_site_none(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = "samesite_none"
        Storage(driver).set_cookie(
            cookie=PartialCookie(key, StringValue(value="none"), webserver.host, same_site=SameSite.NONE, secure=True)
        )

        result = Storage(driver).get_cookies(filter=CookieFilter(name=key, same_site=SameSite.NONE))
        assert len(result.cookies) > 0
        assert result.cookies[0].same_site == SameSite.NONE

    def test_set_cookie_with_path_and_domain(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = "path_domain_cookie"
        path = "/simpleTest.html"
        Storage(driver).set_cookie(cookie=PartialCookie(key, StringValue(value="scoped"), webserver.host, path=path))

        result = Storage(driver).get_cookies(filter=CookieFilter(name=key, path=path))
        assert len(result.cookies) > 0
        assert result.cookies[0].path == path
        assert result.cookies[0].domain == webserver.host

    def test_set_cookie_with_future_expiry(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = "future_expiry_cookie"
        future_expiry = int(time.time() + 3600)
        Storage(driver).set_cookie(
            cookie=PartialCookie(key, StringValue(value="future"), webserver.host, expiry=future_expiry)
        )

        result = Storage(driver).get_cookies(filter=CookieFilter(name=key))
        assert len(result.cookies) > 0
        assert result.cookies[0].expiry == future_expiry

    def test_set_cookie_with_string_value(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = "string_value_cookie"
        Storage(driver).set_cookie(cookie=PartialCookie(key, StringValue(value="hello"), webserver.host))

        result = Storage(driver).get_cookies(filter=CookieFilter(name=key))
        assert len(result.cookies) > 0
        assert result.cookies[0].value.value == "hello"

    def test_get_cookies_filter_by_domain(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = generate_unique_key()
        Storage(driver).set_cookie(cookie=PartialCookie(key, StringValue(value="domain_test"), webserver.host))

        result = Storage(driver).get_cookies(filter=CookieFilter(domain=webserver.host))
        assert key in [c.name for c in result.cookies]

    def test_get_cookies_filter_by_path(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key1 = generate_unique_key()
        key2 = generate_unique_key()
        value = StringValue(value="path_test")

        storage = Storage(driver)
        storage.set_cookie(cookie=PartialCookie(key1, value, webserver.host, path="/simpleTest.html"))
        storage.set_cookie(cookie=PartialCookie(key2, value, webserver.host, path="/"))

        result = storage.get_cookies(filter=CookieFilter(path="/simpleTest.html"))
        assert len(result.cookies) > 0
        assert all(c.path == "/simpleTest.html" for c in result.cookies)

    def test_multiple_cookies_same_name_different_paths(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = "multi_path_cookie"
        value = StringValue(value="test")

        storage = Storage(driver)
        storage.set_cookie(cookie=PartialCookie(key, value, webserver.host, path="/"))
        storage.set_cookie(cookie=PartialCookie(key, value, webserver.host, path="/simpleTest.html"))

        result = storage.get_cookies(filter=CookieFilter(name=key))
        assert len(result.cookies) >= 2

    def test_delete_cookie_by_path(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key1 = generate_unique_key()
        key2 = generate_unique_key()
        value = StringValue(value="delete_test")

        storage = Storage(driver)
        storage.set_cookie(cookie=PartialCookie(key1, value, webserver.host, path="/simpleTest.html"))
        storage.set_cookie(cookie=PartialCookie(key2, value, webserver.host, path="/"))

        storage.delete_cookies(filter=CookieFilter(path="/simpleTest.html"))

        result = storage.get_cookies(filter=CookieFilter())
        cookie_names = [c.name for c in result.cookies]
        assert key1 not in cookie_names or all(c.path != "/simpleTest.html" for c in result.cookies if c.name == key1)

    def test_cookie_expiry_timestamp(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = "expiry_test"
        expiry_time = int(time.time() + 7200)
        Storage(driver).set_cookie(
            cookie=PartialCookie(key, StringValue(value="expires"), webserver.host, expiry=expiry_time)
        )

        result = Storage(driver).get_cookies(filter=CookieFilter(name=key))
        assert len(result.cookies) > 0
        assert result.cookies[0].expiry == expiry_time

    def test_cookie_combined_attributes(self, driver, pages, webserver):
        assert_no_cookies_are_present(driver)

        key = "combined_attrs"
        value = StringValue(value="all_features")
        path = "/simpleTest.html"
        expiry = int(time.time() + 3600)

        cookie = PartialCookie(
            key, value, webserver.host, path=path, http_only=True, secure=True, same_site=SameSite.LAX, expiry=expiry
        )
        Storage(driver).set_cookie(cookie=cookie)

        cookie_filter = CookieFilter(
            name=key, path=path, http_only=True, secure=True, same_site=SameSite.LAX, expiry=expiry
        )
        result = Storage(driver).get_cookies(filter=cookie_filter)

        assert len(result.cookies) > 0
        cookie_result = result.cookies[0]
        assert cookie_result.name == key
        assert cookie_result.value.value == value.value
        assert cookie_result.path == path
        assert cookie_result.http_only is True
        assert cookie_result.secure is True
        assert cookie_result.same_site == SameSite.LAX
        assert cookie_result.expiry == expiry
