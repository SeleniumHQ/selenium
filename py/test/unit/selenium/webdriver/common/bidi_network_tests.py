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

from selenium.webdriver.common.bidi._network_handlers import normalize_url_patterns
from selenium.webdriver.common.bidi.network import (
    AlreadySettledError,
    AuthenticationRequest,
    HandlerHandle,
    Network,
    Request,
    Response,
)


class FakeConnection:
    def __init__(self, fail_methods=()):
        self.commands = []
        self.added_callbacks = []
        self.removed_callbacks = []
        self.fail_methods = set(fail_methods)
        self._next_callback_id = 1
        self._next_intercept_id = 1
        self._next_collector_id = 1

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
        elif payload["method"] == "network.addDataCollector":
            response = {"collector": f"collector-{self._next_collector_id}"}
            self._next_collector_id += 1
        elif payload["method"] == "network.getData":
            response = {"bytes": {"type": "string", "value": "collected body"}}
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


class FakeDriver:
    """Just enough driver for the default window-handle scope."""

    def __init__(self, current_window_handle="window-1"):
        self.current_window_handle = current_window_handle


def make_before_request_event(
    url="https://example.com/api/data",
    request_id="req-1",
    intercepts=("intercept-1",),
    blocked=True,
    context="ctx-1",
    user_context="default",
    method="GET",
    body_size=0,
):
    return {
        "context": context,
        "userContext": user_context,
        "isBlocked": blocked,
        "intercepts": list(intercepts),
        "redirectCount": 0,
        "request": {
            "request": request_id,
            "url": url,
            "method": method,
            "headers": [{"name": "accept", "value": {"type": "string", "value": "*/*"}}],
            "cookies": [{"name": "sid", "value": {"type": "string", "value": "abc"}, "domain": "example.com"}],
            "destination": "document",
            "bodySize": body_size,
        },
        "timestamp": 1,
    }


def make_response_started_event(
    url="https://example.com/api/data",
    request_id="req-1",
    intercepts=("intercept-1",),
    blocked=True,
    status=200,
    context="ctx-1",
    user_context="default",
):
    return {
        "context": context,
        "userContext": user_context,
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
    context="ctx-1",
    user_context="default",
):
    return {
        "context": context,
        "userContext": user_context,
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


# --------------------------------------------------------------------------
# Registration, removal and clearing (decision 1)
# --------------------------------------------------------------------------


def test_add_handler_returns_a_handle_object():
    conn = FakeConnection()
    network = Network(conn)

    handle = network.add_request_handler(lambda request: None)

    assert isinstance(handle, HandlerHandle)
    assert handle.family == "request handler"
    # Handles stay usable wherever the plain string IDs used to be.
    assert handle == "request-handler-1"


def test_remove_high_level_handler_removes_intercept_and_subscription():
    conn = FakeConnection()
    network = Network(conn)

    handle = network.add_request_handler(lambda request: None)
    network.remove_request_handler(handle)

    assert conn.commands_named("network.removeIntercept") == [
        {"method": "network.removeIntercept", "params": {"intercept": "intercept-1"}}
    ]
    assert conn.commands_named("session.unsubscribe") == [
        {"method": "session.unsubscribe", "params": {"subscriptions": ["subscription-1"]}}
    ]
    with pytest.raises(ValueError, match="not found"):
        network.remove_request_handler(handle)


def test_removed_handler_is_not_consulted_for_later_events():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    handle = network.add_request_handler(lambda request: seen.append(request.url))
    network.remove_request_handler(handle)
    network.add_request_handler(lambda request: seen.append("survivor"))
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1", "intercept-2")))

    assert seen == ["survivor"]


def test_clear_request_handlers_clears_high_level_handlers():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(lambda request: None)
    network.add_request_handler([{"hostname": "api.example.com"}], lambda request: None)
    network.clear_request_handlers()

    removed = {c["params"]["intercept"] for c in conn.commands_named("network.removeIntercept")}
    assert removed == {"intercept-1", "intercept-2"}
    assert len(conn.commands_named("session.unsubscribe")) == 1


def test_add_authentication_registers_in_the_authentication_family():
    conn = FakeConnection()
    network = Network(conn)

    handle = network.add_authentication("user", "secret")
    dispatch_event(conn, make_auth_required_event())

    assert isinstance(handle, HandlerHandle)
    assert handle.family == "authentication handler"
    continues = conn.commands_named("network.continueWithAuth")
    assert continues[0]["params"] == {
        "request": "req-1",
        "action": "provideCredentials",
        "credentials": {"type": "password", "username": "user", "password": "secret"},
    }

    # It is removed and cleared like the rest of the family.
    network.remove_authentication_handler(handle)
    assert conn.commands_named("network.removeIntercept")[0]["params"]["intercept"] == "intercept-1"


def test_add_authentication_is_cleared_with_the_family():
    conn = FakeConnection()
    network = Network(conn)

    network.add_authentication("user", "secret")
    network.clear_authentication_handlers()

    assert conn.commands_named("network.removeIntercept") == [
        {"method": "network.removeIntercept", "params": {"intercept": "intercept-1"}}
    ]


# --------------------------------------------------------------------------
# URL patterns are the remote's business (decision 2)
# --------------------------------------------------------------------------


def test_pattern_string_is_forwarded_verbatim():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler("https://api.example.com/orders", lambda request: None)

    params = conn.commands_named("network.addIntercept")[0]["params"]
    assert params["urlPatterns"] == [{"type": "string", "pattern": "https://api.example.com/orders"}]


def test_component_mapping_is_sent_as_a_pattern():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler([{"protocol": "https", "hostname": "api.tracking.com"}], lambda request: None)

    params = conn.commands_named("network.addIntercept")[0]["params"]
    assert params["urlPatterns"] == [{"type": "pattern", "protocol": "https", "hostname": "api.tracking.com"}]


def test_patterns_may_mix_strings_and_component_mappings():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(
        ["https://api.example.com/orders", {"hostname": "cdn.example.com"}],
        lambda request: None,
    )

    params = conn.commands_named("network.addIntercept")[0]["params"]
    assert params["urlPatterns"] == [
        {"type": "string", "pattern": "https://api.example.com/orders"},
        {"type": "pattern", "hostname": "cdn.example.com"},
    ]


def test_glob_looking_pattern_is_forwarded_rather_than_expanded():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler("https://*.example.com/", lambda request: None)

    params = conn.commands_named("network.addIntercept")[0]["params"]
    assert params["urlPatterns"] == [{"type": "string", "pattern": "https://*.example.com/"}]


def test_url_patterns_keyword_scopes_callback_handler():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(
        callback=lambda request: None,
        url_patterns=[{"hostname": "api.tracking.com"}],
    )

    params = conn.commands_named("network.addIntercept")[0]["params"]
    assert params["urlPatterns"] == [{"type": "pattern", "hostname": "api.tracking.com"}]


def test_no_patterns_means_match_everything():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(lambda request: None)

    assert "urlPatterns" not in conn.commands_named("network.addIntercept")[0]["params"]


def test_normalize_url_patterns_accepts_supported_forms():
    assert normalize_url_patterns(None) is None
    assert normalize_url_patterns("https://example.com/") == [{"type": "string", "pattern": "https://example.com/"}]
    assert normalize_url_patterns({"hostname": "example.com", "port": "8080"}) == [
        {"type": "pattern", "hostname": "example.com", "port": "8080"}
    ]
    # An already wire-shaped pattern passes through.
    assert normalize_url_patterns([{"type": "string", "pattern": "https://example.com/"}]) == [
        {"type": "string", "pattern": "https://example.com/"}
    ]


def test_normalize_url_patterns_accepts_a_parsed_url():
    from urllib.parse import urlparse

    assert normalize_url_patterns(urlparse("https://example.com/orders")) == [
        {"type": "string", "pattern": "https://example.com/orders"}
    ]


def test_invalid_url_pattern_errors_before_anything_is_sent():
    conn = FakeConnection()
    network = Network(conn)

    with pytest.raises(ValueError, match="Unsupported URL pattern component"):
        network.add_request_handler([{"host": "example.com"}], lambda request: None)
    with pytest.raises(ValueError, match="must not be empty"):
        network.add_request_handler(callback=lambda request: None, url_patterns="")
    with pytest.raises(ValueError, match="must be a string"):
        network.add_request_handler([{"port": 8080}], lambda request: None)
    with pytest.raises(TypeError, match="must be a string or a mapping"):
        network.add_request_handler([42], lambda request: None)

    assert conn.commands == []


def test_handler_is_consulted_only_when_its_own_intercept_blocked_the_event():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler([{"hostname": "analytics.example.com"}], lambda request: seen.append("analytics"))
    network.add_request_handler([{"hostname": "api.example.com"}], lambda request: seen.append("api"))

    # The remote blocked this one on the analytics intercept's behalf only.
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1",)))

    assert seen == ["analytics"]
    # The event is still resolved exactly once, by the registry that owns it.
    assert len(conn.commands_named("network.continueRequest")) == 1


def test_blocked_event_owned_by_another_intercept_is_left_alone():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(lambda request: None)
    dispatch_event(conn, make_before_request_event(intercepts=("foreign-intercept",)))

    assert conn.commands_named("network.continueRequest") == []


# --------------------------------------------------------------------------
# Dispositions, ordering and defaults (decisions 4, 5 and 6)
# --------------------------------------------------------------------------


def test_high_level_observer_auto_continues():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(lambda request: seen.append(request.url))
    dispatch_event(conn, make_before_request_event())

    assert seen == ["https://example.com/api/data"]
    continues = conn.commands_named("network.continueRequest")
    assert len(continues) == 1
    assert continues[0]["params"] == {"request": "req-1"}


def test_later_registered_handlers_are_consulted_first():
    conn = FakeConnection()
    network = Network(conn)
    order = []

    network.add_request_handler(lambda request: order.append("first"))
    network.add_request_handler(lambda request: order.append("second"))
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1", "intercept-2")))

    assert order == ["second", "first"]


def test_later_registered_handler_overrides_an_earlier_one():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(lambda request: request.add_header("x-test", "true"))
    network.add_request_handler(lambda request: request.remove_header("x-test"))
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1", "intercept-2")))

    # LIFO means the removal runs before the header is added, so it survives.
    params = conn.commands_named("network.continueRequest")[0]["params"]
    assert {"name": "x-test", "value": {"type": "string", "value": "true"}} in params["headers"]


def test_first_handler_to_settle_stops_the_chain():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(lambda request: seen.append("never runs"))
    network.add_request_handler(lambda request: request.fail())
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1", "intercept-2")))

    assert seen == []
    assert conn.commands_named("network.failRequest") == [
        {"method": "network.failRequest", "params": {"request": "req-1"}}
    ]
    assert conn.commands_named("network.continueRequest") == []
    assert conn.commands_named("network.provideResponse") == []


def test_submit_short_circuits_a_handler_registered_earlier():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(lambda request: seen.append("shared default"))
    network.add_request_handler(lambda request: request.submit(method="PUT"))
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1", "intercept-2")))

    assert seen == []
    continues = conn.commands_named("network.continueRequest")
    assert len(continues) == 1
    assert continues[0]["params"]["method"] == "PUT"


def test_settling_twice_in_one_handler_raises():
    conn = FakeConnection()
    params = {"request": {"url": "https://example.com/api", "request": "req-1"}}
    request = Request(conn, params, deferred=True)

    request.fail()
    with pytest.raises(AlreadySettledError, match="already settled with 'fail'"):
        request.submit()


def test_staging_a_mutation_does_not_settle():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(lambda request: seen.append(dict(request.headers)))
    network.add_request_handler(lambda request: request.add_header("x-test", "true"))
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1", "intercept-2")))

    # The staging handler ran first and passed the request on with its change.
    assert seen == [{"accept": "*/*", "x-test": "true"}]
    params = conn.commands_named("network.continueRequest")[0]["params"]
    assert {"name": "x-test", "value": {"type": "string", "value": "true"}} in params["headers"]


def test_respond_serializes_stub():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(
        lambda request: request.respond(200, {"content-type": "application/json"}, '{"message": "stubbed"}')
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
        request.add_header("authorization", "Bearer token123")
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


def test_submit_translates_explicit_args_to_wire_format():
    conn = FakeConnection()
    params = {"request": {"url": "https://example.com/api", "request": "request-id-3"}}
    request = Request(conn, params)

    request.submit(
        url="https://example.com/redirected",
        method="POST",
        headers={"x-test": "1"},
        cookies=[{"name": "sid", "value": "abc"}],
        body="payload",
    )

    sent = conn.commands_named("network.continueRequest")[0]["params"]
    assert sent["url"] == "https://example.com/redirected"
    assert sent["method"] == "POST"
    assert sent["headers"] == [{"name": "x-test", "value": {"type": "string", "value": "1"}}]
    assert sent["cookies"] == [{"name": "sid", "value": {"type": "string", "value": "abc"}}]
    assert sent["body"] == {"type": "string", "value": "payload"}


def test_submit_args_override_staged_mutations():
    conn = FakeConnection()
    params = {"request": {"url": "https://example.com/api", "request": "request-id-4"}}
    request = Request(conn, params)

    # A staged mutation on a different field must survive when only one field
    # is overridden by a keyword argument.
    request.set_url("https://example.com/recorded")
    request.set_method("GET")
    request.submit(method="DELETE")

    sent = conn.commands_named("network.continueRequest")[0]["params"]
    assert sent["method"] == "DELETE"
    assert sent["url"] == "https://example.com/recorded"


def test_submit_keeps_falsy_body_override():
    conn = FakeConnection()
    params = {"request": {"url": "https://example.com/api", "request": "request-id-6"}}
    request = Request(conn, params)

    # An empty-string body is a valid value, not "unset".
    request.submit(body="")

    sent = conn.commands_named("network.continueRequest")[0]["params"]
    assert sent["body"] == {"type": "string", "value": ""}


def test_submit_skips_data_urls():
    conn = FakeConnection()
    params = {"request": {"url": "data:image/gif;base64,R0lGODlh", "request": "request-id-1"}}
    request = Request(conn, params)

    request.submit()

    assert conn.commands == [], "network.continueRequest must not be sent for data: URLs"


def test_submit_sends_command_for_regular_urls():
    conn = FakeConnection()
    params = {"request": {"url": "https://example.com/style.css", "request": "request-id-2"}}
    request = Request(conn, params)

    request.submit()

    assert len(conn.commands) == 1
    assert conn.commands[0]["method"] == "network.continueRequest"
    assert conn.commands[0]["params"]["request"] == "request-id-2"


def test_data_url_requests_are_not_continued():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(lambda request: None)
    dispatch_event(conn, make_before_request_event(url="data:image/gif;base64,R0lGODlh"))

    assert conn.commands_named("network.continueRequest") == []


# --------------------------------------------------------------------------
# Handler faults (decision 7)
# --------------------------------------------------------------------------


def test_handler_exception_fails_the_request_and_surfaces_to_the_user():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    def broken(request):
        raise RuntimeError("boom")

    network.add_request_handler(lambda request: seen.append("never runs"))
    network.add_request_handler(broken)
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1", "intercept-2")))

    # The chain stopped, the request was failed on the wire, and nothing was sent.
    assert seen == []
    assert len(conn.commands_named("network.failRequest")) == 1
    assert conn.commands_named("network.continueRequest") == []

    # The exception is not swallowed: it surfaces at the next network call.
    with pytest.raises(RuntimeError, match="boom"):
        network.clear_request_handlers()


def test_handler_exception_is_recorded_before_the_request_is_failed():
    """The error must be recorded before the request is failed.

    Failing the request unblocks the browser, so the user's navigation can raise
    and call back into driver.network. Recording the error after that would race
    the very call meant to surface it (decision 7).
    """
    conn = FakeConnection()
    network = Network(conn)
    recorded_when_failed = []

    original_execute = conn.execute

    def spy(cmd):
        result = original_execute(cmd)
        if conn.commands[-1]["method"] == "network.failRequest":
            recorded_when_failed.append(list(getattr(network, "_handler_errors", []) or []))
        return result

    conn.execute = spy

    def broken(request):
        raise RuntimeError("boom")

    network.add_request_handler(broken)
    dispatch_event(conn, make_before_request_event())

    assert len(recorded_when_failed) == 1, "network.failRequest was not sent"
    assert [type(exc) for exc in recorded_when_failed[0]] == [RuntimeError], (
        "The handler's exception must already be recorded when the request is failed"
    )


def test_handler_exception_discards_staged_mutations():
    conn = FakeConnection()
    network = Network(conn)

    def stage_then_raise(request):
        request.add_header("x-test", "true")
        raise RuntimeError("boom")

    network.add_request_handler(stage_then_raise)
    dispatch_event(conn, make_before_request_event())

    assert conn.commands_named("network.continueRequest") == []
    assert conn.commands_named("network.failRequest") == [
        {"method": "network.failRequest", "params": {"request": "req-1"}}
    ]


def test_response_handler_exception_fails_the_response():
    conn = FakeConnection()
    network = Network(conn)

    def broken(response):
        raise RuntimeError("boom")

    network.add_response_handler(broken)
    dispatch_event(conn, make_response_started_event())

    assert conn.commands_named("network.continueResponse") == []
    assert len(conn.commands_named("network.failRequest")) == 1
    with pytest.raises(RuntimeError, match="boom"):
        network.clear_response_handlers()


def test_auth_handler_exception_cancels_the_challenge():
    conn = FakeConnection()
    network = Network(conn)

    def broken(auth):
        raise RuntimeError("boom")

    network.add_authentication_handler(broken)
    dispatch_event(conn, make_auth_required_event())

    continues = conn.commands_named("network.continueWithAuth")
    assert len(continues) == 1
    assert continues[0]["params"]["action"] == "cancel"
    with pytest.raises(RuntimeError, match="boom"):
        network.clear_authentication_handlers()


# --------------------------------------------------------------------------
# Return values and original values (decisions 8 and 9)
# --------------------------------------------------------------------------


def test_handler_return_value_is_ignored():
    conn = FakeConnection()
    network = Network(conn)

    network.add_request_handler(lambda request: "this value is ignored")
    dispatch_event(conn, make_before_request_event())

    continues = conn.commands_named("network.continueRequest")
    assert len(continues) == 1
    assert continues[0]["params"] == {"request": "req-1"}


def test_handler_can_read_the_original_event_value():
    conn = FakeConnection()
    network = Network(conn)
    seen = {}

    def inspect(request):
        seen["staged"] = dict(request.headers)
        seen["original"] = dict(request.original.headers)

    network.add_request_handler(inspect)
    network.add_request_handler(lambda request: request.add_header("x-test", "true"))
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1", "intercept-2")))

    assert seen["staged"] == {"accept": "*/*", "x-test": "true"}
    assert seen["original"] == {"accept": "*/*"}


def test_the_original_event_value_is_read_only():
    request = Request(FakeConnection(), make_before_request_event())

    with pytest.raises(AttributeError, match="read-only"):
        request.original.url = "https://elsewhere.example.com/"


def test_response_handler_can_read_the_original_event_value():
    response = Response(FakeConnection(), make_response_started_event())

    response.set_status(503)
    assert response.status == 503
    assert response.original.status == 200


# --------------------------------------------------------------------------
# Body collection (decision 10)
# --------------------------------------------------------------------------


def test_body_is_none_unless_the_handler_opted_in():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(lambda request: seen.append(request.body))
    dispatch_event(conn, make_before_request_event())

    assert seen == [None]
    assert conn.commands_named("network.addDataCollector") == []
    assert conn.commands_named("network.getData") == []


def test_collect_body_installs_a_collector_and_reads_the_body():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(lambda request: seen.append(request.body), collect_body=True)

    collectors = conn.commands_named("network.addDataCollector")
    assert len(collectors) == 1
    assert collectors[0]["params"]["dataTypes"] == ["request"]
    assert collectors[0]["params"]["maxEncodedDataSize"] > 0

    dispatch_event(conn, make_before_request_event(method="POST", body_size=14))

    assert seen == ["collected body"]
    get_data = conn.commands_named("network.getData")[0]["params"]
    assert get_data == {
        "dataType": "request",
        "collector": "collector-1",
        "disown": False,
        "request": "req-1",
    }


def test_collect_body_skips_the_fetch_for_a_bodyless_request():
    """A bodyless request must not ask the browser for a body.

    network.getData never answers for a body that will never arrive, and the
    request stays blocked until it times out.
    """
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_request_handler(lambda request: seen.append(request.body), collect_body=True)

    dispatch_event(conn, make_before_request_event(body_size=0))

    assert seen == [None]
    assert conn.commands_named("network.getData") == []


def test_removing_a_body_collecting_handler_removes_the_collector():
    conn = FakeConnection()
    network = Network(conn)

    handle = network.add_request_handler(lambda request: None, collect_body=True)
    network.remove_request_handler(handle)

    assert conn.commands_named("network.removeDataCollector") == [
        {"method": "network.removeDataCollector", "params": {"collector": "collector-1"}}
    ]


def test_response_handlers_cannot_collect_a_body():
    network = Network(FakeConnection())

    with pytest.raises(ValueError, match="only request bodies are collected"):
        network._response_handlers.add_handler(None, lambda response: None, collect_body=True)


# --------------------------------------------------------------------------
# Scoping (decision 11)
# --------------------------------------------------------------------------


def test_handlers_default_to_the_current_window_handle():
    conn = FakeConnection()
    network = Network(conn, FakeDriver("window-1"))

    network.add_request_handler(lambda request: None)

    params = conn.commands_named("network.addIntercept")[0]["params"]
    assert params["contexts"] == ["window-1"]


def test_a_window_handle_scopes_the_intercept():
    conn = FakeConnection()
    network = Network(conn, FakeDriver("window-1"))

    network.add_request_handler(lambda request: None, window_handle="other-tab")

    params = conn.commands_named("network.addIntercept")[0]["params"]
    assert params["contexts"] == ["other-tab"]


def test_a_user_context_scopes_the_handler_without_naming_contexts():
    conn = FakeConnection()
    network = Network(conn, FakeDriver("window-1"))
    seen = []

    network.add_request_handler(lambda request: seen.append(request.url), user_context="isolated")

    # network.addIntercept cannot express a user context, so the intercept is
    # not narrowed and the scope is applied when the event arrives.
    params = conn.commands_named("network.addIntercept")[0]["params"]
    assert "contexts" not in params

    dispatch_event(conn, make_before_request_event(user_context="default"))
    assert seen == []
    # An event outside the scope is still resolved rather than left blocked.
    assert len(conn.commands_named("network.continueRequest")) == 1

    dispatch_event(conn, make_before_request_event(user_context="isolated", request_id="req-2"))
    assert seen == ["https://example.com/api/data"]


def test_a_window_handle_and_a_user_context_together_are_rejected():
    conn = FakeConnection()
    network = Network(conn)

    with pytest.raises(ValueError, match="never both"):
        network.add_request_handler(lambda request: None, window_handle="w", user_context="u")

    assert conn.commands == []


def test_handlers_with_different_scopes_coexist():
    conn = FakeConnection()
    network = Network(conn, FakeDriver("window-1"))
    seen = []

    network.add_request_handler(lambda request: seen.append("broad"), user_context="isolated")
    network.add_request_handler(lambda request: seen.append("narrow"), user_context="other")
    dispatch_event(conn, make_before_request_event(intercepts=("intercept-1", "intercept-2"), user_context="isolated"))

    assert seen == ["broad"]


# --------------------------------------------------------------------------
# Responses
# --------------------------------------------------------------------------


def test_request_parses_event_properties():
    request = Request(FakeConnection(), make_before_request_event())

    assert request.url == "https://example.com/api/data"
    assert request.method == "GET"
    assert request.headers == {"accept": "*/*"}
    assert request.cookies[0]["name"] == "sid"
    assert request.cookies[0]["value"] == "abc"
    assert request.resource_type == "document"
    assert request.body is None


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

    network.add_response_handler(lambda response: seen.append((response.url, response.status)))
    dispatch_event(conn, make_response_started_event())

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
        response.add_header("x-modified", "true")
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


def test_response_submit_with_a_body_uses_provide_response():
    conn = FakeConnection()
    network = Network(conn)

    network.add_response_handler(lambda response: response.submit(body="replacement body"))
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


def test_response_submit_without_a_body_uses_continue_response():
    conn = FakeConnection()
    network = Network(conn)

    network.add_response_handler(lambda response: response.submit(status=503))
    dispatch_event(conn, make_response_started_event())

    assert conn.commands_named("network.provideResponse") == []
    continues = conn.commands_named("network.continueResponse")
    assert len(continues) == 1
    assert continues[0]["params"]["statusCode"] == 503


def test_response_body_mutation_uses_provide_response():
    conn = FakeConnection()
    network = Network(conn)

    network.add_response_handler(lambda response: response.set_body("replacement body"))
    dispatch_event(conn, make_response_started_event())

    provides = conn.commands_named("network.provideResponse")
    assert len(provides) == 1
    assert provides[0]["params"]["body"] == {"type": "string", "value": "replacement body"}
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


def test_response_fail_settles_the_event():
    conn = FakeConnection()
    network = Network(conn)

    network.add_response_handler(lambda response: response.fail())
    dispatch_event(conn, make_response_started_event())

    assert conn.commands_named("network.failRequest") == [
        {"method": "network.failRequest", "params": {"request": "req-1"}}
    ]
    assert conn.commands_named("network.continueResponse") == []


def test_later_response_handlers_see_earlier_mutations():
    conn = FakeConnection()
    network = Network(conn)
    seen = []

    network.add_response_handler(lambda response: seen.append(dict(response.headers)))
    network.add_response_handler(lambda response: response.set_headers({"x-first": "1"}))
    dispatch_event(conn, make_response_started_event(intercepts=("intercept-1", "intercept-2")))

    assert seen == [{"x-first": "1"}]
    assert len(conn.commands_named("network.continueResponse")) == 1


def test_blocked_response_owned_by_another_intercept_is_left_alone():
    conn = FakeConnection()
    network = Network(conn)

    network.add_response_handler(lambda response: None)
    dispatch_event(conn, make_response_started_event(intercepts=("foreign-intercept",)))

    assert conn.commands_named("network.continueResponse") == []


def test_add_response_handler_requires_callable():
    network = Network(FakeConnection())

    with pytest.raises(TypeError, match="callable"):
        network.add_response_handler([{"hostname": "example.com"}], "not-a-callback")


def test_remove_response_handler_removes_intercept_and_subscription():
    conn = FakeConnection()
    network = Network(conn)

    handle = network.add_response_handler(lambda response: None)
    network.remove_response_handler(handle)

    assert conn.commands_named("network.removeIntercept") == [
        {"method": "network.removeIntercept", "params": {"intercept": "intercept-1"}}
    ]
    assert conn.commands_named("session.unsubscribe") == [
        {"method": "session.unsubscribe", "params": {"subscriptions": ["subscription-1"]}}
    ]
    with pytest.raises(ValueError, match=r"Response handler .* not found"):
        network.remove_response_handler(handle)


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
    # still observes and resolves responses.
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


# --------------------------------------------------------------------------
# Authentication
# --------------------------------------------------------------------------


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


def test_authenticate_sends_credentials():
    conn = FakeConnection()
    network = Network(conn)

    network.add_authentication_handler(lambda auth: auth.authenticate("user", "secret"))
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


def test_the_last_registered_auth_handler_settles_the_challenge():
    conn = FakeConnection()
    network = Network(conn)

    network.add_authentication_handler(lambda auth: auth.authenticate("first", "pw1"))
    network.add_authentication_handler(lambda auth: auth.cancel())
    dispatch_event(conn, make_auth_required_event(intercepts=("intercept-1", "intercept-2")))

    continues = conn.commands_named("network.continueWithAuth")
    assert len(continues) == 1
    assert continues[0]["params"] == {"request": "req-1", "action": "cancel"}


def test_settling_an_auth_challenge_twice_raises():
    challenge = AuthenticationRequest(FakeConnection(), make_auth_required_event(), deferred=True)

    challenge.cancel()
    with pytest.raises(AlreadySettledError, match="already settled with 'cancel'"):
        challenge.authenticate("user", "secret")


def test_auth_intercept_uses_auth_required_phase():
    conn = FakeConnection()
    network = Network(conn)

    network.add_authentication_handler([{"hostname": "secure.example.com"}], lambda auth: None)

    params = conn.commands_named("network.addIntercept")[0]["params"]
    assert params["phases"] == ["authRequired"]
    assert params["urlPatterns"] == [{"type": "pattern", "hostname": "secure.example.com"}]


def test_blocked_auth_event_owned_by_another_intercept_is_left_alone():
    conn = FakeConnection()
    network = Network(conn)

    network.add_authentication_handler(lambda auth: None)
    dispatch_event(conn, make_auth_required_event(intercepts=("foreign-intercept",)))

    assert conn.commands_named("network.continueWithAuth") == []


def test_add_authentication_handler_requires_callable():
    network = Network(FakeConnection())

    with pytest.raises(TypeError, match="callable"):
        network.add_authentication_handler([{"hostname": "example.com"}], "not-a-callback")


def test_remove_authentication_handler_removes_intercept_and_subscription():
    conn = FakeConnection()
    network = Network(conn)

    handle = network.add_authentication_handler(lambda auth: None)
    network.remove_authentication_handler(handle)

    assert conn.commands_named("network.removeIntercept") == [
        {"method": "network.removeIntercept", "params": {"intercept": "intercept-1"}}
    ]
    assert conn.commands_named("session.unsubscribe") == [
        {"method": "session.unsubscribe", "params": {"subscriptions": ["subscription-1"]}}
    ]
    with pytest.raises(ValueError, match=r"Authentication handler .* not found"):
        network.remove_authentication_handler(handle)


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
    # observes and resolves challenges.
    dispatch_event_to(conn, make_auth_required_event(intercepts=("intercept-2",)), "network.authRequired")
    assert seen == [("auth", "https://secure.example.com/api/data")]
    assert len(conn.commands_named("network.continueWithAuth")) == 1


# --------------------------------------------------------------------------
# Extra headers
# --------------------------------------------------------------------------


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
    network.add_request_handler(lambda request: request.respond(204, {"x-stub": "true"}))
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


# --------------------------------------------------------------------------
# Deprecated surfaces
# --------------------------------------------------------------------------


def test_provide_response_is_a_deprecated_alias_for_respond():
    conn = FakeConnection()
    params = {"request": {"url": "https://example.com/api", "request": "req-1"}}
    request = Request(conn, params)

    with pytest.warns(DeprecationWarning, match="use respond instead"):
        request.provide_response(204)

    assert conn.commands_named("network.provideResponse")[0]["params"]["statusCode"] == 204


def test_continue_request_is_a_deprecated_alias_for_submit():
    conn = FakeConnection()
    params = {"request": {"url": "https://example.com/api", "request": "req-1"}}
    request = Request(conn, params)

    with pytest.warns(DeprecationWarning, match="use submit instead"):
        request.continue_request(method="POST")

    assert conn.commands_named("network.continueRequest")[0]["params"]["method"] == "POST"


def test_continue_response_is_a_deprecated_alias_for_submit():
    conn = FakeConnection()
    params = {"request": {"request": "req-1"}, "response": {"url": "https://example.com/api"}}
    response = Response(conn, params)

    with pytest.warns(DeprecationWarning, match="use submit instead"):
        response.continue_response(status=503, reason_phrase="Service Unavailable", headers={"x-test": "1"})

    sent = conn.commands_named("network.continueResponse")[0]["params"]
    assert sent["statusCode"] == 503
    assert sent["reasonPhrase"] == "Service Unavailable"
    assert sent["headers"] == [{"name": "x-test", "value": {"type": "string", "value": "1"}}]


def test_provide_credentials_is_a_deprecated_alias_for_authenticate():
    conn = FakeConnection()
    challenge = AuthenticationRequest(conn, make_auth_required_event())

    with pytest.warns(DeprecationWarning, match="use authenticate instead"):
        challenge.provide_credentials("user", "secret")

    assert conn.commands_named("network.continueWithAuth")[0]["params"]["action"] == "provideCredentials"


def test_add_auth_handler_is_deprecated():
    conn = FakeConnection()
    network = Network(conn)

    with pytest.warns(DeprecationWarning, match="use add_authentication instead"):
        network.add_auth_handler("user", "secret")


def test_phase_based_add_request_handler_is_deprecated_but_works():
    conn = FakeConnection()
    network = Network(conn)

    with pytest.warns(DeprecationWarning, match="phase-based"):
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

    with (
        pytest.warns(DeprecationWarning, match="phase-based"),
        pytest.raises(ValueError, match="Unsupported request handler event"),
    ):
        network.add_request_handler("response_started", lambda request: None)
