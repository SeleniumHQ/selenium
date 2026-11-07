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

"""Tests that the classic navigation commands are routed through WebDriver BiDi.

These run under the ``--bidi`` pytest flag, which sets ``web_socket_url = True``
on the options. With BiDi enabled, ``driver.get()``, ``back()``, ``forward()``
and ``refresh()`` are expected to go through the BiDi ``browsingContext`` module
instead of the Classic HTTP endpoints, while preserving the same behaviour.
"""

from selenium.webdriver.common.bidi.browsing_context import ReadinessState


def test_bidi_is_enabled(driver):
    """The driver should report BiDi as enabled when web_socket_url is set."""
    assert driver._is_bidi_enabled() is True


def test_get_navigates_via_bidi(driver, pages):
    """driver.get() should load the page through BiDi and block until complete."""
    url = pages.url("simpleTest.html")
    driver.get(url)
    assert driver.current_url == url
    assert "Hello WebDriver" in driver.title


def test_back_and_forward_via_bidi(driver, pages):
    """back()/forward() should traverse history through BiDi."""
    first = pages.url("simpleTest.html")
    second = pages.url("formPage.html")

    driver.get(first)
    driver.get(second)
    assert driver.current_url == second

    driver.back()
    assert driver.current_url == first

    driver.forward()
    assert driver.current_url == second


def test_refresh_via_bidi(driver, pages):
    """refresh() should reload the current context through BiDi."""
    url = pages.url("formPage.html")
    driver.get(url)
    driver.refresh()
    assert driver.current_url == url


def test_page_load_readiness_default_is_complete(driver):
    """With no explicit pageLoadStrategy, readiness should default to COMPLETE."""
    assert driver._page_load_readiness() == ReadinessState.COMPLETE
