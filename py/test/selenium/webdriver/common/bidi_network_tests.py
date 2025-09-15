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
    def callback(request: Request):
        request.continue_request()

    callback_id = driver.network.add_request_handler("before_request", callback)
    assert callback_id is not None, "Request handler not added"
    url = pages.url("formPage.html")
    driver.browsing_context.navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)
    assert driver.find_element(By.NAME, "login").is_displayed(), "Request not continued"


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
    assert len(exceptions) == 0, "Exception raised when continuing request in callback"
