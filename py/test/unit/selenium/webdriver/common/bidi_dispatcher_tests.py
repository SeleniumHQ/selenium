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

"""Unit tests for the BiDi event dispatcher and the generated callback methods that use it.

Runs the generated domains over a real `WebSocketConnection` whose socket is replaced
by `Browser`, which answers each command and can emit events, so registration,
subscription and delivery are tested through the connection's own dispatch.
"""

import json
import logging
import queue
import threading

import pytest

from selenium.common.exceptions import InvalidArgumentException, WebDriverException
from selenium.webdriver.common._bidi.browsing_context import BrowsingContext
from selenium.webdriver.common._bidi.dispatcher import EventDispatcher
from selenium.webdriver.common._bidi.network import Network
from selenium.webdriver.common._bidi.session import SubscribeResult
from selenium.webdriver.common._bidi.transport import Transport
from selenium.webdriver.remote.websocket_connection import WebSocketConnection

REQUEST = {"context": "ctx-1", "request": {"request": "r-1"}}


class Browser:
    """Stands in for ``WebSocketApp``: answers each command on its own thread and emits events on request."""

    def __init__(self, connection):
        self.connection = connection
        self.sent = []
        self.subscribe_error = None
        self.unsubscribe_error = None
        self._subscriptions = 0

    def send(self, data):
        command = json.loads(data)
        self.sent.append(command)
        threading.Thread(target=self._deliver, args=(self._reply(command),)).start()

    def emit(self, method, params):
        self._deliver({"type": "event", "method": method, "params": params})

    def close(self):
        pass

    def commands(self, method):
        return [command["params"] for command in self.sent if command["method"] == method]

    def _reply(self, command):
        error = {"session.subscribe": self.subscribe_error, "session.unsubscribe": self.unsubscribe_error}
        if error.get(command["method"]):
            return {"id": command["id"], "type": "error", "error": error[command["method"]], "message": "refused"}
        if command["method"] != "session.subscribe":
            return {"id": command["id"], "type": "success", "result": {}}
        self._subscriptions += 1
        return {"id": command["id"], "type": "success", "result": {"subscription": f"sub-{self._subscriptions}"}}

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
    connection.set_event_receiver(EventDispatcher(connection))
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


def network(connection):
    return Network(Transport(connection))


def test_adding_a_callback_subscribes_to_its_one_event(connection, browser):
    result = network(connection).add_before_request_sent_callback(
        lambda params: None, contexts=["ctx-1"], user_contexts=["user-1"]
    )

    assert result == SubscribeResult(subscription="sub-1")
    assert browser.commands("session.subscribe") == [
        {"events": ["network.beforeRequestSent"], "contexts": ["ctx-1"], "userContexts": ["user-1"]}
    ]


def test_a_callback_receives_the_raw_params_of_its_event_only(connection, browser):
    received = queue.Queue()
    network(connection).add_before_request_sent_callback(received.put)

    browser.emit("network.responseStarted", {"other": True})
    browser.emit("network.beforeRequestSent", REQUEST)

    assert received.get(timeout=5) == REQUEST
    assert received.empty()


def test_a_callback_is_removed_through_a_different_domain_instance(connection, browser):
    received = queue.Queue()
    subscription = network(connection).add_before_request_sent_callback(received.put).subscription

    BrowsingContext(Transport(connection)).remove_callback(subscription)
    browser.emit("network.beforeRequestSent", REQUEST)

    assert browser.commands("session.unsubscribe") == [{"subscriptions": [subscription]}]
    assert connection.event_receiver._registrations == []
    assert received.empty()


def test_two_callbacks_for_one_event_stay_independent(connection, browser):
    first, second = queue.Queue(), queue.Queue()
    first_subscription = network(connection).add_before_request_sent_callback(first.put).subscription
    second_subscription = network(connection).add_before_request_sent_callback(second.put).subscription

    browser.emit("network.beforeRequestSent", REQUEST)

    assert first_subscription != second_subscription
    assert first.get(timeout=5) == second.get(timeout=5) == REQUEST
    assert first.empty()
    assert second.empty()

    network(connection).remove_callback(first_subscription)
    browser.emit("network.beforeRequestSent", REQUEST)

    assert second.get(timeout=5) == REQUEST
    assert first.empty()


def test_a_failed_subscribe_drops_the_callback_and_raises(connection, browser):
    browser.subscribe_error = "invalid argument"

    with pytest.raises(InvalidArgumentException, match="refused"):
        network(connection).add_before_request_sent_callback(lambda params: None)

    assert connection.event_receiver._registrations == []


def test_a_refused_unsubscribe_still_drops_the_callback_and_raises(connection, browser):
    received = queue.Queue()
    subscription = network(connection).add_before_request_sent_callback(received.put).subscription
    browser.unsubscribe_error = "invalid argument"

    with pytest.raises(InvalidArgumentException, match="refused"):
        network(connection).remove_callback(subscription)
    browser.emit("network.beforeRequestSent", REQUEST)

    assert connection.event_receiver._registrations == []
    assert received.empty()


def test_removing_an_unknown_subscription_raises_without_a_wire_call(connection, browser):
    with pytest.raises(InvalidArgumentException, match="No callback is registered for subscription 'nope'"):
        network(connection).remove_callback("nope")

    assert browser.sent == []


def test_concurrent_removals_of_one_subscription_unsubscribe_once(connection, browser):
    subscription = network(connection).add_before_request_sent_callback(lambda params: None).subscription
    ready = threading.Barrier(5)
    refused = queue.Queue()

    def remove():
        ready.wait()
        try:
            network(connection).remove_callback(subscription)
        except InvalidArgumentException as error:
            refused.put(error)

    threads = [threading.Thread(target=remove) for _ in range(5)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    assert browser.commands("session.unsubscribe") == [{"subscriptions": [subscription]}]
    assert refused.qsize() == 4


def test_a_callback_that_raises_is_logged_and_does_not_stop_another(connection, browser, logged):
    received = queue.Queue()

    def fails(params):
        raise ValueError("boom")

    network(connection).add_before_request_sent_callback(fails)
    network(connection).add_before_request_sent_callback(received.put)

    for _ in range(2):
        browser.emit("network.beforeRequestSent", REQUEST)
        assert received.get(timeout=5) == REQUEST
        assert logged.get(timeout=5).getMessage() == "A callback for network.beforeRequestSent raised"


def test_closing_the_connection_drops_every_callback(connection):
    network(connection).add_before_request_sent_callback(lambda params: None)
    dispatcher = connection.event_receiver

    connection.close()

    assert dispatcher._registrations == []
    with pytest.raises(WebDriverException, match="The BiDi connection is closed"):
        network(connection).add_before_request_sent_callback(lambda params: None)

