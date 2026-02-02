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

from selenium.common.exceptions import InvalidArgumentException


def test_driver_get_rejects_invalid_url_without_scheme(driver):
    """Test that driver.get() raises InvalidArgumentException for URLs without a scheme."""
    with pytest.raises(InvalidArgumentException) as excinfo:
        driver.get("example.com")
    assert "Invalid URL" in str(excinfo.value)


def test_driver_get_rejects_malformed_url(driver):
    """Test that driver.get() raises InvalidArgumentException for malformed URLs."""
    with pytest.raises(InvalidArgumentException) as excinfo:
        driver.get("http//example.com")
    assert "Invalid URL" in str(excinfo.value)


def test_driver_get_rejects_empty_url(driver):
    """Test that driver.get() raises InvalidArgumentException for empty URLs."""
    with pytest.raises(InvalidArgumentException) as excinfo:
        driver.get("")
    assert "Invalid URL" in str(excinfo.value)


def test_driver_get_rejects_relative_url(driver):
    """Test that driver.get() raises InvalidArgumentException for relative URLs."""
    with pytest.raises(InvalidArgumentException) as excinfo:
        driver.get("/path/to/page")
    assert "Invalid URL" in str(excinfo.value)


def test_driver_get_accepts_valid_url(driver, pages):
    """Test that driver.get() accepts valid URLs."""
    # This should not raise an exception
    pages.load("simpleTest.html")
    assert driver.title == "Hello WebDriver"


def test_driver_get_accepts_url_with_fragment(driver, pages):
    """Test that driver.get() accepts URLs with fragments."""
    url = pages.url("simpleTest.html#fragment")
    # This should not raise an exception
    driver.get(url)
    assert "simpleTest.html" in driver.current_url


def test_driver_get_accepts_url_with_query_string(driver, pages):
    """Test that driver.get() accepts URLs with query strings."""
    url = pages.url("simpleTest.html?foo=bar")
    # This should not raise an exception
    driver.get(url)
    assert "simpleTest.html" in driver.current_url


def test_driver_get_accepts_data_url(driver):
    """Test that driver.get() accepts data URLs."""
    # This should not raise an exception
    driver.get("data:text/html,<h1>Test</h1>")
    assert "<h1>Test</h1>" in driver.page_source or "Test" in driver.page_source


def test_driver_get_accepts_about_blank(driver):
    """Test that driver.get() accepts about:blank."""
    # This should not raise an exception
    driver.get("about:blank")
    assert "about:blank" in driver.current_url or driver.current_url == "about:blank"


def test_browsing_context_navigate_rejects_invalid_url(driver):
    """Test that browsing_context.navigate() raises InvalidArgumentException for invalid URLs."""
    context_id = driver.current_window_handle
    with pytest.raises(InvalidArgumentException) as excinfo:
        driver.browsing_context.navigate(context=context_id, url="example.com")
    assert "Invalid URL" in str(excinfo.value)


def test_browsing_context_navigate_accepts_valid_url(driver, pages):
    """Test that browsing_context.navigate() accepts valid URLs."""
    context_id = driver.current_window_handle
    url = pages.url("simpleTest.html")
    # This should not raise an exception
    result = driver.browsing_context.navigate(context=context_id, url=url)
    assert result is not None
