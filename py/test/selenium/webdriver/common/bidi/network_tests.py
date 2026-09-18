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
from selenium.webdriver.common.window import WindowTypes


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
            request.submit()
        except WebDriverException as e:
            exceptions.append(e)

    callback_id = driver.network.add_request_handler("before_request", callback)
    assert callback_id is not None, "Request handler not added"
    url = pages.url("formPage.html")
    driver.browsing_context.navigate(context=driver.current_window_handle, url=url, wait=ReadinessState.COMPLETE)
    assert driver.find_element(By.NAME, "login").is_displayed(), "Request not continued"
    assert len(exceptions) == 0, "Exception raised when continuing request in handler callback"

    driver.network.remove_request_handler("before_request", callback_id)


# Successful authentication warms the browser's HTTP auth cache for the
# origin, suppressing authRequired challenges in later tests — restart the
# driver afterwards so challenge-dependent tests start clean.
@pytest.mark.needs_fresh_driver
def test_continue_with_auth(driver, pages):
    callback_id = driver.network.add_auth_handler("postman", "password")
    assert callback_id is not None, "Request handler not added"
    driver.browsing_context.navigate(
        context=driver.current_window_handle, url=pages.url("basic-auth"), wait=ReadinessState.COMPLETE
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
            request.submit()
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
            request.submit()
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
# These tests double as usage examples: handlers receive a Request and may
# observe it, stage mutations on it, or settle it with fail(), respond() or
# submit(). Handlers are consulted last-registered first, the first to settle
# stops the chain, and a request nothing settles is sent with whatever was
# staged — so an observer never stalls the page.
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

    driver.network.add_request_handler([pages.url("formPage.html")], block_request)
    try:
        with pytest.raises(WebDriverException):
            _navigate(driver, pages.url("formPage.html"))
    finally:
        driver.network.clear_request_handlers()


def test_provide_stubbed_response(driver, pages):
    def stub_response(request: Request):
        request.respond(
            200,
            {"content-type": "text/html"},
            "<html><head><title>Stubbed</title></head><body><p id='stubbed'>stubbed response</p></body></html>",
        )

    handler_id = driver.network.add_request_handler([pages.url("formPage.html")], stub_response)
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

    handler_id = driver.network.add_request_handler([pages.url("formPage.html")], rewrite_url)
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert driver.find_element(By.ID, "oneline").text == "A single line of text"
    finally:
        driver.network.remove_request_handler(handler_id)


def test_last_registered_handler_settles_the_request(driver, pages):
    """Handlers are consulted last-registered first and the first to settle wins."""
    mutated = []

    def mutate(request: Request):
        mutated.append(request.url)
        request.add_header("x-mutated", "true")

    def block_request(request: Request):
        request.fail()

    driver.network.add_request_handler([pages.url("formPage.html")], mutate)
    driver.network.add_request_handler([pages.url("formPage.html")], block_request)
    try:
        with pytest.raises(WebDriverException):
            _navigate(driver, pages.url("formPage.html"))
        assert not mutated, "The chain should stop at the handler that settled the request"
    finally:
        driver.network.clear_request_handlers()


def test_locally_registered_handler_overrides_a_shared_one(driver, pages):
    """A handler registered later can override what an earlier one staged."""
    seen = []

    driver.network.add_request_handler([pages.url("formPage.html")], lambda request: seen.append("shared"))
    driver.network.add_request_handler([pages.url("formPage.html")], lambda request: request.submit())
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert driver.find_element(By.NAME, "login").is_displayed(), "Submitted request not sent"
        assert not seen, "submit() should short-circuit the earlier handler"
    finally:
        driver.network.clear_request_handlers()


def test_handler_exception_fails_the_request_and_surfaces(driver, pages):
    def broken(request: Request):
        raise RuntimeError("handler blew up")

    driver.network.add_request_handler([pages.url("formPage.html")], broken)
    try:
        with pytest.raises(WebDriverException):
            _navigate(driver, pages.url("formPage.html"))
        with pytest.raises(RuntimeError, match="handler blew up"):
            driver.network.clear_request_handlers()
    finally:
        driver.network.clear_request_handlers()


def test_handler_reads_the_original_request_value(driver, pages):
    seen = []

    def observe(request: Request):
        seen.append((dict(request.headers), dict(request.original.headers)))

    driver.network.add_request_handler([pages.url("formPage.html")], observe)
    driver.network.add_request_handler([pages.url("formPage.html")], lambda request: request.add_header("x-test", "1"))
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert seen, "Observer did not run"
        staged, original = seen[0]
        assert staged.get("x-test") == "1", "Staged mutation not visible to the next handler"
        assert "x-test" not in original, "The original value must not carry staged mutations"
    finally:
        driver.network.clear_request_handlers()


def test_handler_scoped_to_another_window_handle_is_not_consulted(driver, pages):
    seen = []
    other_tab = driver.browsing_context.create(type=WindowTypes.TAB)
    try:
        driver.network.add_request_handler(lambda request: seen.append(request.url), window_handle=other_tab)
        _navigate(driver, pages.url("formPage.html"))
        assert driver.find_element(By.NAME, "login").is_displayed(), "Request not continued"
        assert not seen, "A handler scoped to another window handle must not be consulted"
    finally:
        driver.network.clear_request_handlers()
        driver.browsing_context.close(other_tab)


def test_window_handle_and_user_context_together_are_rejected(driver):
    with pytest.raises(ValueError, match="never both"):
        driver.network.add_request_handler(
            lambda request: None, window_handle=driver.current_window_handle, user_context="some-context"
        )


def test_url_patterns_scope_handlers(driver, pages):
    seen = []

    handler_id = driver.network.add_request_handler(
        [pages.url("simpleTest.html")], lambda request: seen.append(request.url)
    )
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert not seen, "Handler ran for a non-matching URL"
        assert driver.find_element(By.NAME, "login").is_displayed(), "Non-matching request not continued"

        _navigate(driver, pages.url("simpleTest.html"))
        assert seen, "Handler did not run for a matching URL"
        assert all("simpleTest.html" in url for url in seen)
    finally:
        driver.network.remove_request_handler(handler_id)


def test_request_body_is_absent_unless_collected(driver, pages):
    seen = []

    handler_id = driver.network.add_request_handler(
        [pages.url("formPage.html")], lambda request: seen.append(request.body)
    )
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert seen, "Handler did not run"
        assert all(body is None for body in seen), "A body must not be collected unless the handler opted in"
    finally:
        driver.network.remove_request_handler(handler_id)


def test_collect_body_reads_the_posted_body(driver, pages):
    """A handler that opted in reads the body on the event (decision 10)."""
    seen = []

    _navigate(driver, pages.url("simpleTest.html"))
    handler_id = driver.network.add_request_handler(
        [pages.url("formPage.html")], lambda request: seen.append(request.body), collect_body=True
    )
    try:
        driver.execute_script("fetch(arguments[0], {method: 'POST', body: 'hello=world'});", pages.url("formPage.html"))
        deadline = time.time() + 20
        while not seen and time.time() < deadline:
            time.sleep(0.2)
        assert seen == ["hello=world"], f"Body not collected inside the handler: {seen}"
    finally:
        driver.network.remove_request_handler(handler_id)


def test_collect_body_does_not_stall_a_bodyless_request(driver, pages):
    """A GET has no body to collect, and asking for one must not hold the page."""
    seen = []

    handler_id = driver.network.add_request_handler(
        [pages.url("formPage.html")], lambda request: seen.append(request.body), collect_body=True
    )
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert driver.find_element(By.NAME, "login").is_displayed(), "Request not continued"
        assert seen, "Handler did not run"
        assert all(body is None for body in seen), f"A bodyless request must report no body: {seen}"
    finally:
        driver.network.remove_request_handler(handler_id)


def test_collect_body_installs_and_tears_down_the_collector(driver, pages):
    """Selenium owns the collector, so the user never adds or removes one."""
    handler_id = driver.network.add_request_handler(
        [pages.url("formPage.html")], lambda request: request.body, collect_body=True
    )
    assert driver.network._data_collectors != [], "Collector not installed with the handler"
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert driver.find_element(By.NAME, "login").is_displayed(), "Request not continued"
    finally:
        driver.network.remove_request_handler(handler_id)
    assert driver.network._data_collectors == [], "Collector not removed with the handler"


def test_remove_handler_by_id_stops_observation(driver, pages):
    seen = []

    handler_id = driver.network.add_request_handler(lambda request: seen.append(request.url))
    driver.network.remove_request_handler(handler_id)

    _navigate(driver, pages.url("formPage.html"))
    assert not seen, "Removed handler still observed requests"
    assert driver.find_element(By.NAME, "login").is_displayed(), "Request not continued"


# ---------------------------------------------------------------------------
# High-level response handler API
#
# These tests double as usage examples: handlers receive a Response and may
# observe it, stage mutations on it, or settle it with fail() or submit().
# Intercepting a response holds it before its body is collected, so a response
# body is not readable while intercepting.
# ---------------------------------------------------------------------------


def test_listen_to_responses_without_modifying(driver, pages):
    responses = []

    def log_response(response: Response):
        responses.append((response.url, response.status, dict(response.headers)))

    handler_id = driver.network.add_response_handler(log_response)
    try:
        url = pages.url("formPage.html")
        _navigate(driver, url)
        assert driver.find_element(By.NAME, "login").is_displayed(), "Response not continued"
        document_responses = [r for r in responses if r[0] == url]
        assert document_responses, "Document response not observed"
        assert document_responses[0][1] == 200
        assert isinstance(document_responses[0][2], dict)
    finally:
        driver.network.remove_response_handler(handler_id)


def test_change_response_headers(driver, pages):
    def add_header(response: Response):
        headers = response.headers.copy()
        headers["x-modified"] = "true"
        response.set_headers(headers)

    handler_id = driver.network.add_response_handler([pages.url("formPage.html")], add_header)
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert driver.find_element(By.NAME, "login").is_displayed(), "Mutated response not continued"
    finally:
        driver.network.remove_response_handler(handler_id)


@pytest.mark.xfail_firefox(
    reason="Firefox only supports the provideResponse body parameter for the beforeRequestSent phase"
)
def test_change_response_body(driver, pages):
    def rewrite_body(response: Response):
        response.set_body(
            "<html><head><title>Replaced</title></head><body><p id='replaced'>replaced response</p></body></html>"
        )

    handler_id = driver.network.add_response_handler([pages.url("formPage.html")], rewrite_body)
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert driver.find_element(By.ID, "replaced").text == "replaced response"
    finally:
        driver.network.remove_response_handler(handler_id)


def test_response_url_patterns_scope_handlers(driver, pages):
    seen = []

    handler_id = driver.network.add_response_handler(
        [pages.url("simpleTest.html")], lambda response: seen.append(response.url)
    )
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert not seen, "Handler ran for a non-matching URL"
        assert driver.find_element(By.NAME, "login").is_displayed(), "Non-matching response not continued"

        _navigate(driver, pages.url("simpleTest.html"))
        assert seen, "Handler did not run for a matching URL"
        assert all("simpleTest.html" in url for url in seen)
    finally:
        driver.network.remove_response_handler(handler_id)


def test_remove_response_handler_by_id_stops_observation(driver, pages):
    seen = []

    handler_id = driver.network.add_response_handler(lambda response: seen.append(response.url))
    driver.network.remove_response_handler(handler_id)

    _navigate(driver, pages.url("formPage.html"))
    assert not seen, "Removed handler still observed responses"
    assert driver.find_element(By.NAME, "login").is_displayed(), "Response not continued"


def test_request_and_response_handlers_compose(driver, pages):
    events = []

    request_handler_id = driver.network.add_request_handler(
        [pages.url("simpleTest.html")], lambda request: events.append(("request", request.url))
    )
    response_handler_id = driver.network.add_response_handler(
        [pages.url("simpleTest.html")], lambda response: events.append(("response", response.status))
    )
    try:
        _navigate(driver, pages.url("simpleTest.html"))
        assert driver.find_element(By.ID, "oneline").text == "A single line of text"
        assert ("response", 200) in events, "Response handler did not run"
        assert any(kind == "request" for kind, _ in events), "Request handler did not run"
    finally:
        driver.network.remove_request_handler(request_handler_id)
        driver.network.remove_response_handler(response_handler_id)


# ---------------------------------------------------------------------------
# High-level authentication handler API
#
# These tests double as usage examples: handlers receive an
# AuthenticationRequest and settle it with authenticate() or cancel(). A
# challenge nothing settles falls through to the browser's own behavior.
# ---------------------------------------------------------------------------


# needs_fresh_driver: successful authentication warms the browser's HTTP auth
# cache for the origin, which would suppress the challenge in later tests.
@pytest.mark.needs_fresh_driver
def test_provide_credentials_for_matching_url(driver, pages):
    def handle_authentication(auth):
        auth.authenticate("postman", "password")

    handler_id = driver.network.add_authentication_handler([pages.url("basic-auth")], handle_authentication)
    try:
        _navigate(driver, pages.url("basic-auth"))
        assert "authenticated" in driver.page_source, "Authorization failed"
    finally:
        driver.network.remove_authentication_handler(handler_id)


def test_cancel_authentication_challenge(driver, pages):
    def handle_authentication(auth):
        auth.cancel()

    handler_id = driver.network.add_authentication_handler(handle_authentication)
    try:
        _navigate(driver, pages.url("basic-auth"))
        assert "authenticated" not in driver.page_source, "Cancelled challenge still authenticated"
    finally:
        driver.network.remove_authentication_handler(handler_id)


@pytest.mark.needs_fresh_driver
def test_authentication_handler_observes_challenge_details(driver, pages):
    challenges = []

    def handle_authentication(auth):
        challenges.append((auth.url, auth.realm, auth.scheme))
        auth.authenticate("postman", "password")

    handler_id = driver.network.add_authentication_handler(handle_authentication)
    try:
        _navigate(driver, pages.url("basic-auth"))
        assert challenges, "Authentication handler did not run"
        assert challenges[0][0].endswith("/basic-auth")
    finally:
        driver.network.remove_authentication_handler(handler_id)


@pytest.mark.needs_fresh_driver
def test_add_authentication_supplies_fixed_credentials(driver, pages):
    handler_id = driver.network.add_authentication("postman", "password", [pages.url("basic-auth")])
    try:
        _navigate(driver, pages.url("basic-auth"))
        assert "authenticated" in driver.page_source, "Authorization failed"
    finally:
        driver.network.remove_authentication_handler(handler_id)


def test_add_authentication_is_cleared_with_the_family(driver):
    driver.network.add_authentication("user", "passwd")
    driver.network.clear_authentication_handlers()
    assert driver.network.intercepts == [], "Intercept not removed"


def test_remove_authentication_handler_removes_intercept(driver):
    handler_id = driver.network.add_authentication_handler(lambda auth: None)
    driver.network.remove_authentication_handler(handler_id)
    assert driver.network.intercepts == [], "Intercept not removed"


def test_clear_authentication_handlers_removes_all_intercepts(driver):
    driver.network.add_authentication_handler(lambda auth: None)
    driver.network.add_authentication_handler([{"hostname": "example.com"}], lambda auth: None)
    driver.network.clear_authentication_handlers()
    assert driver.network.intercepts == [], "Intercepts not removed"


# ---------------------------------------------------------------------------
# Extra headers API
#
# These tests double as usage examples: extra headers are merged into every
# subsequent request until removed.
# ---------------------------------------------------------------------------


def test_extra_header_is_sent_with_requests(driver, pages):
    driver.network.add_extra_header("x-selenium-extra", "extra-header-value")
    try:
        _navigate(driver, pages.url("echo_headers"))
        assert "x-selenium-extra" in driver.page_source, "Extra header not sent"
        assert "extra-header-value" in driver.page_source, "Extra header value not sent"
    finally:
        driver.network.clear_extra_headers()


def test_removed_extra_header_is_not_sent(driver, pages):
    driver.network.add_extra_header("x-selenium-extra", "extra-header-value")
    driver.network.remove_extra_header("x-selenium-extra")

    _navigate(driver, pages.url("echo_headers"))
    assert "x-selenium-extra" not in driver.page_source, "Removed extra header still sent"
    assert driver.network.intercepts == [], "Intercept not removed"


def test_extra_headers_compose_with_request_handlers(driver, pages):
    seen = []

    driver.network.add_extra_header("x-selenium-extra", "extra-header-value")
    handler_id = driver.network.add_request_handler(lambda request: seen.append(request.url))
    try:
        _navigate(driver, pages.url("formPage.html"))
        assert driver.find_element(By.NAME, "login").is_displayed(), "Request not continued"
        assert seen, "Request handler did not run"
    finally:
        driver.network.remove_request_handler(handler_id)
        driver.network.clear_extra_headers()
