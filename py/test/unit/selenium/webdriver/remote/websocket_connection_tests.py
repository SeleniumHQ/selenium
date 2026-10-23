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

import json
import threading
import time

import pytest

from selenium.common import WebDriverException
from selenium.webdriver.remote.websocket_connection import WebSocketConnection


@pytest.mark.parametrize("interval", [-0.1, 0])
def test_rejects_non_positive_response_wait_interval(interval):
    with pytest.raises(WebDriverException, match="interval must be a positive number"):
        WebSocketConnection("ws://localhost", timeout=1, interval=interval)


class FakeSocket:
    """Stands in for ``WebSocketApp``; ``reply`` decides what the browser sends back for each frame."""

    def __init__(self, connection, reply=None, send_error=None):
        self.connection = connection
        self.reply = reply
        self.send_error = send_error
        self.closed = False

    def send(self, data):
        if self.send_error:
            raise self.send_error
        if self.reply:
            message = self.reply(json.loads(data))
            threading.Thread(target=self.connection._process_message, args=(json.dumps(message),)).start()

    def close(self):
        self.closed = True


def connect(monkeypatch, timeout=5, **socket_options):
    def start_ws(self):
        self._ws = FakeSocket(self, **socket_options)
        self._ws_thread = None
        self._started.set()

    monkeypatch.setattr(WebSocketConnection, "_start_ws", start_ws)
    return WebSocketConnection("ws://localhost", timeout=timeout, interval=0.1)


def echo(payload):
    return {"id": payload["id"], "type": "success", "result": {"echo": payload["params"]}}


def test_accepts_positive_response_wait_interval(monkeypatch):
    connection = connect(monkeypatch, timeout=1)
    assert connection.response_wait_timeout == 1
    assert connection.response_wait_interval == 0.1


def test_returns_reply_without_waiting_for_poll_interval(monkeypatch):
    connection = connect(monkeypatch, reply=echo)
    connection.response_wait_interval = 10

    start = time.monotonic()
    response = connection.send_cmd("session.status", {"value": 1})

    assert response["result"] == {"echo": {"value": 1}}
    assert time.monotonic() - start < 5


def test_correlates_concurrent_replies_by_id(monkeypatch):
    connection = connect(monkeypatch, reply=echo)
    results = {}

    def send(n):
        results[n] = connection.send_cmd("session.status", {"value": n})["result"]["echo"]["value"]

    threads = [threading.Thread(target=send, args=(n,)) for n in range(20)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    assert results == {n: n for n in range(20)}
    assert connection._events == {}
    assert connection._messages == {}


def test_times_out_and_drops_late_reply(monkeypatch):
    connection = connect(monkeypatch, timeout=0.05)

    with pytest.raises(WebDriverException, match="Timed out waiting for response to BiDi command 1"):
        connection.send_cmd("session.status", {})
    connection._process_message(json.dumps({"id": 1, "type": "success", "result": {}}))

    assert connection._events == {}
    assert connection._messages == {}


def test_cleans_up_when_send_fails(monkeypatch):
    connection = connect(monkeypatch, send_error=ConnectionResetError("gone"))

    with pytest.raises(ConnectionResetError):
        connection.send_cmd("session.status", {})

    assert connection._events == {}


def test_releases_waiters_when_socket_closes(monkeypatch):
    connection = connect(monkeypatch, timeout=30)
    threading.Timer(0.05, connection._release_pending).start()

    start = time.monotonic()
    with pytest.raises(WebDriverException, match="connection closed while waiting for response to BiDi command 1"):
        connection.send_cmd("session.status", {})

    assert time.monotonic() - start < 5
    assert connection._events == {}


def test_closes_socket_when_connection_does_not_start(monkeypatch):
    sockets = []

    def start_ws(self):
        self._ws = FakeSocket(self)
        self._ws_thread = None
        sockets.append(self._ws)

    monkeypatch.setattr(WebSocketConnection, "_start_ws", start_ws)

    with pytest.raises(WebDriverException, match="Timed out waiting for connection to start"):
        WebSocketConnection("ws://localhost", timeout=0.05, interval=0.1)

    assert sockets[0].closed
