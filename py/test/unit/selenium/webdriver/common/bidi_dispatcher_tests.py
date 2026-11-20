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


"""Unit tests for the BiDi event dispatcher and the generated listener methods that use it.

Runs the generated domains over a real `WebSocketConnection` with only `WebSocketApp` replaced by
`RemoteEnd`, so the connection's own reader thread delivers every reply and event in the order the
remote end sent them, as it does against a browser. A listener that held up that thread would stall
the replies queued behind it, which is what the timing assertions below detect.
"""

import json
import logging
import queue
import threading

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.browsing_context import BrowsingContext, NavigationInfo
from selenium.webdriver.common._bidi.dispatcher import EventDispatcher
from selenium.webdriver.common._bidi.network import Network
from selenium.webdriver.common._bidi.transport import Transport
from selenium.webdriver.remote import websocket_connection
from selenium.webdriver.remote.websocket_connection import WebSocketConnection

# Long enough for any thread to be scheduled, short enough that a blocked reader thread fails the test.
PROMPT = 1


def load(url="https://example.com"):
    return {"context": "ctx-1", "navigation": None, "timestamp": 1, "url": url}


class RemoteEnd:
    """Stands in for ``WebSocketApp``: answers each command and emits events on request, in one ordered stream."""

    def __init__(self, url, on_open, on_message, on_error):
        self._on_open = on_open
        self._on_message = on_message
        self._on_error = on_error
        self._inbound = queue.SimpleQueue()
        self._lock = threading.Lock()
        self.sent = []

    def run_forever(self, **options):
        self._on_open(self)
        while (message := self._inbound.get()) is not None:
            # websocket-client hands an exception from a callback to on_error rather than raising it.
            try:
                self._on_message(self, json.dumps(message))
            except Exception as e:
                self._on_error(self, e)

    def send(self, data):
        command = json.loads(data)
        with self._lock:
            self.sent.append(command)
            self._inbound.put({"id": command["id"], "type": "success", "result": self._result(command["method"])})

    def emit(self, method, params):
        self._inbound.put({"type": "event", "method": method, "params": params})

    def close(self):
        self._inbound.put(None)

    @staticmethod
    def _result(method):
        return {"contexts": []} if method == "browsingContext.getTree" else {}


@pytest.fixture
def connection(monkeypatch):
    monkeypatch.setattr(websocket_connection, "WebSocketApp", RemoteEnd)
    connection = WebSocketConnection("ws://localhost", timeout=5)
    yield connection
    connection.close()


@pytest.fixture
def remote_end(connection):
    return connection._ws


@pytest.fixture
def release():
    event = threading.Event()
    yield event
    event.set()


@pytest.fixture
def logged():
    records = queue.Queue()
    handler = logging.Handler()
    handler.emit = records.put
    logger = logging.getLogger("selenium.webdriver.common._bidi.dispatcher")
    logger.addHandler(handler)
    yield records
    logger.removeHandler(handler)


def contexts(connection):
    return BrowsingContext(Transport(connection))


def emit_load(remote_end, url="https://example.com"):
    remote_end.emit("browsingContext.load", load(url=url))


def await_dispatch(connection):
    """The reader handles messages in order, so a reply means every earlier event has been dispatched."""
    contexts(connection).get_tree()


def assert_nothing_arrives(received):
    with pytest.raises(queue.Empty):
        received.get(timeout=0.2)


def blocking_listener(started, release, finished):
    def blocks(payload):
        started.put(payload.url)
        release.wait()
        finished.put(payload.url)

    return blocks


def test_adding_a_listener_sends_nothing_and_returns_a_unique_id(connection, remote_end):
    def listener(payload):
        pass

    first = contexts(connection).add_load_listener(listener)
    second = contexts(connection).add_load_listener(listener)

    assert remote_end.sent == []
    assert first != second


def test_adding_a_listener_requires_a_callable(connection):
    with pytest.raises(TypeError, match="callable"):
        contexts(connection).add_load_listener(None)


def test_a_listener_receives_its_events_typed_payloads_without_any_subscription(connection, remote_end):
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put)

    remote_end.emit("browsingContext.domContentLoaded", load(url="https://other"))
    emit_load(remote_end)

    assert received.get(timeout=5) == NavigationInfo.from_json(load())
    assert_nothing_arrives(received)


def test_a_listener_is_invoked_with_each_payload_without_waiting_for_earlier_invocations(
    connection, remote_end, release
):
    started = queue.Queue()
    contexts(connection).add_load_listener(blocking_listener(started, release, queue.Queue()))

    emit_load(remote_end, "https://one")
    emit_load(remote_end, "https://two")

    assert {started.get(timeout=PROMPT), started.get(timeout=PROMPT)} == {"https://one", "https://two"}


def test_a_running_listener_delays_neither_another_listener_nor_a_command_reply(connection, remote_end, release):
    other = queue.Queue()
    contexts(connection).add_load_listener(lambda payload: release.wait())
    contexts(connection).add_load_listener(other.put)

    emit_load(remote_end)

    assert other.get(timeout=PROMPT) == NavigationInfo.from_json(load())
    assert contexts(connection).get_tree().contexts == []


def test_a_listener_can_send_a_command(connection, remote_end):
    received = queue.Queue()
    contexts(connection).add_load_listener(lambda payload: received.put(contexts(connection).get_tree().contexts))

    emit_load(remote_end)

    assert received.get(timeout=PROMPT) == []


def test_a_listener_that_raises_is_logged_and_still_gets_the_next_payload(connection, remote_end, logged):
    received = queue.Queue()

    def fails_first(payload):
        received.put(payload.url)
        if payload.url == "https://one":
            raise ValueError("boom")

    contexts(connection).add_load_listener(fails_first)
    emit_load(remote_end, "https://one")
    emit_load(remote_end, "https://two")

    assert {received.get(timeout=5), received.get(timeout=5)} == {"https://one", "https://two"}
    record = logged.get(timeout=5)
    assert (record.levelname, record.getMessage()) == ("ERROR", "A listener for browsingContext.load raised")
    assert record.exc_info[0] is ValueError


def test_pytest_fail_in_a_listener_is_logged_although_it_is_not_an_exception(connection, remote_end, logged):
    contexts(connection).add_load_listener(lambda payload: pytest.fail("from a listener"))

    emit_load(remote_end)

    record = logged.get(timeout=5)
    assert (record.levelname, record.getMessage()) == ("ERROR", "A listener for browsingContext.load raised")
    assert record.exc_info[0] is pytest.fail.Exception


def test_a_payload_that_fails_validation_is_logged_and_delivered_to_no_listener(connection, remote_end, logged):
    first, second = queue.Queue(), queue.Queue()
    contexts(connection).add_load_listener(first.put)
    contexts(connection).add_load_listener(second.put)

    remote_end.emit("browsingContext.load", {"context": "ctx-1", "url": "https://invalid"})
    emit_load(remote_end)

    assert first.get(timeout=5).url == second.get(timeout=5).url == "https://example.com"
    assert_nothing_arrives(first)
    record = logged.get(timeout=5)
    assert record.levelname == "ERROR"
    assert record.getMessage().startswith("Dropped a browsingContext.load payload that failed validation: ")


def test_a_payload_for_an_event_with_no_listener_is_dropped_silently(connection, remote_end, logged):
    remote_end.emit("browsingContext.load", {"context": "ctx-1", "url": "https://invalid"})
    await_dispatch(connection)

    assert logged.empty()


def test_removing_a_listener_is_local_and_can_be_repeated_through_any_domain_instance(connection, remote_end):
    received = queue.Queue()
    listener = contexts(connection).add_load_listener(received.put)

    Network(Transport(connection)).remove_listener(listener)
    contexts(connection).remove_listener(listener)
    assert remote_end.sent == []

    emit_load(remote_end)
    assert_nothing_arrives(received)


def test_removing_one_listener_leaves_another_for_the_same_event(connection, remote_end):
    first, second = queue.Queue(), queue.Queue()
    removed = contexts(connection).add_load_listener(first.put)
    contexts(connection).add_load_listener(second.put)

    contexts(connection).remove_listener(removed)
    emit_load(remote_end)

    assert second.get(timeout=5) == NavigationInfo.from_json(load())
    assert_nothing_arrives(first)


def test_removal_returns_at_once_lets_a_running_invocation_finish_and_invokes_nothing_after_it(
    connection, remote_end, release
):
    started, finished = queue.Queue(), queue.Queue()
    listener = contexts(connection).add_load_listener(blocking_listener(started, release, finished))
    emit_load(remote_end, "https://running")
    started.get(timeout=5)

    removal = threading.Thread(target=contexts(connection).remove_listener, args=(listener,), daemon=True)
    removal.start()
    removal.join(PROMPT)
    assert not removal.is_alive()
    emit_load(remote_end, "https://late")
    await_dispatch(connection)
    release.set()

    assert finished.get(timeout=5) == "https://running"
    assert_nothing_arrives(finished)
    assert started.empty()


def test_a_listener_can_remove_itself(connection, remote_end):
    received, removed, listener = queue.Queue(), threading.Event(), None

    def once(payload):
        received.put(payload.url)
        contexts(connection).remove_listener(listener)
        removed.set()

    listener = contexts(connection).add_load_listener(once)
    emit_load(remote_end, "https://one")
    assert removed.wait(5)
    emit_load(remote_end, "https://two")

    assert received.get(timeout=5) == "https://one"
    assert_nothing_arrives(received)


def test_closing_the_connection_drops_every_listener_and_refuses_new_ones(connection):
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put)

    connection.close()
    connection.event_receiver.receive("browsingContext.load", load())

    assert_nothing_arrives(received)
    with pytest.raises(WebDriverException, match="The BiDi connection is closed"):
        contexts(connection).add_load_listener(lambda payload: None)


def test_the_socket_going_away_drops_every_listener_and_refuses_new_ones(connection, remote_end):
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put)

    remote_end.close()
    connection._ws_thread.join(5)
    connection.event_receiver.receive("browsingContext.load", load())

    assert_nothing_arrives(received)
    with pytest.raises(WebDriverException, match="The BiDi connection is closed"):
        contexts(connection).add_load_listener(lambda payload: None)


def test_a_first_listener_on_a_connection_that_already_closed_is_refused(connection):
    connection.close()

    with pytest.raises(WebDriverException, match="The BiDi connection is closed"):
        contexts(connection).add_load_listener(lambda payload: None)


def test_a_listener_can_close_the_connection(connection, remote_end):
    closed = threading.Event()

    def closes(payload):
        connection.close()
        closed.set()

    contexts(connection).add_load_listener(closes)
    emit_load(remote_end)

    assert closed.wait(5)
    assert not connection._ws_thread.is_alive()


def test_no_event_receiver_is_attached_until_a_listener_is_added(connection):
    assert connection.event_receiver is None

    contexts(connection).add_load_listener(lambda payload: None)

    assert isinstance(connection.event_receiver, EventDispatcher)


def test_the_legacy_callbacks_still_receive_raw_params_beside_a_listener(connection, remote_end):
    class LoadEvent:
        event_class = "browsingContext.load"

        @staticmethod
        def from_json(params):
            return params

    raw, received = queue.Queue(), queue.Queue()
    contexts(connection).add_load_listener(received.put)
    connection.add_callback(LoadEvent, raw.put)

    emit_load(remote_end)

    assert raw.get(timeout=5) == load()
    assert received.get(timeout=5) == NavigationInfo.from_json(load())
