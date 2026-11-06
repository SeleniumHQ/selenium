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

"""Mirror of ``../bidi/network_tests.py`` using the generated ``_bidi`` commands, not the ``driver`` facade."""

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.browsing_context import BrowsingContext, ReadinessState
from selenium.webdriver.common._bidi.network import (
    AuthRequiredParameters,
    BeforeRequestSentParameters,
    FetchErrorParameters,
    Header,
    InterceptPhase,
    Network,
    ResponseCompletedParameters,
    ResponseStartedParameters,
    StringValue,
)
from selenium.webdriver.support.ui import WebDriverWait


def test_add_intercept(driver, pages):
    network = Network(driver)
    result = network.add_intercept(phases=[InterceptPhase.BEFORE_REQUEST_SENT])
    assert result.intercept

    network.remove_intercept(intercept=result.intercept)


def test_remove_intercept(driver):
    network = Network(driver)
    intercept = network.add_intercept(phases=[InterceptPhase.BEFORE_REQUEST_SENT]).intercept

    network.remove_intercept(intercept=intercept)

    # No facade `intercepts` list to inspect; a second remove of the same id must raise.
    with pytest.raises(WebDriverException):
        network.remove_intercept(intercept=intercept)


def test_extra_header_is_sent_with_requests(driver, pages):
    header = Header(name="x-selenium-extra", value=StringValue(value="extra-header-value"))
    Network(driver).set_extra_headers(headers=[header])
    try:
        driver.get(pages.url("echo_headers"))
        assert "x-selenium-extra" in driver.page_source
        assert "extra-header-value" in driver.page_source
    finally:
        Network(driver).set_extra_headers(headers=[])


def test_removed_extra_header_is_not_sent(driver, pages):
    network = Network(driver)
    network.set_extra_headers(headers=[Header(name="x-selenium-extra", value=StringValue(value="extra-header-value"))])
    network.set_extra_headers(headers=[])

    driver.get(pages.url("echo_headers"))
    assert "x-selenium-extra" not in driver.page_source


@pytest.mark.parametrize(
    ("event", "payload"),
    [
        ("before_request_sent", BeforeRequestSentParameters),
        ("response_started", ResponseStartedParameters),
        ("response_completed", ResponseCompletedParameters),
    ],
)
def test_request_events(driver, pages, event, payload):
    url = pages.url("simpleTest.html")
    events = []
    subscription = getattr(Network(driver), f"add_{event}_callback")(events.append).subscription

    driver.get(url)
    request = WebDriverWait(driver, 10).until(lambda _: next((e for e in events if e["request"]["url"] == url), None))
    Network(driver).remove_callback(subscription)

    assert payload.from_json(request).request.method == "GET"


def test_a_callback_continues_the_requests_an_intercept_blocks(driver, pages):
    url = pages.url("simpleTest.html")
    blocked = []

    def continue_request(params):
        if params["isBlocked"]:
            blocked.append(params["request"]["url"])
            Network(driver).continue_request(request=params["request"]["request"])

    subscription = Network(driver).add_before_request_sent_callback(continue_request).subscription
    intercept = Network(driver).add_intercept(phases=[InterceptPhase.BEFORE_REQUEST_SENT]).intercept

    # A BiDi navigation: in Chrome, a callable that sent a BiDi command during a classic ``driver.get`` timed out.
    BrowsingContext(driver).navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)

    Network(driver).remove_intercept(intercept=intercept)
    Network(driver).remove_callback(subscription)
    assert url in blocked


def test_fetch_error_event(driver, pages):
    url = "http://invalid-domain-that-does-not-exist.test/"
    driver.get(pages.url("simpleTest.html"))
    events = []
    subscription = Network(driver).add_fetch_error_callback(events.append).subscription

    driver.execute_script("fetch(arguments[0]).catch(() => {})", url)
    error = WebDriverWait(driver, 10).until(lambda _: next((e for e in events if e["request"]["url"] == url), None))
    Network(driver).remove_callback(subscription)

    assert FetchErrorParameters.from_json(error).error_text


@pytest.mark.xfail_chrome(reason="Chromium reports a response status of -1, which ResponseData rejects")
@pytest.mark.xfail_edge(reason="Chromium reports a response status of -1, which ResponseData rejects")
def test_auth_required_event(driver, pages):
    driver.get(pages.url("simpleTest.html"))
    events = []
    subscription = Network(driver).add_auth_required_callback(events.append).subscription
    intercept = Network(driver).add_intercept(phases=[InterceptPhase.AUTH_REQUIRED]).intercept
    try:
        driver.execute_script("fetch(arguments[0])", pages.url("basic-auth"))
        WebDriverWait(driver, 10).until(lambda _: events)
        Network(driver).continue_with_auth(request=events[0]["request"]["request"], action="cancel")
    finally:
        Network(driver).remove_intercept(intercept=intercept)
        Network(driver).remove_callback(subscription)
    assert AuthRequiredParameters.from_json(events[0]).response.status == 401
