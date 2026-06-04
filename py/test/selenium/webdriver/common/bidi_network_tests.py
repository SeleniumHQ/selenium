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

import time

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.bidi.browsing_context import ReadinessState
from selenium.webdriver.common.bidi.network import Request
from selenium.webdriver.common.by import By


def test_network_initialized(driver):
    assert driver.network is not None


def test_add_intercept(driver, pages):
    result = driver.network._add_intercept()
    assert result is not None, "Intercept not added"

    # Clean up
    driver.network._remove_intercept(result["intercept"])


def test_remove_intercept(driver):
    result = driver.network._add_intercept()
    driver.network._remove_intercept(result["intercept"])
    assert driver.network.intercepts == [], "Intercept not removed"


def test_add_and_remove_request_handler(driver, pages):
    requests = []

    def callback(request: Request):
        requests.append(request)

    callback_id = driver.network.add_request_handler("before_request", callback)
    assert callback_id is not None, "Request handler not added"
    driver.network.remove_request_handler("before_request", callback_id)
    pages.load("formPage.html")
    assert not requests, "Requests intercepted"
    assert driver.find_element(By.NAME, "login").is_displayed(), "Request not continued"


def test_clear_request_handlers(driver, pages):
    requests = []

    def callback(request: Request):
        requests.append(request)

    callback_id_1 = driver.network.add_request_handler("before_request", callback)
    assert callback_id_1 is not None, "Request handler not added"
    callback_id_2 = driver.network.add_request_handler("before_request", callback)
    assert callback_id_2 is not None, "Request handler not added"

    driver.network.clear_request_handlers()

    pages.load("formPage.html")
    assert not requests, "Requests intercepted"
    assert driver.find_element(By.NAME, "login").is_displayed(), "Request not continued"


def test_continue_request(driver, pages):
    exceptions = []

    def callback(request: Request):
        try:
            request.continue_request()
        except WebDriverException as e:
            exceptions.append(e)

    callback_id = driver.network.add_request_handler("before_request", callback)
    assert callback_id is not None, "Request handler not added"
    url = pages.url("formPage.html")
    driver.browsing_context.navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)
    assert driver.find_element(By.NAME, "login").is_displayed(), "Request not continued"
    assert len(exceptions) == 0, "Exception raised when continuing request in handler callback"

    driver.network.remove_request_handler("before_request", callback_id)


def test_continue_with_auth(driver):
    callback_id = driver.network.add_auth_handler("postman", "password")
    assert callback_id is not None, "Request handler not added"
    driver.browsing_context.navigate(
        context=driver.current_window_handle, url="https://postman-echo.com/basic-auth", wait=ReadinessState.COMPLETE
    )
    assert "authenticated" in driver.page_source, "Authorization failed"

    driver.network.remove_auth_handler(callback_id)


def test_remove_auth_handler(driver):
    callback_id = driver.network.add_auth_handler("user", "passwd")
    assert callback_id is not None, "Request handler not added"
    driver.network.remove_auth_handler(callback_id)
    assert driver.network.intercepts == [], "Intercept not removed"


def test_handler_with_classic_navigation(driver, pages):
    """Verify request handlers also work with classic navigation."""
    browser_name = driver.caps["browserName"]
    if browser_name.lower() in ("chrome", "microsoftedge"):
        pytest.skip(reason=f"Request handlers don't yet work in {browser_name} using classic navigation")

    exceptions = []

    def callback(request: Request):
        try:
            request.continue_request()
        except WebDriverException as e:
            exceptions.append(e)

    callback_id = driver.network.add_request_handler("before_request", callback)
    assert callback_id is not None, "Request handler not added"
    pages.load("formPage.html")
    assert len(exceptions) == 0, "Exception raised in handler callback"

    driver.network.remove_request_handler("before_request", callback_id)


def test_handler_with_data_url_request(driver, pages):
    data_requests = []
    exceptions = []

    def callback(request: Request):
        if request.url.startswith("data:"):
            data_requests.append(request)
        try:
            request.continue_request()
        except WebDriverException as e:
            exceptions.append(e)

    callback_id = driver.network.add_request_handler("before_request", callback)
    url = pages.url("data_url.html")
    driver.browsing_context.navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)
    time.sleep(1)  # give callback time to complete
    assert driver.find_element(By.ID, "data-url-image").is_displayed()
    assert len(data_requests) > 0, "BiDi event not captured"
    assert len(exceptions) == 0, "Exception raised when continuing request in handler callback"

    driver.network.remove_request_handler("before_request", callback_id)


# ---------------------------------------------------------------------------
# High-level request handler API
#
# These tests double as usage examples: handlers receive a Request, may
# observe, mutate, fail or stub it, and Selenium reconciles the outcome and
# continues the request automatically.
# ---------------------------------------------------------------------------


def _navigate(driver, url):
    driver.browsing_context.navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)


def test_listen_to_requests_without_modifying(driver, pages):
    requests = []

    def log_request(request: Request):
        requests.append((request.method, request.url, dict(request.headers)))

    handler_id = driver.network.add_request_handler(log_request)
    try:
        url = pages.url("formPage.html")
        _navigate(driver, url)
        assert driver.find_element(By.NAME, "login").is_displayed(), "Request not continued"
        document_requests = [r for r in requests if r[1] == url]
        assert document_requests, "Document request not observed"
        assert document_requests[0][0] == "GET"
        assert isinstance(document_requests[0][2], dict)
    finally:
        driver.network.remove_request_handler(handler_id)


def test_fail_requests_matching_url_pattern(driver, pages):
    def block_request(request: Request):
        request.fail()

    driver.network.add_request_handler(["**/formPage.html"], block_request)
    try:
        with pytest.raises(WebDriverException):
            _navigate(driver, pages.url("formPage.html"))
    finally:
        driver.network.clear_request_handlers()


def test_provide_stubbed_response(driver, pages):
    def stub_response(request: Request):
        request.provide_response(
            200,
            {"content-type": "text/html"},
            "<html><head><title>Stubbed</title></head><body><p id='stubbed'>stubbed response</p></body></html>",
        )

    handler_id = driver.network.add_request_handler(["**/formPage.html"], stub_response)
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert driver.find_element(By.ID, "stubbed").text == "stubbed response"
    finally:
        driver.network.remove_request_handler(handler_id)


def test_change_request_headers(driver, pages):
    def add_auth_header(request: Request):
        headers = request.headers.copy()
        headers["authorization"] = "Bearer token123"
        request.set_headers(headers)

    handler_id = driver.network.add_request_handler(add_auth_header)
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert driver.find_element(By.NAME, "login").is_displayed(), "Mutated request not continued"
    finally:
        driver.network.remove_request_handler(handler_id)


@pytest.mark.xfail_firefox(reason="Firefox does not yet support rewriting the URL in network.continueRequest")
def test_change_request_url(driver, pages):
    def rewrite_url(request: Request):
        request.set_url(pages.url("simpleTest.html"))

    handler_id = driver.network.add_request_handler(["**/formPage.html"], rewrite_url)
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert driver.find_element(By.ID, "oneline").text == "A single line of text"
    finally:
        driver.network.remove_request_handler(handler_id)


def test_fail_wins_when_multiple_handlers_disagree(driver, pages):
    def mutate(request: Request):
        headers = request.headers.copy()
        headers["x-mutated"] = "true"
        request.set_headers(headers)

    def block_request(request: Request):
        request.fail()

    driver.network.add_request_handler(["**/formPage.html"], mutate)
    driver.network.add_request_handler(["**/formPage.html"], block_request)
    try:
        with pytest.raises(WebDriverException):
            _navigate(driver, pages.url("formPage.html"))
    finally:
        driver.network.clear_request_handlers()


def test_url_patterns_scope_handlers(driver, pages):
    seen = []

    handler_id = driver.network.add_request_handler(["**/simpleTest.html"], lambda request: seen.append(request.url))
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert not seen, "Handler ran for a non-matching URL"
        assert driver.find_element(By.NAME, "login").is_displayed(), "Non-matching request not continued"

        _navigate(driver, pages.url("simpleTest.html"))
        assert seen, "Handler did not run for a matching URL"
        assert all("simpleTest.html" in url for url in seen)
    finally:
        driver.network.remove_request_handler(handler_id)


def test_remove_handler_by_id_stops_observation(driver, pages):
    seen = []

    handler_id = driver.network.add_request_handler(lambda request: seen.append(request.url))
    driver.network.remove_request_handler(handler_id)

    _navigate(driver, pages.url("formPage.html"))
    assert not seen, "Removed handler still observed requests"
    assert driver.find_element(By.NAME, "login").is_displayed(), "Request not continued"
