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
by `Browser`, which answers each command and can emit events, so registration,
subscription, scoping and delivery are tested through the connection's own dispatch.
"""

import json
import logging
import queue
import threading

import pytest

from selenium.common.exceptions import InvalidArgumentException, WebDriverException
from selenium.webdriver.common._bidi.browsing_context import BrowsingContext, NavigationInfo
from selenium.webdriver.common._bidi.dispatcher import EventDispatcher
from selenium.webdriver.common._bidi.network import Network
from selenium.webdriver.common._bidi.script import Script
from selenium.webdriver.common._bidi.session import Session, SubscribeResult
from selenium.webdriver.common._bidi.transport import Transport
from selenium.webdriver.remote.websocket_connection import WebSocketConnection


def load(context="ctx-1", url="https://example.com"):
    return {"context": context, "navigation": None, "timestamp": 1, "url": url}


def info(context, user_context="default", children=()):
    return {
        "context": context,
        "children": list(children),
        "clientWindow": "window-1",
        "originalOpener": None,
        "url": "about:blank",
        "userContext": user_context,
    }


class Browser:
    """Stands in for ``WebSocketApp``: answers each command on its own thread and emits events on request."""

    def __init__(self, connection):
        self.connection = connection
        self.sent = []
        self.tree = []
        self.subscribe_error = None
        self.during_unsubscribe = None
        self._subscriptions = []
        self._lock = threading.Lock()

    def send(self, data):
        command = json.loads(data)
        self.sent.append(command)
        if command["method"] == "session.unsubscribe" and self.during_unsubscribe:
            self.during_unsubscribe()
        threading.Thread(target=self._deliver, args=(self._reply(command),)).start()

    def emit(self, method, params):
        self._deliver({"type": "event", "method": method, "params": params})

    def close(self):
        pass

    def commands(self, method):
        return [command["params"] for command in self.sent if command["method"] == method]

    def _reply(self, command):
        method, params = command["method"], command["params"]
        if method == "browsingContext.getTree":
            return self._success(command, {"contexts": self.tree})
        if method == "session.subscribe":
            if self.subscribe_error:
                return self._error(command, self.subscribe_error, "refused")
            with self._lock:
                self._subscriptions.append(f"sub-{len(self._subscriptions) + 1}")
                return self._success(command, {"subscription": self._subscriptions[-1]})
        if method == "session.unsubscribe":
            with self._lock:
                if not set(params["subscriptions"]) <= set(self._subscriptions):
                    return self._error(command, "invalid argument", "no such subscription")
                self._subscriptions = [s for s in self._subscriptions if s not in params["subscriptions"]]
        return self._success(command, {})

    def _success(self, command, result):
        return {"id": command["id"], "type": "success", "result": result}

    def _error(self, command, error, message):
        return {"id": command["id"], "type": "error", "error": error, "message": message}

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


def contexts(connection):
    return BrowsingContext(Transport(connection))


def test_adding_a_listener_subscribes_to_its_one_event(connection, browser):
    result = contexts(connection).add_load_listener(lambda payload: None)

    assert result == SubscribeResult(subscription="sub-1")
    assert browser.commands("session.subscribe") == [{"events": ["browsingContext.load"]}]


@pytest.mark.parametrize(
    ("scope", "sent"),
    [
        ({"browsing_context": "ctx-1"}, {"contexts": ["ctx-1"]}),
        ({"user_context": "user-1"}, {"userContexts": ["user-1"]}),
    ],
)
def test_a_listener_subscribes_with_its_scope(connection, browser, scope, sent):
    contexts(connection).add_load_listener(lambda payload: None, **scope)

    assert browser.commands("session.subscribe") == [{"events": ["browsingContext.load"], **sent}]


def test_a_listener_takes_one_kind_of_scope(connection, browser):
    with pytest.raises(InvalidArgumentException, match="not both"):
        contexts(connection).add_load_listener(lambda payload: None, browsing_context="ctx-1", user_context="user-1")

    assert browser.sent == []


def test_a_listener_receives_the_typed_payload_of_its_event_only(connection, browser):
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put)

    browser.emit("browsingContext.domContentLoaded", load())
    browser.emit("browsingContext.load", load())

    assert received.get(timeout=5) == NavigationInfo.from_json(load())
    assert received.empty()


def test_a_payload_that_fails_validation_is_logged_and_not_delivered(connection, browser, logged):
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put)

    browser.emit("browsingContext.load", {"context": "ctx-1", "url": "https://example.com"})

    record = logged.get(timeout=5)
    assert record.levelname == "ERROR"
    assert record.getMessage() == "Dropped a browsingContext.load payload that failed validation"
    assert received.empty()


def test_a_listener_is_removed_through_a_different_domain_instance(connection, browser):
    received = queue.Queue()
    subscription = contexts(connection).add_load_listener(received.put)

    Network(Transport(connection)).remove_listener(subscription)
    browser.emit("browsingContext.load", load())

    assert browser.commands("session.unsubscribe") == [{"subscriptions": ["sub-1"]}]
    assert connection.event_receiver._registrations == []
    assert received.empty()


def test_two_listeners_for_one_event_stay_independent(connection, browser):
    first, second = queue.Queue(), queue.Queue()
    first_subscription = contexts(connection).add_load_listener(first.put)
    second_subscription = contexts(connection).add_load_listener(second.put)

    browser.emit("browsingContext.load", load())

    assert first_subscription != second_subscription
    assert first.get(timeout=5) == second.get(timeout=5) == NavigationInfo.from_json(load())
    assert first.empty()
    assert second.empty()

    contexts(connection).remove_listener(first_subscription)
    browser.emit("browsingContext.load", load())

    assert second.get(timeout=5) == NavigationInfo.from_json(load())
    assert first.empty()


def test_a_failed_subscribe_drops_the_listener_and_raises(connection, browser):
    browser.subscribe_error = "invalid argument"

    with pytest.raises(InvalidArgumentException, match="refused"):
        contexts(connection).add_load_listener(lambda payload: None)

    assert connection.event_receiver._registrations == []


def test_a_refused_unsubscribe_still_drops_the_listener_and_raises(connection, browser):
    received = queue.Queue()
    subscription = contexts(connection).add_load_listener(received.put)
    Session(Transport(connection)).unsubscribe(subscriptions=[subscription.subscription])

    with pytest.raises(InvalidArgumentException, match="no such subscription"):
        contexts(connection).remove_listener(subscription)
    browser.emit("browsingContext.load", load())

    assert connection.event_receiver._registrations == []
    assert received.empty()


def test_a_payload_sent_before_the_unsubscribe_reply_is_dropped(connection, browser):
    received = queue.Queue()
    subscription = contexts(connection).add_load_listener(received.put)
    browser.during_unsubscribe = lambda: browser.emit("browsingContext.load", load())

    contexts(connection).remove_listener(subscription)

    assert received.empty()


def test_removing_a_listener_twice_raises_because_the_remote_end_rejects_it(connection, browser):
    subscription = contexts(connection).add_load_listener(lambda payload: None)
    contexts(connection).remove_listener(subscription)

    with pytest.raises(InvalidArgumentException, match="no such subscription"):
        contexts(connection).remove_listener(subscription)

    assert browser.commands("session.unsubscribe") == [{"subscriptions": ["sub-1"]}] * 2


def test_concurrent_removals_of_one_subscription_each_return_or_raise(connection, browser):
    subscription = contexts(connection).add_load_listener(lambda payload: None)
    ready = threading.Barrier(5)
    refused = queue.Queue()

    def remove():
        ready.wait()
        try:
            contexts(connection).remove_listener(subscription)
        except InvalidArgumentException as error:
            refused.put(error)

    threads = [threading.Thread(target=remove) for _ in range(5)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    assert browser.commands("session.unsubscribe") == [{"subscriptions": ["sub-1"]}] * 5
    assert refused.qsize() == 4
    assert connection.event_receiver._registrations == []


def test_a_listener_that_raises_is_logged_and_does_not_stop_another(connection, browser, logged):
    received = queue.Queue()

    def fails(payload):
        raise ValueError("boom")

    contexts(connection).add_load_listener(fails)
    contexts(connection).add_load_listener(received.put)

    for _ in range(2):
        browser.emit("browsingContext.load", load())
        assert received.get(timeout=5) == NavigationInfo.from_json(load())
        record = logged.get(timeout=5)
        assert (record.levelname, record.getMessage()) == ("ERROR", "A listener for browsingContext.load raised")


def test_a_running_listener_delays_neither_the_next_payload_nor_a_command(connection, browser):
    started, release = queue.Queue(), threading.Event()

    def blocks(payload):
        started.put(payload.url)
        release.wait(5)

    contexts(connection).add_load_listener(blocks)

    browser.emit("browsingContext.load", load(url="https://one"))
    browser.emit("browsingContext.load", load(url="https://two"))

    assert {started.get(timeout=5), started.get(timeout=5)} == {"https://one", "https://two"}
    assert contexts(connection).get_tree().contexts == []
    release.set()


def test_a_listener_can_send_a_command(connection, browser):
    received = queue.Queue()
    contexts(connection).add_load_listener(lambda payload: received.put(contexts(connection).get_tree().contexts))

    browser.emit("browsingContext.load", load())

    assert received.get(timeout=5) == []


def test_a_listener_scoped_to_a_context_gets_its_whole_page_and_nothing_else(connection, browser):
    browser.tree = [info("top-1", children=[info("frame-1")]), info("top-2")]
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put, browsing_context="frame-1")

    browser.emit("browsingContext.load", load("top-2"))
    browser.emit("browsingContext.load", load("top-1"))
    browser.emit("browsingContext.load", load("frame-1"))

    assert {received.get(timeout=5).context, received.get(timeout=5).context} == {"top-1", "frame-1"}
    assert received.empty()


def test_a_listener_scoped_to_a_user_context_resolves_each_payloads_page(connection, browser):
    browser.tree = [info("top-1", "user-1", children=[info("frame-1", "user-1")]), info("top-2", "user-2")]
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put, user_context="user-1")

    browser.emit("browsingContext.load", load("top-2"))
    browser.emit("browsingContext.load", load("frame-1"))

    assert received.get(timeout=5).context == "frame-1"
    assert received.empty()


def test_a_scoped_listener_learns_of_a_context_created_after_it(connection, browser):
    browser.tree = [info("top-1")]
    received = queue.Queue()
    contexts(connection).add_load_listener(received.put, browsing_context="top-1")
    browser.tree = [info("top-1", children=[info("frame-1")])]

    browser.emit("browsingContext.load", load("frame-1"))

    assert received.get(timeout=5).context == "frame-1"


def test_a_payload_with_no_context_reaches_only_unscoped_listeners(connection, browser):
    browser.tree = [info("top-1")]
    scoped, unscoped = queue.Queue(), queue.Queue()
    Script(Transport(connection)).add_realm_destroyed_listener(scoped.put, browsing_context="top-1")
    Script(Transport(connection)).add_realm_destroyed_listener(unscoped.put)

    browser.emit("script.realmDestroyed", {"realm": "realm-1"})

    assert unscoped.get(timeout=5).realm == "realm-1"
    assert scoped.empty()


def test_closing_the_connection_drops_every_listener(connection):
    contexts(connection).add_load_listener(lambda payload: None)
    dispatcher = connection.event_receiver

    connection.close()

    assert dispatcher._registrations == []
    with pytest.raises(WebDriverException, match="The BiDi connection is closed"):
        contexts(connection).add_load_listener(lambda payload: None)
