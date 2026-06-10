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

from selenium.webdriver.common.bidi._network_handlers import glob_to_regex, glob_to_url_pattern, globs_to_url_patterns
from selenium.webdriver.common.bidi.network import AuthenticationRequest, Network, Request, Response


class FakeConnection:
    def __init__(self, fail_methods=()):
        self.commands = []
        self.added_callbacks = []
        self.removed_callbacks = []
        self.fail_methods = set(fail_methods)
        self._next_callback_id = 1
        self._next_intercept_id = 1

    def add_callback(self, event_wrapper, callback):
        callback_id = self._next_callback_id
        self._next_callback_id += 1
        self.added_callbacks.append((callback_id, event_wrapper.event_class, callback))
        return callback_id

    def remove_callback(self, event_wrapper, callback_id):
        self.removed_callbacks.append((callback_id, event_wrapper.event_class))

    def execute(self, cmd):
        payload = next(cmd)
        self.commands.append(payload)

        if payload["method"] in self.fail_methods:
            raise RuntimeError(f"unsupported operation: {payload['method']}")

        if payload["method"] == "network.addIntercept":
            response = {"intercept": f"intercept-{self._next_intercept_id}"}
            self._next_intercept_id += 1
        elif payload["method"] == "session.subscribe":
            response = {"subscription": "subscription-1"}
        else:
            response = {}

        try:
            cmd.send(response)
        except StopIteration as exc:
            return exc.value

        raise AssertionError("BiDi command generator did not finish")

    def commands_named(self, method):
        return [c for c in self.commands if c["method"] == method]


def make_before_request_event(
    url="https://example.com/api/data",
    request_id="req-1",
    intercepts=("intercept-1",),
    blocked=True,
):
    return {
        "context": "ctx-1",
        "isBlocked": blocked,
        "intercepts": list(intercepts),
        "redirectCount": 0,
        "request": {
            "request": request_id,
            "url": url,
            "method": "GET",
            "headers": [{"name": "accept", "value": {"type": "string", "value": "*/*"}}],
            "cookies": [{"name": "sid", "value": {"type": "string", "value": "abc"}, "domain": "example.com"}],
            "destination": "document",
        },
        "timestamp": 1,
    }


def make_response_started_event(
    url="https://example.com/api/data",
    request_id="req-1",
    intercepts=("intercept-1",),
    blocked=True,
    status=200,
):
    return {
        "context": "ctx-1",
        "isBlocked": blocked,
        "intercepts": list(intercepts),
        "redirectCount": 0,
        "request": {
            "request": request_id,
            "url": url,
            "method": "GET",
            "headers": [],
            "cookies": [],
        },
        "response": {
            "url": url,
            "status": status,
            "statusText": "OK",
            "headers": [{"name": "content-type", "value": {"type": "string", "value": "text/html"}}],
            "mimeType": "text/html",
        },
        "timestamp": 1,
    }


def make_auth_required_event(
    url="https://secure.example.com/api/data",
    request_id="req-1",
    intercepts=("intercept-1",),
    blocked=True,
    challenges=({"scheme": "basic", "realm": "secure-area"},),
):
    return {
        "context": "ctx-1",
        "isBlocked": blocked,
        "intercepts": list(intercepts),
        "redirectCount": 0,
        "request": {
            "request": request_id,
            "url": url,
            "method": "GET",
            "headers": [],
            "cookies": [],
        },
        "response": {
            "url": url,
            "status": 401,
            "statusText": "Unauthorized",
            "headers": [],
            "mimeType": "text/html",
            "authChallenges": list(challenges),
        },
        "timestamp": 1,
    }


def dispatch_event(conn, event):
    """Invoke the registry's subscribed callback as the WebSocket would."""
    assert conn.added_callbacks, "no event callback registered"
    conn.added_callbacks[-1][2](event)


def dispatch_event_to(conn, event, bidi_event):
    """Invoke the latest subscribed callback for a specific BiDi event."""
    callbacks = [callback for _, event_class, callback in conn.added_callbacks if event_class == bidi_event]
    assert callbacks, f"no event callback registered for {bidi_event}"
    callbacks[-1](event)


def test_add_request_handler_accepts_before_request_sent_alias():
    conn = FakeConnection()
    network = Network(conn)

    callback_id = network.add_request_handler("before_request_sent", lambda request: None)
    network.remove_request_handler("before_request_sent", callback_id)

    assert callback_id == 1
    assert conn.added_callbacks[0][1] == "network.beforeRequestSent"
    assert conn.removed_callbacks[0] == (1, "network.beforeRequestSent")
    assert conn.commands == [
        {"method": "network.addIntercept", "params": {"phases": ["beforeRequestSent"]}},
        {"method": "session.subscribe", "params": {"events": ["network.beforeRequestSent"]}},
        {"method": "session.unsubscribe", "params": {"subscriptions": ["subscription-1"]}},
        {"method": "network.removeIntercept", "params": {"intercept": "intercept-1"}},
    ]


def test_add_request_handler_rejects_unsupported_alias():
    network = Network(FakeConnection())

    with pytest.raises(ValueError, match="Unsupported request handler event 'response_started'"):
        network.add_request_handler("response_started", lambda request: None)


def test_continue_request_skips_data_urls():
    conn = FakeConnection()
    params = {"request": {"url": "data:image/gif;base64,R0lGODlh", "request": "request-id-1"}}
    request = Request(conn, params)

    request.continue_request()

    assert conn.commands == [], "network.continueRequest must not be sent for data: URLs"


def test_continue_request_sends_command_for_regular_urls():
    conn = FakeConnection()
    params = {"request": {"url": "https://example.com/style.css", "request": "request-id-2"}}
    request = Request(conn, params)

    request.continue_request()

    assert len(conn.commands) == 1
    assert conn.commands[0]["method"] == "network.continueRequest"
    assert conn.commands[0]["params"]["request"] == "request-id-2"


def test_request_parses_event_properties():
    request = Request(FakeConnection(), make_before_request_event())

    assert request.url == "https://example.com/api/data"
    assert request.method == "GET"
    assert request.headers == {"accept": "*/*"}
    assert request.cookies[0]["name"] == "sid"
    assert request.cookies[0]["value"] == "abc"
    assert request.resource_type == "document"
    assert request.body is None


def test_high_level_observer_auto_continues():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    handler_id = network.add_request_handler(lambda request: seen.append(request.url))
    dispatch_event(conn, make_before_request_event())

    assert handler_id == "request-handler-1"
    assert seen == ["https://example.com/api/data"]
    continues = conn.commands_named("network.continueRequest")
    assert len(continues) == 1
    assert continues[0]["params"] == {"request": "req-1"}
    # The intercept must apply to all URLs (no urlPatterns key).
    assert "urlPatterns" not in conn.commands_named("network.addIntercept")[0]["params"]


def test_fail_takes_precedence_over_stub_and_mutations():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(lambda request: request.set_url("https://example.com/mutated"))
    network.add_request_handler(lambda request: request.provide_response(200, {}, "stub"))
    network.add_request_handler(lambda request: request.fail())
    dispatch_event(conn, make_before_request_event())

    assert conn.commands_named("network.failRequest") == [
        {"method": "network.failRequest", "params": {"request": "req-1"}}
    ]
    assert conn.commands_named("network.continueRequest") == []
    assert conn.commands_named("network.provideResponse") == []


def test_provide_response_serializes_stub():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(
        lambda request: request.provide_response(200, {"content-type": "application/json"}, '{"message": "stubbed"}')
    )
    dispatch_event(conn, make_before_request_event())

    provides = conn.commands_named("network.provideResponse")
    assert len(provides) == 1
    params = provides[0]["params"]
    assert params["request"] == "req-1"
    assert params["statusCode"] == 200
    assert params["headers"] == [{"name": "content-type", "value": {"type": "string", "value": "application/json"}}]
    assert params["body"] == {"type": "string", "value": '{"message": "stubbed"}'}
    assert conn.commands_named("network.continueRequest") == []


def test_mutations_continue_with_changes():
    conn = FakeConnection()
    network = Network(conn)

    def mutate(request):
        request.set_url(request.url.replace("http://", "https://"))
        request.set_method("POST")
        headers = request.headers.copy()
        headers["authorization"] = "Bearer token123"
        request.set_headers(headers)
        request.set_cookies([{"name": "session-id", "value": "abc123"}])
        request.set_body("payload")

    network.add_request_handler(mutate)
    dispatch_event(conn, make_before_request_event(url="http://example.com/api/data"))

    continues = conn.commands_named("network.continueRequest")
    assert len(continues) == 1
    params = continues[0]["params"]
    assert params["url"] == "https://example.com/api/data"
    assert params["method"] == "POST"
    assert {"name": "authorization", "value": {"type": "string", "value": "Bearer token123"}} in params["headers"]
    assert params["cookies"] == [{"name": "session-id", "value": {"type": "string", "value": "abc123"}}]
    assert params["body"] == {"type": "string", "value": "payload"}


def test_later_handlers_see_earlier_mutations():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(lambda request: request.set_headers({"x-first": "1"}))
    network.add_request_handler(lambda request: seen.append(dict(request.headers)))
    dispatch_event(conn, make_before_request_event())

    assert seen == [{"x-first": "1"}]


def test_manual_continue_suppresses_auto_continue():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(lambda request: request.continue_request())
    dispatch_event(conn, make_before_request_event())

    assert len(conn.commands_named("network.continueRequest")) == 1


def test_handler_exception_still_continues_request():
    conn = FakeConnection()
    network = Network(conn)

    def broken(request):
        raise RuntimeError("boom")

    network.add_request_handler(broken)
    dispatch_event(conn, make_before_request_event())

    assert len(conn.commands_named("network.continueRequest")) == 1


def test_glob_patterns_filter_callbacks():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(["**/analytics/**"], lambda request: seen.append(request.url))
    dispatch_event(conn, make_before_request_event(url="https://example.com/api/data"))

    assert seen == []
    # Non-matching requests blocked by our intercept are still continued.
    assert len(conn.commands_named("network.continueRequest")) == 1

    dispatch_event(conn, make_before_request_event(url="https://example.com/analytics/track", request_id="req-2"))
    assert seen == ["https://example.com/analytics/track"]


def test_single_string_pattern_accepted():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    handler_id = network.add_request_handler("**/api/**", lambda request: seen.append(request.url))
    dispatch_event(conn, make_before_request_event())

    assert handler_id == "request-handler-1"
    assert seen == ["https://example.com/api/data"]


def test_translatable_patterns_are_sent_to_browser():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(["https://api.tracking.com/**"], lambda request: None)

    # Wildcard-bearing components are omitted: UrlPatternPattern properties
    # match literally and browsers reject wildcard characters in them.
    params = conn.commands_named("network.addIntercept")[0]["params"]
    assert params["urlPatterns"] == [{"type": "pattern", "protocol": "https", "hostname": "api.tracking.com"}]


def test_blocked_event_owned_by_another_intercept_is_left_alone():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(lambda request: None)
    dispatch_event(conn, make_before_request_event(intercepts=("foreign-intercept",)))

    assert conn.commands_named("network.continueRequest") == []


def test_remove_high_level_handler_removes_intercept_and_subscription():
    conn = FakeConnection()
    network = Network(conn)

    handler_id = network.add_request_handler(lambda request: None)
    network.remove_request_handler(handler_id)

    assert conn.commands_named("network.removeIntercept") == [
        {"method": "network.removeIntercept", "params": {"intercept": "intercept-1"}}
    ]
    assert conn.commands_named("session.unsubscribe") == [
        {"method": "session.unsubscribe", "params": {"subscriptions": ["subscription-1"]}}
    ]
    with pytest.raises(ValueError, match="not found"):
        network.remove_request_handler(handler_id)


def test_clear_request_handlers_clears_high_level_handlers():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(lambda request: None)
    network.add_request_handler(["**/api/**"], lambda request: None)
    network.clear_request_handlers()

    removed = {c["params"]["intercept"] for c in conn.commands_named("network.removeIntercept")}
    assert removed == {"intercept-1", "intercept-2"}
    assert len(conn.commands_named("session.unsubscribe")) == 1


def test_data_url_requests_are_not_continued():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(lambda request: None)
    dispatch_event(conn, make_before_request_event(url="data:image/gif;base64,R0lGODlh"))

    assert conn.commands_named("network.continueRequest") == []


def test_response_parses_event_properties():
    response = Response(FakeConnection(), make_response_started_event())

    assert response.url == "https://example.com/api/data"
    assert response.status == 200
    assert response.reason_phrase == "OK"
    assert response.headers == {"content-type": "text/html"}
    assert response.mime_type == "text/html"
    assert response.cookies == []
    assert response.body is None


def test_response_observer_auto_continues():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    handler_id = network.add_response_handler(lambda response: seen.append((response.url, response.status)))
    dispatch_event(conn, make_response_started_event())

    assert handler_id == "response-handler-1"
    assert seen == [("https://example.com/api/data", 200)]
    continues = conn.commands_named("network.continueResponse")
    assert len(continues) == 1
    assert continues[0]["params"] == {"request": "req-1"}
    intercept_params = conn.commands_named("network.addIntercept")[0]["params"]
    assert intercept_params["phases"] == ["responseStarted"]
    assert "urlPatterns" not in intercept_params


def test_response_mutations_continue_with_changes():
    conn = FakeConnection()
    network = Network(conn)

    def mutate(response):
        headers = response.headers.copy()
        headers["x-modified"] = "true"
        response.set_headers(headers)
        response.set_status(204, reason_phrase="No Content")
        response.set_cookies([{"name": "session-id", "value": "abc123", "http_only": True, "path": "/"}])

    network.add_response_handler(mutate)
    dispatch_event(conn, make_response_started_event())

    continues = conn.commands_named("network.continueResponse")
    assert len(continues) == 1
    params = continues[0]["params"]
    assert params["statusCode"] == 204
    assert params["reasonPhrase"] == "No Content"
    assert {"name": "x-modified", "value": {"type": "string", "value": "true"}} in params["headers"]
    assert params["cookies"] == [
        {"name": "session-id", "value": {"type": "string", "value": "abc123"}, "httpOnly": True, "path": "/"}
    ]
    assert conn.commands_named("network.provideResponse") == []


def test_response_body_mutation_uses_provide_response():
    conn = FakeConnection()
    network = Network(conn)

    network.add_response_handler(lambda response: response.set_body("replacement body"))
    dispatch_event(conn, make_response_started_event())

    provides = conn.commands_named("network.provideResponse")
    assert len(provides) == 1
    params = provides[0]["params"]
    assert params["request"] == "req-1"
    assert params["body"] == {"type": "string", "value": "replacement body"}
    # The original status and headers are carried over with the new body.
    assert params["statusCode"] == 200
    assert params["headers"] == [{"name": "content-type", "value": {"type": "string", "value": "text/html"}}]
    assert conn.commands_named("network.continueResponse") == []


def test_response_body_and_header_mutations_provide_mutated_values():
    conn = FakeConnection()
    network = Network(conn)

    def mutate(response):
        response.set_status(503)
        response.set_headers({"content-type": "application/json"})
        response.set_body('{"error": "maintenance"}')

    network.add_response_handler(mutate)
    dispatch_event(conn, make_response_started_event())

    params = conn.commands_named("network.provideResponse")[0]["params"]
    assert params["statusCode"] == 503
    assert params["headers"] == [{"name": "content-type", "value": {"type": "string", "value": "application/json"}}]
    assert params["body"] == {"type": "string", "value": '{"error": "maintenance"}'}


def test_later_response_handlers_see_earlier_mutations():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_response_handler(lambda response: response.set_headers({"x-first": "1"}))
    network.add_response_handler(lambda response: seen.append(dict(response.headers)))
    dispatch_event(conn, make_response_started_event())

    assert seen == [{"x-first": "1"}]
    assert len(conn.commands_named("network.continueResponse")) == 1


def test_manual_continue_response_suppresses_auto_continue():
    conn = FakeConnection()
    network = Network(conn)

    network.add_response_handler(lambda response: response.continue_response())
    dispatch_event(conn, make_response_started_event())

    assert len(conn.commands_named("network.continueResponse")) == 1


def test_response_handler_exception_still_continues_response():
    conn = FakeConnection()
    network = Network(conn)

    def broken(response):
        raise RuntimeError("boom")

    network.add_response_handler(broken)
    dispatch_event(conn, make_response_started_event())

    assert len(conn.commands_named("network.continueResponse")) == 1


def test_response_glob_patterns_filter_callbacks():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_response_handler(["**/analytics/**"], lambda response: seen.append(response.url))
    dispatch_event(conn, make_response_started_event(url="https://example.com/api/data"))

    assert seen == []
    # Non-matching responses blocked by our intercept are still continued.
    assert len(conn.commands_named("network.continueResponse")) == 1

    dispatch_event(conn, make_response_started_event(url="https://example.com/analytics/track", request_id="req-2"))
    assert seen == ["https://example.com/analytics/track"]


def test_response_translatable_patterns_are_sent_to_browser():
    conn = FakeConnection()
    network = Network(conn)

    network.add_response_handler(["https://*.tracking.com/**"], lambda response: None)

    params = conn.commands_named("network.addIntercept")[0]["params"]
    assert params["phases"] == ["responseStarted"]
    # The wildcard hostname and pathname are omitted from the browser-side
    # filter; Python-side glob matching narrows the results.
    assert params["urlPatterns"] == [{"type": "pattern", "protocol": "https"}]


def test_blocked_response_owned_by_another_intercept_is_left_alone():
    conn = FakeConnection()
    network = Network(conn)

    network.add_response_handler(lambda response: None)
    dispatch_event(conn, make_response_started_event(intercepts=("foreign-intercept",)))

    assert conn.commands_named("network.continueResponse") == []


def test_add_response_handler_requires_callable():
    network = Network(FakeConnection())

    with pytest.raises(TypeError, match="callable"):
        network.add_response_handler(["**/api/**"], "not-a-callback")


def test_remove_response_handler_removes_intercept_and_subscription():
    conn = FakeConnection()
    network = Network(conn)

    handler_id = network.add_response_handler(lambda response: None)
    network.remove_response_handler(handler_id)

    assert conn.commands_named("network.removeIntercept") == [
        {"method": "network.removeIntercept", "params": {"intercept": "intercept-1"}}
    ]
    assert conn.commands_named("session.unsubscribe") == [
        {"method": "session.unsubscribe", "params": {"subscriptions": ["subscription-1"]}}
    ]
    with pytest.raises(ValueError, match=r"Response handler .* not found"):
        network.remove_response_handler(handler_id)


def test_clear_response_handlers_clears_only_response_handlers():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(lambda request: seen.append(("request", request.url)))
    network.add_response_handler(lambda response: seen.append(("response", response.url)))
    network.clear_response_handlers()

    # Only the response handler's intercept (intercept-2) is removed.
    removed = {c["params"]["intercept"] for c in conn.commands_named("network.removeIntercept")}
    assert removed == {"intercept-2"}

    dispatch_event_to(conn, make_before_request_event(), "network.beforeRequestSent")
    assert seen == [("request", "https://example.com/api/data")]


def test_clear_request_handlers_preserves_response_handlers():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(lambda request: seen.append(("request", request.url)))
    network.add_response_handler(lambda response: seen.append(("response", response.url)))
    network.clear_request_handlers()

    # The request handler's intercept is removed; the response handler's stays.
    removed = {c["params"]["intercept"] for c in conn.commands_named("network.removeIntercept")}
    assert removed == {"intercept-1"}

    # The response registry resubscribed after the event-handler sweep and
    # still observes and reconciles responses.
    dispatch_event_to(conn, make_response_started_event(intercepts=("intercept-2",)), "network.responseStarted")
    assert seen == [("response", "https://example.com/api/data")]
    assert len(conn.commands_named("network.continueResponse")) == 1


def test_body_mutation_falls_back_to_continue_when_provide_response_unsupported():
    conn = FakeConnection(fail_methods=["network.provideResponse"])
    network = Network(conn)

    def mutate(response):
        response.set_headers({"x-modified": "true"})
        response.set_body("replacement body")

    network.add_response_handler(mutate)
    dispatch_event(conn, make_response_started_event())

    # provideResponse was attempted, failed, and the response was continued
    # with the remaining mutations instead of staying blocked.
    assert len(conn.commands_named("network.provideResponse")) == 1
    continues = conn.commands_named("network.continueResponse")
    assert len(continues) == 1
    assert continues[0]["params"]["headers"] == [{"name": "x-modified", "value": {"type": "string", "value": "true"}}]


def test_data_url_responses_are_not_continued():
    conn = FakeConnection()
    network = Network(conn)

    network.add_response_handler(lambda response: None)
    dispatch_event(conn, make_response_started_event(url="data:image/gif;base64,R0lGODlh"))

    assert conn.commands_named("network.continueResponse") == []


def test_authentication_request_parses_event_properties():
    request = AuthenticationRequest(FakeConnection(), make_auth_required_event())

    assert request.url == "https://secure.example.com/api/data"
    assert request.realm == "secure-area"
    assert request.scheme == "basic"
    assert request.challenges == [{"scheme": "basic", "realm": "secure-area"}]


def test_auth_observer_continues_with_default():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_authentication_handler(lambda auth: seen.append((auth.url, auth.realm)))
    dispatch_event(conn, make_auth_required_event())

    assert seen == [("https://secure.example.com/api/data", "secure-area")]
    continues = conn.commands_named("network.continueWithAuth")
    assert len(continues) == 1
    assert continues[0]["params"] == {"request": "req-1", "action": "default"}


def test_provide_credentials_sends_credentials():
    conn = FakeConnection()
    network = Network(conn)

    network.add_authentication_handler(lambda auth: auth.provide_credentials("user", "secret"))
    dispatch_event(conn, make_auth_required_event())

    continues = conn.commands_named("network.continueWithAuth")
    assert len(continues) == 1
    assert continues[0]["params"] == {
        "request": "req-1",
        "action": "provideCredentials",
        "credentials": {"type": "password", "username": "user", "password": "secret"},
    }


def test_cancel_sends_cancel_action():
    conn = FakeConnection()
    network = Network(conn)

    network.add_authentication_handler(lambda auth: auth.cancel())
    dispatch_event(conn, make_auth_required_event())

    continues = conn.commands_named("network.continueWithAuth")
    assert len(continues) == 1
    assert continues[0]["params"] == {"request": "req-1", "action": "cancel"}


def test_cancel_takes_precedence_over_credentials():
    conn = FakeConnection()
    network = Network(conn)

    network.add_authentication_handler(lambda auth: auth.provide_credentials("user", "secret"))
    network.add_authentication_handler(lambda auth: auth.cancel())
    dispatch_event(conn, make_auth_required_event(intercepts=("intercept-1", "intercept-2")))

    continues = conn.commands_named("network.continueWithAuth")
    assert len(continues) == 1
    assert continues[0]["params"] == {"request": "req-1", "action": "cancel"}


def test_first_provided_credentials_win():
    conn = FakeConnection()
    network = Network(conn)

    network.add_authentication_handler(lambda auth: auth.provide_credentials("first", "pw1"))
    network.add_authentication_handler(lambda auth: auth.provide_credentials("second", "pw2"))
    dispatch_event(conn, make_auth_required_event(intercepts=("intercept-1", "intercept-2")))

    continues = conn.commands_named("network.continueWithAuth")
    assert len(continues) == 1
    assert continues[0]["params"]["credentials"]["username"] == "first"


def test_auth_handler_exception_still_continues_with_default():
    conn = FakeConnection()
    network = Network(conn)

    def broken(auth):
        raise RuntimeError("boom")

    network.add_authentication_handler(broken)
    dispatch_event(conn, make_auth_required_event())

    continues = conn.commands_named("network.continueWithAuth")
    assert len(continues) == 1
    assert continues[0]["params"]["action"] == "default"


def test_auth_glob_patterns_filter_callbacks():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_authentication_handler(["https://secure.example.com/**"], lambda auth: seen.append("secure"))
    network.add_authentication_handler(["https://other.example.com/**"], lambda auth: seen.append("other"))
    dispatch_event(conn, make_auth_required_event(intercepts=("intercept-1", "intercept-2")))

    assert seen == ["secure"]
    assert len(conn.commands_named("network.continueWithAuth")) == 1


def test_auth_intercept_uses_auth_required_phase():
    conn = FakeConnection()
    network = Network(conn)

    network.add_authentication_handler(["https://secure.example.com/**"], lambda auth: None)

    params = conn.commands_named("network.addIntercept")[0]["params"]
    assert params["phases"] == ["authRequired"]
    assert params["urlPatterns"] == [{"type": "pattern", "protocol": "https", "hostname": "secure.example.com"}]


def test_blocked_auth_event_owned_by_another_intercept_is_left_alone():
    conn = FakeConnection()
    network = Network(conn)

    network.add_authentication_handler(lambda auth: None)
    dispatch_event(conn, make_auth_required_event(intercepts=("foreign-intercept",)))

    assert conn.commands_named("network.continueWithAuth") == []


def test_add_authentication_handler_requires_callable():
    network = Network(FakeConnection())

    with pytest.raises(TypeError, match="callable"):
        network.add_authentication_handler(["**/api/**"], "not-a-callback")


def test_remove_authentication_handler_removes_intercept_and_subscription():
    conn = FakeConnection()
    network = Network(conn)

    handler_id = network.add_authentication_handler(lambda auth: None)
    network.remove_authentication_handler(handler_id)

    assert conn.commands_named("network.removeIntercept") == [
        {"method": "network.removeIntercept", "params": {"intercept": "intercept-1"}}
    ]
    assert conn.commands_named("session.unsubscribe") == [
        {"method": "session.unsubscribe", "params": {"subscriptions": ["subscription-1"]}}
    ]
    with pytest.raises(ValueError, match=r"Authentication handler .* not found"):
        network.remove_authentication_handler(handler_id)


def test_clear_authentication_handlers_clears_only_authentication_handlers():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(lambda request: seen.append(("request", request.url)))
    network.add_authentication_handler(lambda auth: seen.append(("auth", auth.url)))
    network.clear_authentication_handlers()

    # Only the authentication handler's intercept (intercept-2) is removed.
    removed = {c["params"]["intercept"] for c in conn.commands_named("network.removeIntercept")}
    assert removed == {"intercept-2"}

    dispatch_event_to(conn, make_before_request_event(), "network.beforeRequestSent")
    assert seen == [("request", "https://example.com/api/data")]


def test_clear_request_handlers_preserves_authentication_handlers():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(lambda request: seen.append(("request", request.url)))
    network.add_authentication_handler(lambda auth: seen.append(("auth", auth.url)))
    network.clear_request_handlers()

    # The request handler's intercept is removed; the auth handler's stays.
    removed = {c["params"]["intercept"] for c in conn.commands_named("network.removeIntercept")}
    assert removed == {"intercept-1"}

    # The auth registry resubscribed after the event-handler sweep and still
    # observes and reconciles challenges.
    dispatch_event_to(conn, make_auth_required_event(intercepts=("intercept-2",)), "network.authRequired")
    assert seen == [("auth", "https://secure.example.com/api/data")]
    assert len(conn.commands_named("network.continueWithAuth")) == 1


def test_add_extra_header_injects_into_continued_requests():
    conn = FakeConnection()
    network = Network(conn)

    network.add_extra_header("x-test", "value")
    dispatch_event(conn, make_before_request_event())

    intercept_params = conn.commands_named("network.addIntercept")[0]["params"]
    assert intercept_params == {"phases": ["beforeRequestSent"]}
    continues = conn.commands_named("network.continueRequest")
    assert len(continues) == 1
    assert continues[0]["params"]["headers"] == [
        {"name": "accept", "value": {"type": "string", "value": "*/*"}},
        {"name": "x-test", "value": {"type": "string", "value": "value"}},
    ]


def test_extra_header_replaces_existing_header_case_insensitively():
    conn = FakeConnection()
    network = Network(conn)

    network.add_extra_header("Accept", "application/json")
    dispatch_event(conn, make_before_request_event())

    continues = conn.commands_named("network.continueRequest")
    assert len(continues) == 1
    assert continues[0]["params"]["headers"] == [
        {"name": "accept", "value": {"type": "string", "value": "application/json"}}
    ]


def test_extra_headers_compose_with_request_handlers_in_one_continue():
    conn = FakeConnection()
    network = Network(conn)

    network.add_extra_header("x-test", "value")
    network.add_request_handler(lambda request: request.set_method("POST"))
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1", "intercept-2")))

    continues = conn.commands_named("network.continueRequest")
    assert len(continues) == 1
    assert continues[0]["params"]["method"] == "POST"
    assert {"name": "x-test", "value": {"type": "string", "value": "value"}} in continues[0]["params"]["headers"]


def test_extra_headers_not_applied_to_failed_requests():
    conn = FakeConnection()
    network = Network(conn)

    network.add_extra_header("x-test", "value")
    network.add_request_handler(lambda request: request.fail())
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1", "intercept-2")))

    assert conn.commands_named("network.continueRequest") == []
    assert len(conn.commands_named("network.failRequest")) == 1


def test_extra_headers_not_applied_to_stubbed_responses():
    conn = FakeConnection()
    network = Network(conn)

    network.add_extra_header("x-test", "value")
    network.add_request_handler(lambda request: request.provide_response(204, {"x-stub": "true"}))
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1", "intercept-2")))

    assert conn.commands_named("network.continueRequest") == []
    provides = conn.commands_named("network.provideResponse")
    assert len(provides) == 1
    assert provides[0]["params"]["headers"] == [{"name": "x-stub", "value": {"type": "string", "value": "true"}}]


def test_remove_extra_header_stops_injection_and_removes_intercept():
    conn = FakeConnection()
    network = Network(conn)

    network.add_extra_header("x-test", "value")
    network.remove_extra_header("X-Test")

    assert conn.commands_named("network.removeIntercept") == [
        {"method": "network.removeIntercept", "params": {"intercept": "intercept-1"}}
    ]
    assert conn.commands_named("session.unsubscribe") == [
        {"method": "session.unsubscribe", "params": {"subscriptions": ["subscription-1"]}}
    ]
    with pytest.raises(ValueError, match=r"Extra header .* not found"):
        network.remove_extra_header("x-test")


def test_clear_extra_headers_removes_intercept():
    conn = FakeConnection()
    network = Network(conn)

    network.add_extra_header("x-one", "1")
    network.add_extra_header("x-two", "2")
    network.clear_extra_headers()

    removed = {c["params"]["intercept"] for c in conn.commands_named("network.removeIntercept")}
    assert removed == {"intercept-1"}
    assert network.intercepts == []


def test_clear_request_handlers_preserves_extra_headers():
    conn = FakeConnection()
    network = Network(conn)

    network.add_extra_header("x-test", "value")
    network.add_request_handler(lambda request: None)
    network.clear_request_handlers()

    # The user handler's intercept is removed; the extra-headers one stays.
    removed = {c["params"]["intercept"] for c in conn.commands_named("network.removeIntercept")}
    assert removed == {"intercept-2"}

    # The registry resubscribed after the event-handler sweep and still
    # merges the extra headers into continued requests.
    dispatch_event_to(conn, make_before_request_event(), "network.beforeRequestSent")
    continues = conn.commands_named("network.continueRequest")
    assert len(continues) == 1
    assert {"name": "x-test", "value": {"type": "string", "value": "value"}} in continues[0]["params"]["headers"]


def test_glob_to_regex_matching():
    assert glob_to_regex("**/analytics/**").match("https://example.com/analytics/track")
    assert not glob_to_regex("**/analytics/**").match("https://example.com/api/data")
    assert glob_to_regex("https://*.tracking.com/**").match("https://a.tracking.com/x/y")
    assert not glob_to_regex("https://*.tracking.com/**").match("https://tracking.com/x")
    assert glob_to_regex("https://example.com/file?.js").match("https://example.com/file1.js")
    assert not glob_to_regex("https://example.com/file?.js").match("https://example.com/file12.js")


def test_glob_to_url_pattern_translation():
    assert glob_to_url_pattern("**") == {}
    assert glob_to_url_pattern("**/analytics/**") is None
    # Wildcard-bearing components are omitted: UrlPatternPattern properties
    # match literally and browsers reject wildcard characters in them.
    assert glob_to_url_pattern("https://api.example.com/*") == {
        "type": "pattern",
        "protocol": "https",
        "hostname": "api.example.com",
    }
    assert glob_to_url_pattern("https://example.com:8080/**") == {
        "type": "pattern",
        "protocol": "https",
        "hostname": "example.com",
        "port": "8080",
    }
    assert glob_to_url_pattern("https://example.com/login") == {
        "type": "pattern",
        "protocol": "https",
        "hostname": "example.com",
        "pathname": "/login",
    }
    assert glob_to_url_pattern("https://*.example.com/**") == {"type": "pattern", "protocol": "https"}
    assert glob_to_url_pattern("**://**/**") == {}


def test_globs_to_url_patterns_falls_back_when_any_pattern_is_untranslatable():
    assert globs_to_url_patterns(["https://api.example.com/*", "**/analytics/**"]) is None
    assert globs_to_url_patterns(None) is None
    raw = {"type": "string", "pattern": "https://example.com/"}
    assert globs_to_url_patterns([raw]) == [raw]
