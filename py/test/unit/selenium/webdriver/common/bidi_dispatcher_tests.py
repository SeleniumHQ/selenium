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

Runs the generated domains over a real `WebSocketConnection` whose socket is replaced
by `Browser`, which answers each command and can emit events, so registration, removal
and delivery are tested through the connection's own dispatch. Each test is one rule of
the low-level event record (18299) and doubles as a conformance scenario for the other bindings.
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
from selenium.webdriver.common._bidi.session import Session
from selenium.webdriver.common._bidi.transport import Transport
from selenium.webdriver.remote.websocket_connection import WebSocketConnection


def load(context="ctx-1", url="https://example.com"):
    return {"context": context, "navigation": None, "timestamp": 1, "url": url}


class Browser:
    """Stands in for ``WebSocketApp``: answers each command on its own thread and emits events on request."""

    def __init__(self, connection):
        self.connection = connection
        self.sent = []
        self.before_subscribe_reply = None

    def send(self, data):
        command = json.loads(data)
        self.sent.append(command)
        if command["method"] == "session.subscribe" and self.before_subscribe_reply:
            self.before_subscribe_reply()
        threading.Thread(target=self._deliver, args=(self._reply(command),)).start()

    def emit(self, method, params):
        self._deliver({"type": "event", "method": method, "params": params})

    def close(self):
        pass

    def _reply(self, command):
        result = {}
        if command["method"] == "browsingContext.getTree":
            result = {"contexts": []}
        elif command["method"] == "session.subscribe":
            result = {"subscription": "sub-1"}
        return {"id": command["id"], "type": "success", "result": result}

    def _deliver(self, message):
        self.connection._process_message(json.dumps(message))


@pytest.fixture
def connection(monkeypatch):
    def start_ws(self):
        self._ws = Browser(self)
        self._ws_thread = None
        self._started.set()

    monkeypatch.setattr(WebSocketConnection, "_start_ws", start_ws)
    connection = WebSocketConnection("ws://localhost", timeout=5)
    yield connection
    connection.close()


@pytest.fixture
def browser(connection):
    return connection._ws


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


def blocking_listener(started, release, finished):
    def blocks(payload):
        started.put(payload.url)
        release.wait(5)
        finished.put(payload.url)

    return blocks


def test_adding_a_listener_sends_nothing_and_returns_a_unique_id(connection, browser):
    def listener(payload):
        pass

    first = contexts(connection).add_load_listener(listener)
    second = contexts(connection).add_load_listener(listener)

    assert browser.sent == []
    assert first != second


def test_adding_a_listener_requires_a_callable(connection):
    with pytest.raises(TypeError, match="callable"):
        contexts(connection).add_load_listener(None)


def test_a_listener_receives_its_events_typed_payloads_without_any_subscription(connection, browser):
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put)

    browser.emit("browsingContext.domContentLoaded", load(url="https://other"))
    browser.emit("browsingContext.load", load())

    assert received.get(timeout=5) == NavigationInfo.from_json(load())
    with pytest.raises(queue.Empty):
        received.get(timeout=0.2)


def test_a_listener_is_invoked_with_each_payload_without_waiting_for_earlier_invocations(connection, browser):
    started, release = queue.Queue(), threading.Event()
    contexts(connection).add_load_listener(blocking_listener(started, release, queue.Queue()))

    browser.emit("browsingContext.load", load(url="https://one"))
    browser.emit("browsingContext.load", load(url="https://two"))

    assert {started.get(timeout=5), started.get(timeout=5)} == {"https://one", "https://two"}
    release.set()


def test_a_running_listener_delays_neither_another_listener_nor_a_command_reply(connection, browser):
    release, other = threading.Event(), queue.Queue()
    contexts(connection).add_load_listener(lambda payload: release.wait(5))
    contexts(connection).add_load_listener(other.put)

    browser.emit("browsingContext.load", load())

    assert other.get(timeout=1) == NavigationInfo.from_json(load())
    assert contexts(connection).get_tree().contexts == []
    release.set()


def test_a_listener_can_send_a_command(connection, browser):
    received = queue.Queue()
    contexts(connection).add_load_listener(lambda payload: received.put(contexts(connection).get_tree().contexts))

    browser.emit("browsingContext.load", load())

    assert received.get(timeout=5) == []


def test_a_listener_that_raises_is_logged_and_still_gets_the_next_payload(connection, browser, logged):
    received = queue.Queue()

    def fails_first(payload):
        received.put(payload.url)
        if payload.url == "https://one":
            raise ValueError("boom")

    contexts(connection).add_load_listener(fails_first)
    browser.emit("browsingContext.load", load(url="https://one"))
    browser.emit("browsingContext.load", load(url="https://two"))

    assert {received.get(timeout=5), received.get(timeout=5)} == {"https://one", "https://two"}
    record = logged.get(timeout=5)
    assert (record.levelname, record.getMessage()) == ("ERROR", "A listener for browsingContext.load raised")
    assert record.exc_info[0] is ValueError


def fails_an_assert(url):
    assert url == "https://two"


def calls_pytest_fail(url):
    pytest.fail(f"unexpected {url}")


@pytest.mark.parametrize(
    ("check", "error"),
    [(fails_an_assert, AssertionError), (calls_pytest_fail, pytest.fail.Exception)],
)
def test_a_failed_test_assertion_in_a_listener_is_logged(connection, browser, logged, check, error):
    received = queue.Queue()

    def asserts(payload):
        received.put(payload.url)
        if payload.url == "https://one":
            check(payload.url)

    contexts(connection).add_load_listener(asserts)
    browser.emit("browsingContext.load", load(url="https://one"))
    browser.emit("browsingContext.load", load(url="https://two"))

    assert {received.get(timeout=5), received.get(timeout=5)} == {"https://one", "https://two"}
    record = logged.get(timeout=5)
    assert (record.levelname, record.getMessage()) == ("ERROR", "A listener for browsingContext.load raised")
    assert record.exc_info[0] is error


def test_a_payload_that_fails_validation_is_logged_and_delivered_to_no_listener(connection, browser, logged):
    first, second = queue.Queue(), queue.Queue()
    contexts(connection).add_load_listener(first.put)
    contexts(connection).add_load_listener(second.put)

    browser.emit("browsingContext.load", {"context": "ctx-1", "url": "https://invalid"})
    browser.emit("browsingContext.load", load())

    record = logged.get(timeout=5)
    assert record.levelname == "ERROR"
    assert record.getMessage().startswith("Dropped a browsingContext.load payload that failed validation: ")
    assert first.get(timeout=5).url == second.get(timeout=5).url == "https://example.com"
    with pytest.raises(queue.Empty):
        first.get(timeout=0.2)


def test_a_payload_for_an_event_with_no_listener_is_dropped_silently(connection, browser, logged):
    browser.emit("browsingContext.load", {"context": "ctx-1", "url": "https://invalid"})

    assert logged.empty()


def test_payloads_sent_before_the_subscribe_reply_reach_a_listener_added_first(connection, browser):
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put)
    browser.before_subscribe_reply = lambda: browser.emit("browsingContext.load", load())

    Session(Transport(connection)).subscribe(events=["browsingContext.load"])

    assert received.get(timeout=5) == NavigationInfo.from_json(load())


def test_removing_a_listener_is_local_and_can_be_repeated_through_any_domain_instance(connection, browser):
    received = queue.Queue()
    listener = contexts(connection).add_load_listener(received.put)

    Network(Transport(connection)).remove_listener(listener)
    contexts(connection).remove_listener(listener)
    assert browser.sent == []

    browser.emit("browsingContext.load", load())
    with pytest.raises(queue.Empty):
        received.get(timeout=0.2)


def test_removing_one_listener_leaves_another_for_the_same_event(connection, browser):
    first, second = queue.Queue(), queue.Queue()
    removed = contexts(connection).add_load_listener(first.put)
    contexts(connection).add_load_listener(second.put)

    contexts(connection).remove_listener(removed)
    browser.emit("browsingContext.load", load())

    assert second.get(timeout=5) == NavigationInfo.from_json(load())
    with pytest.raises(queue.Empty):
        first.get(timeout=0.2)


def test_removal_returns_at_once_lets_a_running_invocation_finish_and_invokes_nothing_after_it(connection, browser):
    started, release, finished = queue.Queue(), threading.Event(), queue.Queue()
    listener = contexts(connection).add_load_listener(blocking_listener(started, release, finished))
    browser.emit("browsingContext.load", load(url="https://running"))
    started.get(timeout=5)

    contexts(connection).remove_listener(listener)
    browser.emit("browsingContext.load", load(url="https://late"))
    release.set()

    assert finished.get(timeout=5) == "https://running"
    with pytest.raises(queue.Empty):
        finished.get(timeout=0.2)
    assert started.empty()


def test_a_listener_can_remove_itself(connection, browser):
    received, removed, listener = queue.Queue(), threading.Event(), None

    def once(payload):
        received.put(payload.url)
        contexts(connection).remove_listener(listener)
        removed.set()

    listener = contexts(connection).add_load_listener(once)
    browser.emit("browsingContext.load", load(url="https://one"))
    assert removed.wait(5)
    browser.emit("browsingContext.load", load(url="https://two"))

    assert received.get(timeout=5) == "https://one"
    with pytest.raises(queue.Empty):
        received.get(timeout=0.2)


def test_closing_the_connection_drops_every_listener_and_refuses_new_ones(connection, browser):
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put)

    connection.close()
    connection.event_receiver.receive("browsingContext.load", load())

    with pytest.raises(queue.Empty):
        received.get(timeout=0.2)
    with pytest.raises(WebDriverException, match="The BiDi connection is closed"):
        contexts(connection).add_load_listener(lambda payload: None)


def test_a_first_listener_on_a_connection_that_already_closed_is_refused(connection):
    connection.close()

    with pytest.raises(WebDriverException, match="The BiDi connection is closed"):
        contexts(connection).add_load_listener(lambda payload: None)


def test_a_listener_can_close_the_connection(connection, browser):
    closed = threading.Event()

    def closes(payload):
        connection.close()
        closed.set()

    contexts(connection).add_load_listener(closes)
    browser.emit("browsingContext.load", load())

    assert closed.wait(5)


def test_no_event_receiver_is_attached_until_a_listener_is_added(connection):
    assert connection.event_receiver is None

    contexts(connection).add_load_listener(lambda payload: None)

    assert isinstance(connection.event_receiver, EventDispatcher)


def test_the_legacy_callbacks_still_receive_raw_params_beside_a_listener(connection, browser):
    class LoadEvent:
        event_class = "browsingContext.load"

        @staticmethod
        def from_json(params):
            return params

    raw, received = queue.Queue(), queue.Queue()
    contexts(connection).add_load_listener(received.put)
    connection.add_callback(LoadEvent, raw.put)

    browser.emit("browsingContext.load", load())

    assert raw.get(timeout=5) == load()
    assert received.get(timeout=5) == NavigationInfo.from_json(load())
