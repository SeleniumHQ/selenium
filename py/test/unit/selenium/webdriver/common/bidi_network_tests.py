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

from selenium.webdriver.common.bidi.network import Network, Request


class FakeConnection:
    def __init__(self):
        self.commands = []
        self.added_callbacks = []
        self.removed_callbacks = []
        self._next_callback_id = 1

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

        if payload["method"] == "network.addIntercept":
            response = {"intercept": "intercept-1"}
        elif payload["method"] == "session.subscribe":
            response = {"subscription": "subscription-1"}
        else:
            response = {}

        try:
            cmd.send(response)
        except StopIteration as exc:
            return exc.value

        raise AssertionError("BiDi command generator did not finish")


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
