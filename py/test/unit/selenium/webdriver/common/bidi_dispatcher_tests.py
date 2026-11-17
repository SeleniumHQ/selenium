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
    connection.set_event_receiver(EventDispatcher())
    return connection


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


def test_adding_a_listener_sends_nothing_and_returns_a_unique_id(connection, browser):
    first = contexts(connection).add_load_listener(lambda payload: None)
    second = contexts(connection).add_load_listener(lambda payload: None)

    assert browser.sent == []
    assert first != second


def test_a_listener_receives_its_events_typed_payloads_without_any_subscription(connection, browser):
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put)

    browser.emit("browsingContext.domContentLoaded", load(url="https://other"))
    browser.emit("browsingContext.load", load())

    assert received.get(timeout=5) == NavigationInfo.from_json(load())
    assert received.empty()


def test_payloads_are_applied_to_a_listener_in_arrival_order_one_at_a_time(connection, browser):
    received, running = queue.Queue(), threading.Lock()

    def slow(payload):
        if not running.acquire(blocking=False):
            received.put("overlapping run")
            return
        threading.Event().wait(0.05 if payload.url.endswith("/0") else 0)
        received.put(payload.url)
        running.release()

    contexts(connection).add_load_listener(slow)
    for i in range(5):
        browser.emit("browsingContext.load", load(url=f"https://example.com/{i}"))

    assert [received.get(timeout=5) for _ in range(5)] == [f"https://example.com/{i}" for i in range(5)]


def test_a_running_listener_delays_neither_another_listener_nor_a_command_reply(connection, browser):
    release, other = threading.Event(), queue.Queue()
    contexts(connection).add_load_listener(lambda payload: release.wait(5))
    contexts(connection).add_load_listener(other.put)

    browser.emit("browsingContext.load", load())

    assert other.get(timeout=1) == NavigationInfo.from_json(load())
    assert contexts(connection).get_tree().contexts == []
    release.set()


def test_a_concurrent_listener_is_invoked_with_each_payload_without_waiting_for_earlier_ones(connection, browser):
    started, release = queue.Queue(), threading.Event()

    def blocks(payload):
        started.put(payload.url)
        release.wait(5)

    contexts(connection).add_load_listener(blocks, concurrent=True)
    browser.emit("browsingContext.load", load(url="https://one"))
    browser.emit("browsingContext.load", load(url="https://two"))

    assert {started.get(timeout=5), started.get(timeout=5)} == {"https://one", "https://two"}
    release.set()


def test_a_listener_added_by_event_name_receives_typed_payloads(connection, browser):
    received = queue.Queue()
    contexts(connection).add_listener("browsingContext.load", received.put)

    browser.emit("browsingContext.load", load())

    assert received.get(timeout=5) == NavigationInfo.from_json(load())


def test_adding_a_listener_for_an_event_the_module_does_not_define_is_refused(connection):
    with pytest.raises(ValueError, match="BrowsingContext has no event 'network.beforeRequestSent'"):
        contexts(connection).add_listener("network.beforeRequestSent", lambda payload: None)


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

    assert [received.get(timeout=5), received.get(timeout=5)] == ["https://one", "https://two"]
    record = logged.get(timeout=5)
    assert (record.levelname, record.getMessage()) == ("ERROR", "A listener for browsingContext.load raised")


def test_a_payload_that_fails_validation_is_logged_and_delivered_to_no_listener(connection, browser, logged):
    first, second = queue.Queue(), queue.Queue()
    contexts(connection).add_load_listener(first.put)
    contexts(connection).add_load_listener(second.put)

    browser.emit("browsingContext.load", {"context": "ctx-1", "url": "https://invalid"})
    browser.emit("browsingContext.load", load())

    record = logged.get(timeout=5)
    assert (record.levelname, record.getMessage()) == (
        "ERROR",
        "Dropped a browsingContext.load payload that failed validation",
    )
    assert first.get(timeout=5).url == second.get(timeout=5).url == "https://example.com"


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
    browser.emit("browsingContext.load", load())

    assert browser.sent == []
    assert received.empty()


def test_removing_one_listener_leaves_another_for_the_same_event(connection, browser):
    first, second = queue.Queue(), queue.Queue()
    removed = contexts(connection).add_load_listener(first.put)
    contexts(connection).add_load_listener(second.put)

    contexts(connection).remove_listener(removed)
    browser.emit("browsingContext.load", load())

    assert second.get(timeout=5) == NavigationInfo.from_json(load())
    assert first.empty()


def test_removal_lets_a_running_listener_finish_and_drops_its_queued_payloads(connection, browser):
    started, release, finished = threading.Event(), threading.Event(), queue.Queue()

    def blocks(payload):
        started.set()
        release.wait(5)
        finished.put(payload.url)

    listener = contexts(connection).add_load_listener(blocks)
    browser.emit("browsingContext.load", load(url="https://running"))
    assert started.wait(5)
    browser.emit("browsingContext.load", load(url="https://queued"))

    contexts(connection).remove_listener(listener)
    release.set()

    assert finished.get(timeout=5) == "https://running"
    with pytest.raises(queue.Empty):
        finished.get(timeout=0.2)


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

    assert received.empty()


def test_drain_invokes_every_payload_received_before_it_and_waits_for_them(connection, browser):
    started, release, finished = threading.Event(), threading.Event(), []

    def blocks(payload):
        started.set()
        release.wait(5)
        finished.append(payload.url)

    listener = contexts(connection).add_load_listener(blocks)
    browser.emit("browsingContext.load", load(url="https://running"))
    assert started.wait(5)
    browser.emit("browsingContext.load", load(url="https://queued"))

    threading.Timer(0.2, release.set).start()
    contexts(connection).remove_listener(listener, drain=True)

    assert finished == ["https://running", "https://queued"]
    browser.emit("browsingContext.load", load(url="https://late"))
    assert finished == ["https://running", "https://queued"]


def test_drain_waits_for_every_running_invocation_of_a_concurrent_listener(connection, browser):
    started, release, finished = queue.Queue(), threading.Event(), []

    def blocks(payload):
        started.put(payload.url)
        release.wait(5)
        finished.append(payload.url)

    listener = contexts(connection).add_load_listener(blocks, concurrent=True)
    browser.emit("browsingContext.load", load(url="https://one"))
    browser.emit("browsingContext.load", load(url="https://two"))
    assert {started.get(timeout=5), started.get(timeout=5)} == {"https://one", "https://two"}

    threading.Timer(0.2, release.set).start()
    contexts(connection).remove_listener(listener, drain=True)

    assert sorted(finished) == ["https://one", "https://two"]


def test_a_listener_that_drains_itself_is_refused_instead_of_waiting_on_itself(connection, browser):
    errors, listener = queue.Queue(), None

    def drains(payload):
        try:
            contexts(connection).remove_listener(listener, drain=True)
        except RuntimeError as e:
            errors.put(e)

    listener = contexts(connection).add_load_listener(drains)
    browser.emit("browsingContext.load", load())

    assert "cannot drain itself" in str(errors.get(timeout=5))


def test_closing_the_connection_releases_a_drain_waiting_on_a_running_listener(connection, browser):
    started, release, drained = threading.Event(), threading.Event(), threading.Event()

    def blocks(payload):
        started.set()
        release.wait(5)

    listener = contexts(connection).add_load_listener(blocks)
    browser.emit("browsingContext.load", load())
    assert started.wait(5)
    browser.emit("browsingContext.load", load())

    def drain():
        contexts(connection).remove_listener(listener, drain=True)
        drained.set()

    threading.Thread(target=drain).start()
    assert not drained.wait(0.2)
    connection.close()

    assert drained.wait(5)
    release.set()


def test_closing_the_connection_drops_every_listener(connection, browser):
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put)

    connection.close()
    connection.event_receiver.receive("browsingContext.load", load())

    assert received.empty()
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
