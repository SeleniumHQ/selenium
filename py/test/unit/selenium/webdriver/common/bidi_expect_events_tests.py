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

import threading

import pytest

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.bidi.browsing_context import BrowsingContext, Download
from selenium.webdriver.common.bidi.network import Network, Request, Response
from selenium.webdriver.common.bidi.script import ConsoleMessage, Script


class FakeConnection:
    """Mimics WebSocketConnection: callbacks receive ``event.from_json(params)``."""

    def __init__(self):
        self.commands = []
        self.added_callbacks = []
        self.removed_callbacks = []
        self._next_callback_id = 1

    def add_callback(self, event_wrapper, callback):
        callback_id = self._next_callback_id
        self._next_callback_id += 1

        def _dispatch(params):
            callback(event_wrapper.from_json(params))

        self.added_callbacks.append((callback_id, event_wrapper.event_class, _dispatch))
        return callback_id

    def remove_callback(self, event_wrapper, callback_id):
        self.removed_callbacks.append((callback_id, event_wrapper.event_class))

    def execute(self, cmd):
        payload = next(cmd)
        self.commands.append(payload)

        if payload["method"] == "session.subscribe":
            response = {"subscription": f"subscription-{len(self.commands)}"}
        else:
            response = {}

        try:
            cmd.send(response)
        except StopIteration as exc:
            return exc.value

        raise AssertionError("BiDi command generator did not finish")

    def commands_named(self, method):
        return [c for c in self.commands if c["method"] == method]


def dispatch_event_to(conn, event, bidi_event):
    """Invoke every subscribed callback for a BiDi event, as the WebSocket would."""
    callbacks = [callback for _, event_class, callback in conn.added_callbacks if event_class == bidi_event]
    assert callbacks, f"no event callback registered for {bidi_event}"
    for callback in callbacks:
        callback(event)


def make_before_request_event(url="https://example.com/api/data", method="GET"):
    return {
        "context": "ctx-1",
        "isBlocked": False,
        "redirectCount": 0,
        "request": {
            "request": "req-1",
            "url": url,
            "method": method,
            "headers": [{"name": "accept", "value": {"type": "string", "value": "*/*"}}],
            "cookies": [],
            "destination": "document",
        },
        "timestamp": 1,
    }


def make_response_completed_event(url="https://example.com/api/data", status=200):
    return {
        "context": "ctx-1",
        "isBlocked": False,
        "redirectCount": 0,
        "request": {
            "request": "req-1",
            "url": url,
            "method": "GET",
            "headers": [],
            "cookies": [],
        },
        "response": {
            "url": url,
            "status": status,
            "statusText": "OK",
            "headers": [{"name": "content-type", "value": {"type": "string", "value": "application/json"}}],
            "mimeType": "application/json",
        },
        "timestamp": 1,
    }


def make_console_log_entry(text="hello", level="info"):
    return {
        "type": "console",
        "method": "log",
        "level": level,
        "text": text,
        "args": [{"type": "string", "value": text}],
        "source": {"realm": "realm-1", "context": "ctx-1"},
        "timestamp": 1,
    }


def make_user_prompt_opened_event(message="Sure?", prompt_type="confirm"):
    return {
        "context": "ctx-1",
        "handler": "dismiss",
        "message": message,
        "type": prompt_type,
        "userContext": "default",
    }


def test_expect_request_captures_matching_request():
    conn = FakeConnection()
    network = Network(conn)

    with network.expect_request() as request_info:
        dispatch_event_to(conn, make_before_request_event(), "network.beforeRequestSent")

    request = request_info.value
    assert isinstance(request, Request)
    assert request.url == "https://example.com/api/data"
    assert request.method == "GET"


def test_expect_request_url_glob_skips_non_matching():
    conn = FakeConnection()
    network = Network(conn)

    with network.expect_request("**/api/**") as request_info:
        dispatch_event_to(
            conn, make_before_request_event(url="https://example.com/styles.css"), "network.beforeRequestSent"
        )
        dispatch_event_to(
            conn, make_before_request_event(url="https://example.com/api/users"), "network.beforeRequestSent"
        )

    assert request_info.value.url == "https://example.com/api/users"


def test_expect_request_predicate_filters():
    conn = FakeConnection()
    network = Network(conn)

    with network.expect_request(lambda request: request.method == "POST") as request_info:
        dispatch_event_to(conn, make_before_request_event(method="GET"), "network.beforeRequestSent")
        dispatch_event_to(conn, make_before_request_event(method="POST"), "network.beforeRequestSent")

    assert request_info.value.method == "POST"


def test_expect_response_captures_completed_response():
    conn = FakeConnection()
    network = Network(conn)

    with network.expect_response("**/api/**") as response_info:
        dispatch_event_to(conn, make_response_completed_event(status=201), "network.responseCompleted")

    response = response_info.value
    assert isinstance(response, Response)
    assert response.status == 201
    assert response.mime_type == "application/json"


def test_expect_request_subscribes_before_action():
    conn = FakeConnection()
    network = Network(conn)

    subscription = network.expect_request()
    assert any(event_class == "network.beforeRequestSent" for _, event_class, _ in conn.added_callbacks)
    assert conn.commands_named("session.subscribe")
    subscription.cancel()


def test_wait_times_out_without_event():
    conn = FakeConnection()
    network = Network(conn)

    subscription = network.expect_request(timeout=0.05)
    with pytest.raises(TimeoutException):
        subscription.wait()
    subscription.cancel()


def test_with_block_raises_timeout_on_exit():
    conn = FakeConnection()
    network = Network(conn)

    with pytest.raises(TimeoutException):
        with network.expect_request(timeout=0.05):
            pass


def test_capture_unsubscribes_handler():
    conn = FakeConnection()
    network = Network(conn)

    with network.expect_request() as request_info:
        dispatch_event_to(conn, make_before_request_event(), "network.beforeRequestSent")

    assert request_info.value is not None
    assert any(event_class == "network.beforeRequestSent" for _, event_class in conn.removed_callbacks)
    assert conn.commands_named("session.unsubscribe")


def test_cancel_unsubscribes_without_waiting():
    conn = FakeConnection()
    network = Network(conn)

    subscription = network.expect_request()
    subscription.cancel()

    assert any(event_class == "network.beforeRequestSent" for _, event_class in conn.removed_callbacks)
    assert conn.commands_named("session.unsubscribe")


def test_value_is_cached_after_capture():
    conn = FakeConnection()
    network = Network(conn)

    with network.expect_request() as request_info:
        dispatch_event_to(conn, make_before_request_event(), "network.beforeRequestSent")

    assert request_info.value is request_info.value


def test_exception_in_with_block_detaches_and_propagates():
    conn = FakeConnection()
    network = Network(conn)

    with pytest.raises(RuntimeError, match="boom"):
        with network.expect_request():
            raise RuntimeError("boom")

    assert any(event_class == "network.beforeRequestSent" for _, event_class in conn.removed_callbacks)


def test_events_after_capture_are_dropped():
    conn = FakeConnection()
    network = Network(conn)

    with network.expect_request() as request_info:
        dispatch_event_to(conn, make_before_request_event(url="https://example.com/first"), "network.beforeRequestSent")

    # The fake connection does not actually remove callbacks, so a late event
    # still reaches the subscription; the detached guard must drop it.
    dispatch_event_to(conn, make_before_request_event(url="https://example.com/late"), "network.beforeRequestSent")
    assert request_info.value.url == "https://example.com/first"


def test_wait_blocks_until_event_from_other_thread():
    conn = FakeConnection()
    network = Network(conn)

    subscription = network.expect_request()
    timer = threading.Timer(
        0.05, dispatch_event_to, args=(conn, make_before_request_event(), "network.beforeRequestSent")
    )
    timer.start()
    try:
        assert subscription.wait(timeout=2).url == "https://example.com/api/data"
    finally:
        timer.join()


def test_expect_console_message_captures_message():
    conn = FakeConnection()
    script = Script(conn)

    with script.expect_console_message() as message_info:
        dispatch_event_to(conn, make_console_log_entry(text="ready"), "log.entryAdded")

    message = message_info.value
    assert isinstance(message, ConsoleMessage)
    assert message.text == "ready"


def test_expect_console_message_predicate_filters():
    conn = FakeConnection()
    script = Script(conn)

    with script.expect_console_message(lambda message: message.level == "error") as message_info:
        dispatch_event_to(conn, make_console_log_entry(text="noise", level="info"), "log.entryAdded")
        dispatch_event_to(conn, make_console_log_entry(text="boom", level="error"), "log.entryAdded")

    assert message_info.value.text == "boom"


def test_expect_user_prompt_captures_typed_params():
    conn = FakeConnection()
    browsing_context = BrowsingContext(conn)

    with browsing_context.expect_user_prompt() as prompt_info:
        dispatch_event_to(conn, make_user_prompt_opened_event(), "browsingContext.userPromptOpened")

    prompt = prompt_info.value
    assert prompt.message == "Sure?"
    assert prompt.type == "confirm"
    assert prompt.context == "ctx-1"


def test_expect_download_correlates_begin_and_end(tmp_path):
    downloaded = tmp_path / "report.csv"
    downloaded.write_text("a,b\n1,2\n")

    conn = FakeConnection()
    browsing_context = BrowsingContext(conn)

    with browsing_context.expect_download() as download_info:
        dispatch_event_to(
            conn,
            {
                "context": "ctx-1",
                "navigation": "nav-1",
                "suggestedFilename": "report.csv",
                "url": "https://example.com/report",
            },
            "browsingContext.downloadWillBegin",
        )
        dispatch_event_to(
            conn,
            {
                "context": "ctx-1",
                "navigation": "nav-1",
                "status": "complete",
                "url": "https://example.com/report",
                "filepath": str(downloaded),
            },
            "browsingContext.downloadEnd",
        )

    download = download_info.value
    assert isinstance(download, Download)
    assert download.suggested_filename == "report.csv"
    assert download.failure() is None
    assert download.path() == downloaded

    saved = download.save_as(tmp_path / "saved.csv")
    assert (tmp_path / "saved.csv").read_text() == "a,b\n1,2\n"
    assert str(saved).endswith("saved.csv")


def test_expect_download_removes_both_handlers_after_capture():
    conn = FakeConnection()
    browsing_context = BrowsingContext(conn)

    with browsing_context.expect_download() as download_info:
        dispatch_event_to(
            conn,
            {"context": "ctx-1", "navigation": "nav-1", "status": "canceled", "url": "https://example.com/report"},
            "browsingContext.downloadEnd",
        )

    download = download_info.value
    assert download.failure() == "canceled"
    # No downloadWillBegin was dispatched, so there is no suggested filename.
    assert download.suggested_filename is None
    removed_events = [event_class for _, event_class in conn.removed_callbacks]
    assert "browsingContext.downloadEnd" in removed_events
    assert "browsingContext.downloadWillBegin" in removed_events


def test_download_save_as_without_file_raises():
    download = Download(status="canceled")
    assert download.failure() == "canceled"
    assert download.path() is None
    with pytest.raises(ValueError, match="no file on disk"):
        download.save_as("/tmp/nope")


def test_wait_with_zero_timeout_returns_queued_event():
    conn = FakeConnection()
    network = Network(conn)

    subscription = network.expect_request()
    dispatch_event_to(conn, make_before_request_event(), "network.beforeRequestSent")

    assert subscription.wait(timeout=0).url == "https://example.com/api/data"


def test_wait_with_zero_timeout_raises_immediately_without_event():
    conn = FakeConnection()
    network = Network(conn)

    subscription = network.expect_request()
    with pytest.raises(TimeoutException):
        subscription.wait(timeout=0)
    subscription.cancel()


def test_predicate_exception_drops_event_and_keeps_listening():
    conn = FakeConnection()
    network = Network(conn)

    def explosive_predicate(request):
        if request.url.endswith("boom"):
            raise RuntimeError("predicate blew up")
        return True

    with network.expect_request(explosive_predicate) as request_info:
        dispatch_event_to(conn, make_before_request_event(url="https://example.com/boom"), "network.beforeRequestSent")
        dispatch_event_to(conn, make_before_request_event(url="https://example.com/fine"), "network.beforeRequestSent")

    assert request_info.value.url == "https://example.com/fine"


def test_cancel_is_idempotent():
    conn = FakeConnection()
    network = Network(conn)

    subscription = network.expect_request()
    subscription.cancel()
    subscription.cancel()

    removed = [event_class for _, event_class in conn.removed_callbacks if event_class == "network.beforeRequestSent"]
    assert len(removed) == 1


def test_concurrent_cancel_detaches_exactly_once():
    conn = FakeConnection()
    network = Network(conn)

    subscription = network.expect_request()
    barrier = threading.Barrier(2)

    def cancel_after_barrier():
        barrier.wait()
        subscription.cancel()

    threads = [threading.Thread(target=cancel_after_barrier) for _ in range(2)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    removed = [event_class for _, event_class in conn.removed_callbacks if event_class == "network.beforeRequestSent"]
    assert len(removed) == 1
