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
from selenium.webdriver.common.bidi.network import Request, Response
from selenium.webdriver.common.by import By


def test_network_initialized(driver):
    assert driver.network is not None


def test_add_intercept(driver, pages):
    result = driver.network._add_intercept()
    assert result is not None, "Intercept not added"


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


def test_continue_with_auth(driver):
    callback_id = driver.network.add_auth_handler("postman", "password")
    assert callback_id is not None, "Request handler not added"
    driver.browsing_context.navigate(
        context=driver.current_window_handle, url="https://postman-echo.com/basic-auth", wait=ReadinessState.COMPLETE
    )
    assert "authenticated" in driver.page_source, "Authorization failed"


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


@pytest.mark.xfail_chrome(reason="Data URLs in Network requests are not implemented in Chrome yet")
@pytest.mark.xfail_edge(reason="Data URLs in Network requests are not implemented in Edge yet")
@pytest.mark.xfail_firefox(reason="Data URLs in Network requests are not implemented in Firefox yet")
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

    driver.network.add_request_handler("before_request", callback)
    url = pages.url("data_url.html")
    driver.browsing_context.navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)
    time.sleep(1)  # give callback time to complete
    assert driver.find_element(By.ID, "data-url-image").is_displayed()
    assert len(data_requests) > 0, "BiDi event not captured"
    assert len(exceptions) == 0, "Exception raised when continuing request in handler callback"


# Network Data Collector Tests
def test_add_data_collector(driver):
    collector_id = driver.network.add_data_collector(data_types=["response"], max_encoded_data_size=1000)
    assert collector_id is not None, "Data collector not added"
    assert collector_id in driver.network.data_collectors, "Collector not tracked"


def test_add_data_collector_with_contexts(driver):
    collector_id = driver.network.add_data_collector(
        data_types=["response"], max_encoded_data_size=1000, contexts=[driver.current_window_handle]
    )
    assert collector_id is not None, "Data collector with contexts not added"


def test_remove_data_collector(driver):
    collector_id = driver.network.add_data_collector(data_types=["response"], max_encoded_data_size=1000)
    assert collector_id in driver.network.data_collectors, "Collector not tracked"

    driver.network.remove_data_collector(collector_id)
    assert collector_id not in driver.network.data_collectors, "Collector not removed"


# Response Handler Tests
def test_add_and_remove_response_handler(driver, pages):
    responses = []

    def callback(response: Response):
        responses.append(response)

    callback_id = driver.network.add_response_handler("response_completed", callback)
    assert callback_id is not None, "Response handler not added"

    driver.network.remove_response_handler("response_completed", callback_id)

    pages.load("formPage.html")
    assert not responses, "Responses captured after handler removal"


def test_clear_response_handlers(driver, pages):
    responses = []

    def callback(response: Response):
        responses.append(response)

    callback_id_1 = driver.network.add_response_handler("response_completed", callback)
    assert callback_id_1 is not None, "Response handler not added"
    callback_id_2 = driver.network.add_response_handler("response_started", callback)
    assert callback_id_2 is not None, "Response handler not added"

    driver.network.clear_response_handlers()

    url = pages.url("formPage.html")
    driver.browsing_context.navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)

    assert not responses, "Responses captured after clearing handlers"


def test_response_handler_captures_response_data(driver, pages):
    responses = []

    def callback(response: Response):
        responses.append(response)

    callback_id = driver.network.add_response_handler("response_completed", callback)
    assert callback_id is not None, "Response handler not added"

    url = pages.url("formPage.html")
    driver.browsing_context.navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)

    # Wait for response
    time.sleep(2)

    assert len(responses) > 0

    response = responses[0]
    assert response.request_id is not None
    assert "formPage.html" in response.url
    assert response.status_code is not None

    driver.network.remove_response_handler("response_completed", callback_id)


# Integrated Tests: Response Handlers + Data Collection
def test_data_collection_with_response_handler(driver, pages):
    captured_responses = []
    collected_data = []

    # Add a data collector
    collector_id = driver.network.add_data_collector(data_types=["response"], max_encoded_data_size=50000)

    def response_callback(response: Response):
        captured_responses.append(response)
        data = driver.network.get_data("response", response.request_id, collector_id)
        collected_data.append({"request_id": response.request_id, "url": response.url, "data": data})

    # Add response handler
    handler_id = driver.network.add_response_handler("response_completed", response_callback)

    url = pages.url("formPage.html")
    driver.browsing_context.navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)

    # Wait for responses
    time.sleep(2)

    assert len(captured_responses) > 0, "No responses captured"
    assert "<title>We Leave From Here</title>" in collected_data[0]["data"].value

    driver.network.remove_response_handler("response_completed", handler_id)
    driver.network.remove_data_collector(collector_id)


def test_response_handler_event_types(driver, pages):
    """Test both response_started and response_completed events."""
    started_responses = []
    completed_responses = []

    def started_callback(response: Response):
        started_responses.append(response)

    def completed_callback(response: Response):
        completed_responses.append(response)

    # Add handlers for both events
    driver.network.add_response_handler("response_started", started_callback)
    driver.network.add_response_handler("response_completed", completed_callback)

    url = pages.url("formPage.html")
    driver.browsing_context.navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)

    # Wait for events
    time.sleep(1)

    assert len(completed_responses) > 0, "No response_completed events captured"
    assert len(started_responses) > 0, "No response_started events captured"

    driver.network.clear_response_handlers()


def test_continue_response_with_intercept(driver, pages):
    """Test continue_response with response interception.

    This test tests that response_started events can be intercepted
    and modified using continue_response().
    """
    intercepted_responses = []

    def response_handler(response: Response):
        # Modify the response when it's intercepted
        response.continue_response(
            status_code=200,
            headers=[
                {"name": "X-Modified", "value": {"type": "string", "value": "true"}},
            ],
        )
        intercepted_responses.append(response)

    handler_id = driver.network.add_response_handler("response_started", response_handler, intercept=True)

    url = pages.url("formPage.html")
    driver.browsing_context.navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)

    # Wait for events
    time.sleep(1)

    driver.network.remove_response_handler("response_started", handler_id)


def test_response_handler_with_url_patterns(driver, pages):
    """Test response handler with URL pattern filtering."""
    matched_responses = []
    all_responses = []

    def matched_callback(response: Response):
        matched_responses.append(response)

    def all_callback(response: Response):
        all_responses.append(response)

    # Add handler with URL pattern - only matches formPage.html
    driver.network.add_response_handler(
        "response_completed", matched_callback, url_patterns=[{"type": "string", "pattern": "*/formPage.html"}]
    )

    # Add handler without pattern - matches all
    driver.network.add_response_handler("response_completed", all_callback)

    url = pages.url("formPage.html")
    driver.browsing_context.navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)

    # Wait for events
    time.sleep(1)

    assert len(matched_responses) <= len(all_responses)

    assert len(all_responses) > 0, "No responses captured"

    driver.network.clear_response_handlers()
