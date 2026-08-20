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

"""Transport-level unit tests for :class:`WebSocketConnection`.

These exercise the concurrency contract of the BiDi transport (per-request
response routing, locked shared state, single-threaded event dispatch, and
clean teardown) without a real browser. Only the network boundary
(``_start_ws``) is replaced with an in-memory fake; all transport logic runs
for real.
"""

import json
import logging
import threading
import time

import pytest

from selenium.common import WebDriverException
from selenium.webdriver.remote.websocket_connection import WebSocketConnection


class FakeWebSocketApp:
    """In-memory stand-in for ``websocket.WebSocketApp``.

    Records every payload sent so a test can learn which command ids were
    written and feed matching responses back through ``_process_message``.
    """

    def __init__(self):
        self.sent = []
        self._lock = threading.Lock()

    def send(self, data):
        with self._lock:
            self.sent.append(json.loads(data))

    def sent_ids(self):
        with self._lock:
            return [payload["id"] for payload in self.sent]

    def close(self):
        pass


class StubConnection(WebSocketConnection):
    """``WebSocketConnection`` wired to an in-memory socket.

    Overriding only ``_start_ws`` replaces the network boundary; locking,
    response routing, and event dispatch are the real implementations.
    """

    def _start_ws(self):
        self._ws = FakeWebSocketApp()
        self._ws_thread = None
        self._open_event.set()


class FakeEvent:
    """Minimal event descriptor matching what ``add_callback`` expects."""

    def __init__(self, name):
        self.event_class = name

    def from_json(self, params):
        return params


def _make_command(method):
    """Build a BiDi-style command generator that echoes its result."""

    def command():
        result = yield {"method": method, "params": {}}
        return result

    return command()


def _feed_response(conn, message_id, result):
    conn._process_message(json.dumps({"id": message_id, "result": result}))


def _feed_event(conn, method, params=None):
    conn._process_message(json.dumps({"method": method, "params": params or {}}))


def _wait_for(predicate, timeout=5.0):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if predicate():
            return True
        time.sleep(0.01)
    return False


@pytest.fixture
def conn():
    connection = StubConnection("ws://localhost:9222", 5, 0.1)
    yield connection
    connection.close()


def test_execute_returns_matching_response(conn):
    sent_id = []

    def respond():
        assert _wait_for(lambda: conn._ws.sent_ids())
        message_id = conn._ws.sent_ids()[0]
        sent_id.append(message_id)
        _feed_response(conn, message_id, {"value": 42})

    responder = threading.Thread(target=respond)
    responder.start()
    result = conn.execute(_make_command("session.status"))
    responder.join()

    assert result == {"value": 42}


def test_concurrent_execute_routes_each_response_to_its_caller(conn):
    count = 25
    results = {}
    barrier = threading.Barrier(count)

    def worker(index):
        barrier.wait()  # maximise overlap on the send path
        results[index] = conn.execute(_make_command(f"cmd-{index}"))

    workers = [threading.Thread(target=worker, args=(i,)) for i in range(count)]
    for worker_thread in workers:
        worker_thread.start()

    # Wait for every command to be written, then answer them in reverse order
    # so a correct routing implementation cannot rely on FIFO ordering.
    assert _wait_for(lambda: len(conn._ws.sent_ids()) == count)
    for payload in reversed(list(conn._ws.sent)):
        _feed_response(conn, payload["id"], {"echo": payload["method"]})

    for worker_thread in workers:
        worker_thread.join(timeout=5)

    assert len(results) == count
    for index in range(count):
        assert results[index] == {"echo": f"cmd-{index}"}


def test_execute_times_out_when_no_response():
    connection = StubConnection("ws://localhost:9222", 0.2, 0.1)
    try:
        with pytest.raises(WebDriverException, match="Timed out waiting for response"):
            connection.execute(_make_command("session.status"))
    finally:
        connection.close()


def test_events_dispatch_on_single_thread(conn):
    seen_threads = []
    done = threading.Event()
    event = FakeEvent("log.entryAdded")

    def callback(_params):
        seen_threads.append(threading.current_thread())
        if len(seen_threads) == 5:
            done.set()

    conn.add_callback(event, callback)
    for _ in range(5):
        _feed_event(conn, "log.entryAdded")

    assert done.wait(5)
    assert len(set(seen_threads)) == 1
    assert seen_threads[0] is conn._dispatcher_thread


def test_callback_exception_is_logged_and_dispatch_continues(conn, caplog):
    delivered = []
    second_ran = threading.Event()
    event = FakeEvent("log.entryAdded")

    def boom(_params):
        raise ValueError("handler blew up")

    def good(_params):
        delivered.append(_params)
        second_ran.set()

    conn.add_callback(event, boom)
    conn.add_callback(event, good)

    with caplog.at_level(logging.ERROR):
        _feed_event(conn, "log.entryAdded", {"n": 1})
        assert second_ran.wait(5)

    # The failing handler must not stop the next handler in the same event...
    assert delivered == [{"n": 1}]
    # ...nor kill the dispatcher for subsequent events.
    second_ran.clear()
    _feed_event(conn, "log.entryAdded", {"n": 2})
    assert second_ran.wait(5)
    assert delivered == [{"n": 1}, {"n": 2}]

    assert any(record.levelno == logging.ERROR for record in caplog.records)
    assert "log.entryAdded" in caplog.text


def test_close_clears_callbacks_and_stops_dispatcher():
    connection = StubConnection("ws://localhost:9222", 5, 0.1)
    connection.add_callback(FakeEvent("log.entryAdded"), lambda _p: None)
    assert connection.callbacks

    connection.close()

    assert connection.callbacks == {}
    assert _wait_for(lambda: not connection._dispatcher_thread.is_alive())


def test_close_wakes_pending_callers():
    connection = StubConnection("ws://localhost:9222", 30, 0.1)
    error = []

    def worker():
        try:
            connection.execute(_make_command("session.status"))
        except WebDriverException as exc:
            error.append(exc)

    caller = threading.Thread(target=worker)
    caller.start()
    assert _wait_for(lambda: connection._ws.sent_ids())

    connection.close()
    caller.join(timeout=5)

    # The blocked caller is released by close() rather than waiting out the
    # 30s timeout, and surfaces a WebDriverException.
    assert not caller.is_alive()
    assert len(error) == 1
